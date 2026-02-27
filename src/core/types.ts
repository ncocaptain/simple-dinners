export type Effort = "quick" | "normal" | "big" | "takeout";

export type Meal = {
  id?: string;
  slug?: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  effort?: Effort;
};

export type PantryItem = {
  id: string;
  name: string;
  createdAt: number;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt?: number;
  sourceUrl?: string;
};

export type Preferences = {
  vegetarian: boolean;
  allowSubstitutions: boolean;
  allergens: string[];
};