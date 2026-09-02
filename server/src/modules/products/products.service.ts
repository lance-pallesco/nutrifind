import { AppError } from "../../middleware/error-handler";
import { prisma } from "../../db/prisma";
import { OpenFoodFactsClient, type ProductSearchProvider } from "./open-food-facts.client";
import { isLocale, type Locale, type ProductSummary } from "./products.types";
import { mapProduct } from "./products.mapper";

const MAX_RESULTS = 12;

export class ProductsService {
  constructor(private readonly provider: ProductSearchProvider = new OpenFoodFactsClient()) {}

  async search(input: { term: string; locale: string; userId?: string }) {
    const term = input.term.trim();
    if (term.length < 2 || term.length > 100) {
      throw new AppError(400, "INVALID_QUERY", "Search term must be between 2 and 100 characters.");
    }
    const locale: Locale = isLocale(input.locale) ? input.locale : "en";
    let providerProducts;
    try {
      providerProducts = await this.provider.search({ term, limit: MAX_RESULTS });
    } catch {
      throw new AppError(502, "UPSTREAM_UNAVAILABLE", "Product search is temporarily unavailable.");
    }

    const products: ProductSummary[] = providerProducts.map((product) =>
      mapProduct(product, locale, "Product name unavailable"),
    );
    if (input.userId) {
      await prisma.search.create({
        data: { userId: input.userId, term, locale, resultCount: products.length },
      });
    }

    const canViewNutrition = input.userId
      ? Boolean(await prisma.subscription.findFirst({
          where: { userId: input.userId, state: "ACTIVE" },
          select: { id: true },
        }))
      : false;
    return {
      query: term,
      locale,
      canViewNutrition,
      products: products.map(({ nutrition, ...product }) => ({
        ...product,
        ...(canViewNutrition ? { nutrition } : {}),
      })),
    };
  }
}
