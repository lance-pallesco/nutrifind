export const SUPPORTED_LOCALES = ["en", "nl", "de", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Nutrition = {
  energyKcal100g: number | null;
  fat100g: number | null;
  saturatedFat100g: number | null;
  carbohydrates100g: number | null;
  sugars100g: number | null;
  fiber100g: number | null;
  proteins100g: number | null;
  salt100g: number | null;
  novaGroup: number | null;
};

export type ProductSummary = {
  code: string;
  name: string;
  brand: string | null;
  quantity: string | null;
  imageUrl: string | null;
  nutrition?: Nutrition;
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
