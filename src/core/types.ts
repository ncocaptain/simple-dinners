export type Effort = "quick" | "normal" | "big" | "takeout";

export type Meal = {
  id?: string;
  slug?: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  effort?: Effort;
  tags?: string[];
};

export type PantryItem = {
  id: string;
  name: string;
  createdAt: number;
};

export type Recipe = {
  id: string;
  slug: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  effort?: Effort;
  favorite?: boolean;
  sourceUrl?: string;
  createdAt: number;
  updatedAt: number;
};

export type Preferences = {
  vegetarian: boolean;
  allowSubstitutions: boolean;
  allergens: string[];
};