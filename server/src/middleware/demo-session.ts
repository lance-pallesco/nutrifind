/* eslint-disable @typescript-eslint/no-namespace */
import type { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "../db/prisma";
import { env } from "../config/env";

const COOKIE_NAME = "nutrifind_demo_session";

declare global {
  namespace Express {
    interface Request {
      demoUser?: { id: string; email: string };
    }
  }
}

function sign(value: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("base64url");
}

function encode(email: string) {
  const value = Buffer.from(email, "utf8").toString("base64url");
  return value + "." + sign(value);
}

function decode(value: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function createDemoSessionCookie(email: string) {
  return [
    COOKIE_NAME + "=" + encode(email),
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    env.NODE_ENV === "production" ? "Secure" : "",
    "Max-Age=604800",
  ]
    .filter(Boolean)
    .join("; ");
}

function readCookie(header: string | undefined) {
  const value = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(COOKIE_NAME + "="))
    ?.slice(COOKIE_NAME.length + 1);
  return value ? decode(value) : null;
}

export async function optionalDemoSession(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const email = readCookie(req.header("cookie"));
    if (email) {
      req.demoUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      }) ?? undefined;
    }
    next();
  } catch (error) {
    next(error);
  }
}
