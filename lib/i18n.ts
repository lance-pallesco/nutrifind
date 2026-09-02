export const locales = ["en", "nl", "de", "fr"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  fr: "Français",
};

const dictionaries = {
  en: {
    eyebrow: "Your food, understood", title: "Find the story behind every package.",
    subtitle: "Search thousands of products and make nutrition information easier to understand.",
    placeholder: "Search by product name or keyword…", search: "Search products", recent: "Recent searches",
    results: "Search results", resultCount: "products found", emptyTitle: "Start with a product or ingredient",
    emptyText: "Try searching for chocolate, cereal, or olive oil.", noResults: "No products found",
    noResultsText: "Try a broader search term or another language.", basicInfo: "Product information",
    nutrition: "Nutrition per 100 g", lockedTitle: "Unlock detailed nutrition",
    lockedText: "Subscribe to reveal calories, macros, salt, and more.", subscribe: "Unlock nutrition",
    unavailable: "Not available", brand: "Brand", quantity: "Quantity", unnamed: "Product name unavailable",
    error: "Something went wrong. Please try again.", language: "Language", demo: "Demo account",
    energy: "Energy", fat: "Fat", carbs: "Carbs", protein: "Protein", salt: "Salt", activeStatus: "Premium active", basicStatus: "Basic access", checkoutSuccess: "Subscription processing — your nutrition details will appear shortly.", checkoutCancelled: "Checkout was cancelled.",
  },
  nl: {
    eyebrow: "Jouw voeding, begrepen", title: "Ontdek het verhaal achter elke verpakking.",
    subtitle: "Doorzoek duizenden producten en begrijp voedingsinformatie eenvoudiger.",
    placeholder: "Zoek op productnaam of trefwoord…", search: "Producten zoeken", recent: "Recente zoekopdrachten",
    results: "Zoekresultaten", resultCount: "producten gevonden", emptyTitle: "Begin met een product of ingrediënt",
    emptyText: "Probeer chocolade, ontbijtgranen of olijfolie.", noResults: "Geen producten gevonden",
    noResultsText: "Probeer een bredere zoekterm of een andere taal.", basicInfo: "Productinformatie",
    nutrition: "Voedingswaarde per 100 g", lockedTitle: "Ontgrendel voedingswaarden",
    lockedText: "Abonneer je om calorieën, macro's, zout en meer te bekijken.", subscribe: "Voedingswaarden ontgrendelen",
    unavailable: "Niet beschikbaar", brand: "Merk", quantity: "Hoeveelheid", unnamed: "Productnaam niet beschikbaar",
    error: "Er ging iets mis. Probeer het opnieuw.", language: "Taal", demo: "Demo-account",
    energy: "Energie", fat: "Vet", carbs: "Koolhydraten", protein: "Eiwit", salt: "Zout", activeStatus: "Premium actief", basicStatus: "Basis toegang", checkoutSuccess: "Abonnement wordt verwerkt — je voedingswaarden verschijnen zo.", checkoutCancelled: "Afrekenen geannuleerd.",
  },
  de: {
    eyebrow: "Deine Ernährung, verstanden", title: "Entdecke die Geschichte hinter jeder Verpackung.",
    subtitle: "Durchsuche tausende Produkte und verstehe Nährwertinformationen leichter.",
    placeholder: "Nach Produktname oder Stichwort suchen…", search: "Produkte suchen", recent: "Letzte Suchen",
    results: "Suchergebnisse", resultCount: "Produkte gefunden", emptyTitle: "Beginne mit einem Produkt oder einer Zutat",
    emptyText: "Probiere Schokolade, Müsli oder Olivenöl.", noResults: "Keine Produkte gefunden",
    noResultsText: "Versuche einen allgemeineren Suchbegriff oder eine andere Sprache.", basicInfo: "Produktinformationen",
    nutrition: "Nährwerte pro 100 g", lockedTitle: "Nährwerte freischalten",
    lockedText: "Abonniere, um Kalorien, Makros, Salz und mehr zu sehen.", subscribe: "Nährwerte freischalten",
    unavailable: "Nicht verfügbar", brand: "Marke", quantity: "Menge", unnamed: "Produktname nicht verfügbar",
    error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.", language: "Sprache", demo: "Demo-Konto",
    energy: "Energie", fat: "Fett", carbs: "Kohlenhydrate", protein: "Protein", salt: "Salz", activeStatus: "Premium aktiv", basicStatus: "Basiszugang", checkoutSuccess: "Abonnement wird verarbeitet — deine Nährwerte erscheinen gleich.", checkoutCancelled: "Checkout abgebrochen.",
  },
  fr: {
    eyebrow: "Votre alimentation, en clair", title: "Découvrez l’histoire de chaque emballage.",
    subtitle: "Recherchez parmi des milliers de produits et comprenez mieux les informations nutritionnelles.",
    placeholder: "Rechercher un produit ou un mot-clé…", search: "Rechercher des produits", recent: "Recherches récentes",
    results: "Résultats de recherche", resultCount: "produits trouvés", emptyTitle: "Commencez avec un produit ou un ingrédient",
    emptyText: "Essayez chocolat, céréales ou huile d’olive.", noResults: "Aucun produit trouvé",
    noResultsText: "Essayez un terme plus général ou une autre langue.", basicInfo: "Informations produit",
    nutrition: "Valeurs nutritionnelles pour 100 g", lockedTitle: "Débloquez les détails nutritionnels",
    lockedText: "Abonnez-vous pour voir les calories, macros, sel et plus.", subscribe: "Débloquer la nutrition",
    unavailable: "Indisponible", brand: "Marque", quantity: "Quantité", unnamed: "Nom du produit indisponible",
    error: "Une erreur s’est produite. Veuillez réessayer.", language: "Langue", demo: "Compte démo",
    energy: "Énergie", fat: "Matières grasses", carbs: "Glucides", protein: "Protéines", salt: "Sel", activeStatus: "Premium actif", basicStatus: "Accès de base", checkoutSuccess: "Abonnement en cours — vos valeurs nutritionnelles apparaîtront bientôt.", checkoutCancelled: "Paiement annulé.",
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];
export function getDictionary(locale: Locale): Dictionary { return dictionaries[locale]; }
