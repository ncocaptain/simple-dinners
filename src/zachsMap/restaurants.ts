export type ZachsMapRestaurant = {
  id: string;
  name: string;
  locationNote?: string;

  address: string;
  city: string;
  state: string;
  zip: string;

  categories: string[];
  featuredDish?: string;

  videoId: string;
  active: boolean;
};

export const ZACHS_MAP_RESTAURANTS: ZachsMapRestaurant[] = [
  {
    id: "motos-kingsport",
    name: "Moto's Japanese Restaurant",
    address: "1001 E Stone Dr",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Hibachi", "Japanese"],
    featuredDish: "Chicken hibachi with mushrooms",
    videoId: "2bDaCYKh0hg",
    active: true,
  },
  {
    id: "super-yummy-kingsport",
    name: "Super Yummy",
    address: "4366 W Stone Dr",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Sushi", "Mongolian", "Asian"],
    featuredDish: "Sushi & Mongolian stir-fry",
    videoId: "tzwX7qHIb_s",
    active: true,
  },
  {
    id: "si-senor-gray",
    name: "Si Señor Mexican Grill",
    address: "405 Roy Martin Rd #101",
    city: "Gray",
    state: "TN",
    zip: "37615",
    categories: ["Mexican", "Birria"],
    featuredDish: "Birria tacos",
    videoId: "_CcFgA3I7hY",
    active: true,
  },
  {
    id: "jaks-diner",
    name: "JAK's Diner",
    address: "4028 Fort Henry Dr",
    city: "Kingsport",
    state: "TN",
    zip: "37663",
    categories: ["American", "Diner"],
    featuredDish: "Chicken tenders",
    videoId: "WDUqoa8v2qs",
    active: true,
  },
  {
    id: "la-abejita",
    name: "La Abejita",
    locationNote: "Mexican market & taqueria",
    address: "1401 Bloomingdale Rd",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Mexican", "Tacos", "Tamales"],
    featuredDish: "Tacos & tamales",
    videoId: "BrCr5PiO7SM",
    active: true,
  },
  {
    id: "china-wok-kingsport",
    name: "China Wok",
    address: "600 E Sullivan St",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Chinese"],
    featuredDish: "Pepper chicken & Singapore noodles",
    videoId: "bExJ1vP7GkM",
    active: true,
  },
  {
    id: "rice-bistro-filipino",
    name: "Rice Bistro Filipino",
    locationNote: "Inside Hana Asian Fusion",
    address: "1811 W State of Franklin Rd #3",
    city: "Johnson City",
    state: "TN",
    zip: "37604",
    categories: ["Filipino"],
    featuredDish: "Pancit, lumpia & palabok",
    videoId: "sNG8mRgn6hU",
    active: true,
  },
  {
    id: "thai-house-kingsport",
    name: "Thai House",
    address: "2003 N Eastman Rd Ste 10",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Thai", "Asian"],
    featuredDish: "Chicken pad thai",
    videoId: "39nVy2eQeHY",
    active: true,
  },
  {
    id: "latin-love-kitchen",
    name: "Latin Love Kitchen",
    address: "221 E Center St",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Salvadoran", "Costa Rican", "Latin"],
    featuredDish: "Pupusas, empanadas & shrimp with yuca",
    videoId: "DY3kg1yLxbk",
    active: true,
  },
  {
    id: "ole-crow-tavern",
    name: "Ole Crow Tavern",
    address: "215 Commerce St Ste 200",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["BBQ", "American"],
    videoId: "ZnaO3jjM2cA",
    active: true,
  },
  {
    id: "don-chentes",
    name: "Don Chentes Cantina & Grill",
    address: "112 Broyles Dr",
    city: "Johnson City",
    state: "TN",
    zip: "37601",
    categories: ["Mexican", "Birria"],
    featuredDish: "Birria tacos",
    videoId: "E7um1-J75Do",
    active: true,
  },
  {
    id: "crazy-tomato",
    name: "The Crazy Tomato",
    address: "203 Princeton Rd",
    city: "Johnson City",
    state: "TN",
    zip: "37601",
    categories: ["Italian", "Pizza", "Pasta"],
    featuredDish: "Pollo Tipico & baked spaghetti",
    videoId: "PVkAh2SgsGU",
    active: true,
  },
  {
    id: "bettys-stockyard-cafe",
    name: "Betty's Stockyard Cafe",
    address: "2000 N John B Dennis Hwy",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["American", "Breakfast", "Country Cooking"],
    videoId: "osZ4d9MkZ9I",
    active: true,
  },
  {
    id: "pho-lao-kitchen",
    name: "Pho Lao Kitchen Der",
    locationNote: "Boones Creek",
    address: "3043 Boones Creek Rd #105-3",
    city: "Johnson City",
    state: "TN",
    zip: "37615",
    categories: ["Thai", "Lao", "Asian"],
    videoId: "-2Ggc0RBrX4",
    active: true,
  },
  {
    id: "millys-jamaican",
    name: "Milly's Authentic Jamaican Restaurant",
    address: "1120 E Center St",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["Jamaican", "Caribbean"],
    featuredDish: "Jerk chicken plate & beef pie",
    videoId: "CGF4d364ohw",
    active: true,
  },
  {
    id: "wasabi-kingsport",
    name: "Wasabi Japanese Steakhouse & Sushi Bar",
    address: "1805 N Eastman Rd",
    city: "Kingsport",
    state: "TN",
    zip: "37664",
    categories: ["Japanese", "Sushi", "Hibachi"],
    featuredDish: "Sushi & chicken lo mein",
    videoId: "EiyR3ekGUXc",
    active: true,
  },
  {
    id: "raffaeles-kingsport",
    name: "Raffaele's",
    address: "4309 Fort Henry Dr",
    city: "Kingsport",
    state: "TN",
    zip: "37663",
    categories: ["Italian", "Pizza", "Pasta"],
    featuredDish: "Pasta alla Raffaele & pepperoni pizza",
    videoId: "9ThxXHab2dI",
    active: true,
  },
  {
    id: "project-bbq-jc",
    name: "Project BBQ",
    address: "3301 N Roan St",
    city: "Johnson City",
    state: "TN",
    zip: "37601",
    categories: ["BBQ", "Pizza"],
    featuredDish: "Project pizza with smoked meats",
    videoId: "7eqHg2-TTkg",
    active: true,
  },
  {
    id: "fusion-ridgefields",
    name: "Fusion at Ridgefields",
    locationNote: "Inside Ridgefields Country Club",
    address: "2320 Pendragon Rd",
    city: "Kingsport",
    state: "TN",
    zip: "37660",
    categories: ["American", "Tex-Mex", "Italian"],
    videoId: "_UNc3k5kboA",
    active: true,
  },
];

export function getActiveZachsMapRestaurants() {
  return ZACHS_MAP_RESTAURANTS.filter(
    (restaurant) => restaurant.active,
  );
}

export function getZachVideoUrl(videoId: string) {
  return `https://youtu.be/${videoId}`;
}

export function getZachThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getRestaurantDirectionsUrl(
  restaurant: ZachsMapRestaurant,
) {
  const query = [
    restaurant.name,
    restaurant.address,
    restaurant.city,
    restaurant.state,
    restaurant.zip,
  ].join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}
