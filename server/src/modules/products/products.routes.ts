import { Router } from "express";
import { z } from "zod";
import { optionalDemoSession } from "../../middleware/demo-session";
import { ProductsService } from "./products.service";

const querySchema = z.object({
  q: z.string().trim().min(2).max(100),
  lang: z.string().trim().default("en"),
});

export const productsRouter = Router();
const productsService = new ProductsService();

productsRouter.get("/search", optionalDemoSession, async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const result = await productsService.search({
      term: query.q,
      locale: query.lang,
      userId: req.demoUser?.id,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
