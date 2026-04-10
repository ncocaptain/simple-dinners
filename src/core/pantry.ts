// =====================================================
// Builder: common pantry staples
// =====================================================

export const COMMON_PANTRY_STAPLES = [
  "salt",
  "pepper",
  "ground white pepper",
  "garlic powder",
  "garlic salt",
  "onion powder",
  "onion salt",
  "basil",
  "oregano",
  "thyme",
  "rosemary",
  "parsley",
  "cilantro",
  "dill",
  "bay leaf",
  "paprika",
  "smoked paprika",
  "nutmeg",
  "ground cumin",
  "chili powder",
  "cayenne",
  "cinnamon",
  "red pepper flakes",
  "ground mustard",
  "ground coriander",
  "ground turmeric",
  "ground ginger",
  "italian",
  "taco",
  "cajun",
  "steak rub",
  "sesame seeds",
  "old bay",
  "lawry's seasoned salt",
  "ranch seasoning",
  "baking powder",
  "flour",
  "sugar",
  "cornstarch",
  "curry powder",
  "celery salt",
  "ground allspice",
  "citric acid",
  "kinder's red garlic",
  "kinder's woodfire garlic",
  "desert heat seasoning",
];

// =====================================================
// Builder: pantry matching helper
// =====================================================

export function isCommonPantryStaple(
  ingredient: string,
  normalize: (text: string) => string
) {
  const text = normalize(ingredient);

  return COMMON_PANTRY_STAPLES.some((item) =>
    text.includes(normalize(item))
  );
}