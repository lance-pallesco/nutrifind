import { describe, expect, it } from "vitest";
import { ProductsService } from "../server/src/modules/products/products.service";

describe("ProductsService", () => {
  it("returns normalized public results without nutrition when unauthenticated", async () => {
    const service = new ProductsService({
      search: async () => [
        {
          code: "123",
          product_name: "Cereal",
          nutriments: { "energy-kcal_100g": 350, fat_100g: 4 },
        },
      ],
    });

    const result = await service.search({ term: "cereal", locale: "en" });

    expect(result.products).toHaveLength(1);
    expect(result.canViewNutrition).toBe(false);
    expect(result.products[0]).not.toHaveProperty("nutrition");
  });

  it("rejects invalid search terms", async () => {
    const service = new ProductsService({ search: async () => [] });

    await expect(service.search({ term: " ", locale: "en" })).rejects.toMatchObject({
      code: "INVALID_QUERY",
      statusCode: 400,
    });
  });
});
