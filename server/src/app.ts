import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error-handler";
import { requestContext } from "./middleware/request-context";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { productsRouter } from "./modules/products/products.routes";
import { searchesRouter } from "./modules/searches/searches.routes";
import { billingRouter, stripeWebhookRouter } from "./modules/billing/billing.routes";

export function createApp() {
  const app = express();
  const allowedOrigins = env.WEB_ORIGINS.split(",").map((origin) => origin.trim());

  app.disable("x-powered-by");
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }));
  app.use(requestContext);
  app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/billing/webhook", stripeWebhookRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/searches", searchesRouter);
  app.use("/api/billing", billingRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
