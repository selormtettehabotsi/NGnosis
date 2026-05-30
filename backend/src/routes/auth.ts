import crypto from "node:crypto";
import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, verificationCodes } from "../db/schema";
import { requireAuth, signToken } from "../auth/jwt";
import { sendVerificationEmail } from "../email";

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;
const CODE_EXPIRY_MINUTES = 10;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "" || !trimmed.includes("@")) {
    return null;
  }
  return trimmed;
}

function isSqliteUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createAndSendCode(userId: string, email: string): Promise<void> {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(verificationCodes).values({
    id: crypto.randomUUID(),
    userId,
    code,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  });

  await sendVerificationEmail(email, code);
}

// ── Register ────────────────────────────────────────────────────────────────
router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { password } = req.body ?? {};
    const email = normalizeEmail(req.body?.email);

    if (email === null) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      await db.insert(users).values({
        id,
        email,
        passwordHash,
        createdAt: now,
      });
    } catch (err) {
      if (isSqliteUniqueViolation(err)) {
        return res.status(409).json({ error: "Email already registered" });
      }
      throw err;
    }

    // Send a verification code
    try {
      await createAndSendCode(id, email);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
      // Still return success — user can resend the code later
    }

    // Return a token so the frontend can call /auth/verify and /auth/resend-code
    const token = signToken({ userId: id, email });
    return res.status(201).json({
      user: { id, email, emailVerified: false },
      token,
      message: "Account created. Please check your email for a verification code.",
    });
  } catch (err) {
    console.error("Registration failed:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ── Verify email code ───────────────────────────────────────────────────────
router.post("/auth/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const { code } = req.body ?? {};
    const userId = req.user!.id;

    if (typeof code !== "string" || code.trim().length !== 6) {
      return res.status(400).json({ error: "A 6-digit code is required" });
    }

    const now = new Date().toISOString();

    // Find the latest unused code for this user that hasn't expired
    const record = await db.query.verificationCodes.findFirst({
      where: and(
        eq(verificationCodes.userId, userId),
        eq(verificationCodes.code, code.trim()),
      ),
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (record.usedAt) {
      return res.status(400).json({ error: "This code has already been used" });
    }

    if (new Date(record.expiresAt) < new Date(now)) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    // Mark the code as used
    await db
      .update(verificationCodes)
      .set({ usedAt: now })
      .where(eq(verificationCodes.id, record.id));

    // Mark the user's email as verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId));

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verification failed:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// ── Resend verification code ────────────────────────────────────────────────
router.post("/auth/resend-code", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email;

    // Check if already verified
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    await createAndSendCode(userId, email);
    return res.status(200).json({ message: "Verification code sent" });
  } catch (err) {
    console.error("Resend code failed:", err);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
});

// ── Login ───────────────────────────────────────────────────────────────────
router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { password } = req.body ?? {};
    const email = normalizeEmail(req.body?.email);

    if (email === null || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return res.status(200).json({
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
      token,
    });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ── Get current user ────────────────────────────────────────────────────────
router.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
  const reqUser = req.user;
  if (!reqUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, reqUser.id),
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  });
});

export default router;
