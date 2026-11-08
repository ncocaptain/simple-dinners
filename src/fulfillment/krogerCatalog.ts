import type { RetailerPackageCandidate } from "./retailerPackageSolver";

export type KrogerEnvironment =
  | "certification"
  | "production";

export type KrogerLocation = {
  locationId: string;
  name: string;
  chain: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
};

export type KrogerProduct = {
  productId: string;
  upc: string;
  description: string;
  brand: string;
  size: string;
  imageUrl: string;
  regularPrice: number | null;
  promoPrice: number | null;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (
  value: unknown
): UnknownRecord =>
  value && typeof value === "object"
    ? (value as UnknownRecord)
    : {};

const asString = (value: unknown) =>
  typeof value === "string"
    ? value
    : "";

const asNumber = (value: unknown) =>
  typeof value === "number" &&
  Number.isFinite(value)
    ? value
    : null;

export function normalizeKrogerLocations(
  payload: unknown
): KrogerLocation[] {
  const root = asRecord(payload);
  const data = Array.isArray(root.data)
    ? root.data
    : [];

  return data
    .map((entry) => {
      const location = asRecord(entry);
      const address = asRecord(
        location.address
      );

      return {
        locationId: asString(
          location.locationId
        ),
        name: asString(location.name),
        chain: asString(location.chain),
        addressLine1: asString(
          address.addressLine1
        ),
        city: asString(address.city),
        state: asString(address.state),
        zipCode: asString(address.zipCode),
      };
    })
    .filter(
      (location) =>
        Boolean(location.locationId)
    );
}

function defaultKrogerImage(
  images: unknown
) {
  if (!Array.isArray(images)) return "";

  for (const image of images) {
    const imageRecord = asRecord(image);
    const sizes = Array.isArray(
      imageRecord.sizes
    )
      ? imageRecord.sizes
      : [];

    const preferred =
      sizes.find((size) => {
        const item = asRecord(size);
        return (
          asString(item.size) === "medium"
        );
      }) ?? sizes[0];

    const url = asString(
      asRecord(preferred).url
    );

    if (url) return url;
  }

  return "";
}

export function normalizeKrogerProducts(
  payload: unknown
): KrogerProduct[] {
  const root = asRecord(payload);
  const data = Array.isArray(root.data)
    ? root.data
    : [];

  return data
    .map((entry) => {
      const product = asRecord(entry);
      const items = Array.isArray(
        product.items
      )
        ? product.items
        : [];
      const firstItem = asRecord(
        items[0]
      );
      const price = asRecord(
        firstItem.price
      );

      return {
        productId: asString(
          product.productId
        ),
        upc:
          asString(firstItem.upc) ||
          asString(product.upc),
        description: asString(
          product.description
        ),
        brand: asString(product.brand),
        size:
          asString(firstItem.size) ||
          asString(product.size),
        imageUrl: defaultKrogerImage(
          product.images
        ),
        regularPrice: asNumber(
          price.regular
        ),
        promoPrice: asNumber(
          price.promo
        ),
      };
    })
    .filter(
      (product) =>
        Boolean(product.productId)
    );
}


function parseKrogerPackageSize(
  size: string
): Pick<
  RetailerPackageCandidate,
  "packageQuantity" | "packageUnit" | "packageCount"
> | null {
  const normalized = String(size || "")
    .trim()
    .toLowerCase();

  if (!normalized) return null;

  const countPack = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(?:ct|count|pk|pack)$/
  );

  if (countPack) {
    const count = Number(countPack[1]);

    if (!Number.isFinite(count) || count <= 0) {
      return null;
    }

    return {
      packageQuantity: 1,
      packageUnit: "count",
      packageCount: count,
    };
  }

  const amount = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(fl\s*oz|oz|lb|lbs|g|kg|ml|l)$/
  );

  if (!amount) return null;

  const quantity = Number(amount[1]);
  const rawUnit = amount[2]
    .replace(/\s+/g, " ")
    .trim();

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  const unit =
    rawUnit === "lbs"
      ? "lb"
      : rawUnit === "fl oz"
        ? "fl oz"
        : rawUnit;

  return {
    packageQuantity: quantity,
    packageUnit: unit,
  };
}

export function krogerProductToRetailerPackageCandidate(
  product: KrogerProduct
): RetailerPackageCandidate | null {
  const parsed = parseKrogerPackageSize(
    product.size
  );

  if (!parsed) return null;

  return {
    id: product.productId,
    productName: product.description,
    ...parsed,
  };
}

export function krogerProductsToRetailerPackageCandidates(
  products: readonly KrogerProduct[]
) {
  return products
    .map((product) =>
      krogerProductToRetailerPackageCandidate(
        product
      )
    )
    .filter(
      (
        candidate
      ): candidate is RetailerPackageCandidate =>
        Boolean(candidate)
    );
}


const RELEVANCE_STOP_WORDS = new Set([
  "fresh",
  "organic",
  "ripe",
  "large",
  "small",
  "medium",
  "whole",
  "sliced",
  "chopped",
  "diced",
]);

const PREPARED_PRODUCT_TERMS = new Set([
  "baby",
  "pouch",
  "pouches",
  "stage",
  "yogurt",
  "smoothie",
  "juice",
  "drink",
  "beverage",
  "jam",
  "jelly",
  "preserves",
  "pie",
  "filling",
  "muffin",
  "muffins",
  "cereal",
  "bar",
  "bars",
  "candy",
  "cookies",
  "cookie",
  "sauce",
  "syrup",
  "snack",
  "snacks",
]);

function relevanceTokens(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function singularToken(value: string) {
  if (/ies$/.test(value)) {
    return value.replace(/ies$/, "y");
  }

  if (/oes$/.test(value)) {
    return value.replace(/oes$/, "o");
  }

  if (/s$/.test(value) && !/ss$/.test(value)) {
    return value.slice(0, -1);
  }

  return value;
}

function meaningfulSearchTokens(value: string) {
  return relevanceTokens(value)
    .filter(
      (token) =>
        !RELEVANCE_STOP_WORDS.has(token)
    )
    .map(singularToken);
}

function looksLikeSimpleProduceSearch(
  searchTerm: string
) {
  const tokens = meaningfulSearchTokens(
    searchTerm
  );

  if (tokens.length !== 1) {
    return false;
  }

  const produce = new Set([
    "apple",
    "avocado",
    "banana",
    "blueberry",
    "carrot",
    "celery",
    "cucumber",
    "garlic",
    "grape",
    "jalapeno",
    "lemon",
    "lime",
    "mushroom",
    "onion",
    "orange",
    "peach",
    "pear",
    "pepper",
    "potato",
    "spinach",
    "strawberry",
    "tomato",
    "zucchini",
  ]);

  return produce.has(tokens[0]);
}

export type KrogerProductRelevance = {
  product: KrogerProduct;
  score: number;
  rejected: boolean;
  reason: string;
};

export function assessKrogerProductRelevance(
  searchTerm: string,
  product: KrogerProduct
): KrogerProductRelevance {
  const queryTokens =
    meaningfulSearchTokens(searchTerm);
  const titleTokens =
    relevanceTokens(product.description).map(
      singularToken
    );
  const titleSet = new Set(titleTokens);

  if (!queryTokens.length) {
    return {
      product,
      score: 0,
      rejected: false,
      reason: "No meaningful search tokens.",
    };
  }

  const matchedTokens =
    queryTokens.filter((token) =>
      titleSet.has(token)
    );

  if (
    matchedTokens.length !==
    queryTokens.length
  ) {
    return {
      product,
      score: -100,
      rejected: true,
      reason:
        "Product title does not contain all grocery search terms.",
    };
  }

  if (
    looksLikeSimpleProduceSearch(
      searchTerm
    )
  ) {
    const preparedHits =
      titleTokens.filter((token) =>
        PREPARED_PRODUCT_TERMS.has(token)
      );

    if (preparedHits.length > 0) {
      return {
        product,
        score: -100,
        rejected: true,
        reason:
          "Prepared product does not match a simple produce requirement.",
      };
    }
  }

  const normalizedQuery =
    meaningfulSearchTokens(searchTerm).join(
      " "
    );
  const normalizedTitle =
    titleTokens.join(" ");

  let score = matchedTokens.length * 20;

  if (
    normalizedTitle === normalizedQuery
  ) {
    score += 100;
  } else if (
    normalizedTitle.startsWith(
      normalizedQuery
    )
  ) {
    score += 50;
  }

  const extraTokens = Math.max(
    0,
    titleTokens.length -
      queryTokens.length
  );

  score -= Math.min(extraTokens, 12);

  return {
    product,
    score,
    rejected: false,
    reason:
      "Product title matches the grocery search terms.",
  };
}

export function rankRelevantKrogerProducts(
  searchTerm: string,
  products: readonly KrogerProduct[]
) {
  return products
    .map((product) =>
      assessKrogerProductRelevance(
        searchTerm,
        product
      )
    )
    .filter((result) => !result.rejected)
    .sort(
      (first, second) =>
        second.score - first.score ||
        first.product.description.localeCompare(
          second.product.description
        )
    );
}

export function relevantKrogerProducts(
  searchTerm: string,
  products: readonly KrogerProduct[]
) {
  return rankRelevantKrogerProducts(
    searchTerm,
    products
  ).map((result) => result.product);
}


export function relevantKrogerProductsToRetailerPackageCandidates(
  searchTerm: string,
  products: readonly KrogerProduct[]
) {
  return krogerProductsToRetailerPackageCandidates(
    relevantKrogerProducts(
      searchTerm,
      products
    )
  );
}


export type KrogerManualPackageChoice = {
  productId: string;
  upc: string;
  description: string;
  size: string;
  regularPrice: number | null;
  promoPrice: number | null;
  selectionMode: "manual-package-choice";
  canAutoAddToCart: false;
};

export function buildKrogerManualPackageChoices(
  searchTerm: string,
  products: readonly KrogerProduct[]
): KrogerManualPackageChoice[] {
  return relevantKrogerProducts(
    searchTerm,
    products
  ).map((product) => ({
    productId: product.productId,
    upc: product.upc,
    description: product.description,
    size: product.size,
    regularPrice: product.regularPrice,
    promoPrice: product.promoPrice,
    selectionMode: "manual-package-choice",
    canAutoAddToCart: false,
  }));
}
