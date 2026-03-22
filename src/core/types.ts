export type Effort = "quick" | "normal" | "big" | "takeout";

export interface Meal {
  id?: string;
  slug?: string;
  name: string;
  ingredients: string;
  instructions?: string; // Add the '?' to make it optional
  photoUrl?: string;     // Add the '?' to make it optional
  effort?: "quick" | "normal" | "big" | "takeout";
  tags?: string[];
  isVegetarian?: boolean;
  notes?: string; //
}

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
  dietaryNotes?: string;
  allergens?: string[];
  includeDesserts?: boolean;
  includeAppetizers?: boolean;
};