import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  DEMO_USER_EMAIL: z.string().email().default("demo@nutrifind.local"),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  OPEN_FOOD_FACTS_BASE_URL: z.string().url().default("https://world.openfoodfacts.org"),
  OPEN_FOOD_FACTS_USER_AGENT: z
    .string()
    .min(1)
    .default("NutriFind/0.1 (local-development)"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: process.env.API_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
  OPEN_FOOD_FACTS_BASE_URL: process.env.OPEN_FOOD_FACTS_BASE_URL,
  OPEN_FOOD_FACTS_USER_AGENT: process.env.OPEN_FOOD_FACTS_USER_AGENT,
});
