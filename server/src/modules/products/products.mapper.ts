import type { Locale, Nutrition, ProductSummary } from "./products.types";
import type { ProviderProduct } from "./open-food-facts.client";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function localizedName(product: ProviderProduct, locale: Locale) {
  return (
    text(product["product_name_" + locale]) ??
    text(product.product_name) ??
    text(product.product_name_en) ??
    text(product.product_name_nl) ??
    text(product.product_name_de) ??
    text(product.product_name_fr)
  );
}

export function mapProduct(product: ProviderProduct, locale: Locale, fallbackName: string): ProductSummary {
  const rawNutrition =
    product.nutriments && typeof product.nutriments === "object"
      ? (product.nutriments as Record<string, unknown>)
      : {};
  const nutrition: Nutrition = {
    energyKcal100g: number(rawNutrition["energy-kcal_100g"]),
    fat100g: number(rawNutrition.fat_100g),
    saturatedFat100g: number(rawNutrition["saturated-fat_100g"]),
    carbohydrates100g: number(rawNutrition.carbohydrates_100g),
    sugars100g: number(rawNutrition.sugars_100g),
    fiber100g: number(rawNutrition.fiber_100g),
    proteins100g: number(rawNutrition.proteins_100g),
    salt100g: number(rawNutrition.salt_100g),
    novaGroup: number(product.nova_group),
  };

  return {
    code: text(product.code) ?? "unknown",
    name: localizedName(product, locale) ?? fallbackName,
    brand: text(product.brands),
    quantity: text(product.quantity),
    imageUrl: text(product.image_url),
    nutrition,
  };
}
