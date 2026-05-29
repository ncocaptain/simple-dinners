export type Effort = "quick" | "normal" | "big" | "takeout";

export interface Meal {
  id?: string;
  slug?: string;
  name: string;
  ingredients: string;
  instructions?: string;
  photoUrl?: string;
  effort?: Effort;
  tags?: string[];
  isVegetarian?: boolean;
  notes?: string;
  suggestedSides?: string[];

  translations?: {
    es?: {
      name?: string;
      notes?: string;
      ingredients?: string;
      instructions?: string;
      tags?: string[];
      suggestedSides?: string[];
    };
  };
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
  tags?: string[];
  notes?: string;
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

export type DayMode = "planned" | "leftovers" | "freezer";

export interface PlannedDay {
  mode: DayMode;
  meal: Meal | null;
}