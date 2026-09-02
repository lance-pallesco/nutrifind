import { describe, expect, it } from "vitest";
import { mapProduct } from "../server/src/modules/products/products.mapper";

describe("mapProduct", () => {
  it("chooses the selected locale before the generic name", () => {
    const product = mapProduct(
      {
        code: "123",
        product_name: "Generic name",
        product_name_fr: "Nom français",
        brands: "Example",
        image_url: "https://images.example.test/product.png",
      },
      "fr",
      "Unavailable",
    );

    expect(product.name).toBe("Nom français");
    expect(product.brand).toBe("Example");
    expect(product.nutrition?.fat100g).toBeNull();
  });

  it("normalizes incomplete products without inventing values", () => {
    const product = mapProduct({}, "nl", "Naam niet beschikbaar");

    expect(product.name).toBe("Naam niet beschikbaar");
    expect(product.code).toBe("unknown");
    expect(product.imageUrl).toBeNull();
    expect(product.nutrition?.energyKcal100g).toBeNull();
  });
});
