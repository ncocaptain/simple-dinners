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
