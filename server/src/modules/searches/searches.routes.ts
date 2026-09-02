import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { optionalDemoSession } from "../../middleware/demo-session";

export const searchesRouter = Router();

searchesRouter.get("/recent", optionalDemoSession, async (req, res, next) => {
  try {
    if (!req.demoUser) {
      res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Demo session required." } });
      return;
    }
    const limit = z.coerce.number().int().min(1).max(20).default(10).parse(req.query.limit);
    const searches = await prisma.search.findMany({
      where: { userId: req.demoUser.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, term: true, locale: true, resultCount: true, createdAt: true },
    });
    res.json({ searches });
  } catch (error) {
    next(error);
  }
});
