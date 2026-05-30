import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

export type AuthPayload = {
  sub: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signToken(user: { userId: string; email: string }): string {
  const expiresRaw = process.env.JWT_EXPIRES_IN?.trim();
  const options: SignOptions = {
    subject: user.userId,
    expiresIn: (expiresRaw && expiresRaw.length > 0 ? expiresRaw : "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ email: user.email }, getJwtSecret(), options);
}

export function verifyToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
  const sub = decoded.sub;
  const email = decoded.email;
  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub, email };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length).trim();
  if (token === "") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { sub, email } = verifyToken(token);
    req.user = { id: sub, email };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
