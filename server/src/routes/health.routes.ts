import { Router } from "express";
import { prisma } from "../db/prisma";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

healthRouter.get("/health/ready", async (_req, res, next) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.json({ status: "ready" });
  } catch (error) {
    next(error);
  }
});
