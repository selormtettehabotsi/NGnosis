import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

/**
 * Middleware that runs AFTER requireAuth.
 * Blocks access if the user's email is not yet verified.
 */
export async function requireVerified(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const reqUser = req.user;
  if (!reqUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, reqUser.id),
  });

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      error: "Email not verified",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  return next();
}
