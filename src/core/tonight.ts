import type { Meal } from "./types";
import { candidateLibrary, getPlannerScore } from "./planner";

function emptyMeal(): Meal {
  return {
    name: "No dinner suggestion yet",
    ingredients: "",
    instructions: "",
    photoUrl: "",
  };
}

export function getTonightDinner(todayMeal?: Meal): Meal {
  if (todayMeal?.name?.trim()) {
    return todayMeal;
  }

  const ranked = [...candidateLibrary]
    .map((meal) => ({
      meal,
      score: getPlannerScore(meal),
    }))
    .sort((a, b) => b.score - a.score);

  const topChoices = ranked.slice(0, 3);

  const chosen =
    topChoices[Math.floor(Math.random() * topChoices.length)]?.meal ||
    ranked[0]?.meal;

  return chosen || emptyMeal();
}