import { Router } from "express";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { createDemoSessionCookie, optionalDemoSession } from "../middleware/demo-session";

export const authRouter = Router();

authRouter.post("/demo", async (_req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: env.DEMO_USER_EMAIL },
      select: { id: true, email: true },
    });
    res.setHeader("Set-Cookie", createDemoSessionCookie(user.email));
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", optionalDemoSession, async (req, res, next) => {
  try {
    if (!req.demoUser) {
      res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Demo session required." } });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.demoUser.id, state: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      select: { state: true, currentPeriodEnd: true },
    });
    res.json({
      user: req.demoUser,
      subscription,
      canViewNutrition: Boolean(subscription),
    });
  } catch (error) {
    next(error);
  }
});
