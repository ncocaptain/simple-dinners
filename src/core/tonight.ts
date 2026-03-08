import type { Meal } from "./types";
import { candidateLibrary } from "./planner";

export function getTonightDinner(todayMeal?: Meal): Meal {
  if (todayMeal?.name?.trim()) return todayMeal;

  const random =
    candidateLibrary[Math.floor(Math.random() * candidateLibrary.length)];

  return (
    random ?? {
      name: "No dinner suggestion yet",
      ingredients: "",
      instructions: "",
      photoUrl: "",
    }
  );
}