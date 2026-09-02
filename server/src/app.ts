import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error-handler";
import { requestContext } from "./middleware/request-context";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { productsRouter } from "./modules/products/products.routes";
import { searchesRouter } from "./modules/searches/searches.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(requestContext);
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/searches", searchesRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
