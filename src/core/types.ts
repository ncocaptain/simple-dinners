export type Effort = "quick" | "normal" | "big" | "takeout";

export interface Meal {
  id?: string;
  slug?: string;
  name: string;
  ingredients: string;
  instructions?: string;
  servings?: number;
  photoUrl?: string;
  effort?: Effort;
  tags?: string[];
  isVegetarian?: boolean;
  notes?: string;
  suggestedSides?: string[];
  suggestedDesserts?: string[];

  translations?: {
    es?: {
      name?: string;
      notes?: string;
      ingredients?: string;
      instructions?: string;
      tags?: string[];
      suggestedSides?: string[];
      suggestedDesserts?: string[];
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

export type SmartWeekMealSource =
  | "cookbook"
  | "built-in"
  | "special"
  | "unknown";

export type SmartWeekReasonCode =
  | "locked-day"
  | "existing-leftovers"
  | "existing-freezer"
  | "effort-match"
  | "pantry-match"
  | "cookbook-pick"
  | "variety"
  | "takeout-night"
  | "request-match";

export interface SmartWeekDraftDay {
  plannedDay: PlannedDay;
  source: SmartWeekMealSource;
  reason?: SmartWeekReasonCode;
  preserved: boolean;
}

export type SmartWeekProteinTarget = {
  keyword: string;
  count: number;
};

export interface SmartWeekRequestConstraints {
  excludedKeywords: string[];
  preferredKeywords: string[];
  preferredTags: string[];
  mostlyQuick: boolean;
  vegetarianNightCount: number;
  pantryPriority: boolean;
  budgetPriority: boolean;
  kidFriendly: boolean;
  proteinTargets: SmartWeekProteinTarget[];
}

export interface SmartWeekDraft {
  days: Record<string, SmartWeekDraftDay>;
  request?: string;
  constraints?: SmartWeekRequestConstraints;
  createdAt: number;
}