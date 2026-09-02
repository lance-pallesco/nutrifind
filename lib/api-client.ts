import type { Locale } from "./i18n";

export type Nutrition = {
  energyKcal100g: number | null; fat100g: number | null; saturatedFat100g: number | null;
  carbohydrates100g: number | null; sugars100g: number | null; fiber100g: number | null;
  proteins100g: number | null; salt100g: number | null; novaGroup: number | null;
};
export type Product = { code: string; name: string; brand: string | null; quantity: string | null; imageUrl: string | null; nutrition?: Nutrition };
export type SearchResponse = { query: string; locale: Locale; canViewNutrition: boolean; products: Product[] };
export type RecentSearch = { id: string; term: string; locale: Locale; resultCount: number; createdAt: string };
export type AccountStatus = { canViewNutrition: boolean; subscription: { state: string } | null };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(API_URL + path, {
    ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error("API request failed");
  return response.json() as Promise<T>;
}
export const api = {
  startDemo: () => request("/api/auth/demo", { method: "POST" }),
  recent: () => request<{ searches: RecentSearch[] }>("/api/searches/recent"),
  search: (term: string, locale: Locale) => request<SearchResponse>("/api/products/search?q=" + encodeURIComponent(term) + "&lang=" + locale),
  checkout: () => request<{ url: string }>("/api/billing/checkout-session", { method: "POST" }),
  me: () => request<AccountStatus>("/api/auth/me"),
};
