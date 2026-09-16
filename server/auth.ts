import type { NextFunction, Request, Response } from "express";
import { auth } from "./firebase-admin";
import { unauthorized } from "./errors";

export interface AuthUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  [key: string]: unknown;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      throw unauthorized("Missing authentication token");
    }
    const decoded = await auth.verifyIdToken(token);
    res.locals.user = decoded as AuthUser;
    next();
  } catch (error: any) {
    if (error?.statusCode === 401) {
      next(error);
    } else {
      console.warn("ID token verification failed:", error?.code || error?.message || error);
      next(unauthorized("Invalid or expired authentication token", "invalid_token"));
    }
  }
}

export function currentUser(res: Response): AuthUser {
  return res.locals.user as AuthUser;
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (token) {
      const decoded = await auth.verifyIdToken(token);
      res.locals.user = decoded as AuthUser;
    }
  } catch {
    // Optional auth: proceed as unauthenticated without throwing
  }
  next();
}

export function optionalCurrentUser(res: Response): AuthUser | null {
  return (res.locals.user as AuthUser) || null;
}