import { env } from "../../config/env";

export type ProviderProduct = Record<string, unknown>;

type SearchResponse = {
  products?: unknown;
};

const fields = [
  "code",
  "product_name",
  "product_name_en",
  "product_name_nl",
  "product_name_de",
  "product_name_fr",
  "brands",
  "quantity",
  "image_url",
  "nutriments",
  "nova_group",
].join(",");

export interface ProductSearchProvider {
  search(input: { term: string; limit: number }): Promise<ProviderProduct[]>;
}

export class OpenFoodFactsClient implements ProductSearchProvider {
  async search({ term, limit }: { term: string; limit: number }) {
    const url = new URL("/cgi/search.pl", env.OPEN_FOOD_FACTS_BASE_URL);
    url.searchParams.set("search_terms", term);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", String(limit));
    url.searchParams.set("fields", fields);

    const response = await fetch(url, {
      headers: { "User-Agent": env.OPEN_FOOD_FACTS_USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error("Open Food Facts returned HTTP " + response.status);
    }

    const body = (await response.json()) as SearchResponse;
    return Array.isArray(body.products)
      ? body.products.filter((product): product is ProviderProduct => Boolean(product && typeof product === "object"))
      : [];
  }
}
