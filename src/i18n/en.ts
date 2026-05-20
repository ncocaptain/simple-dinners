export const en = {
  app: {
    name: "Simple Dinners",
    tagline: "Dinner built around you",
  },

  nav: {
    home: "Home",
    week: "Week",
    cook: "Cook",
    shop: "Shop",
    plan: "Plan",
    recipes: "Recipes",
  },

  common: {
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    done: "Done",
    edit: "Edit",
    delete: "Delete",
    clearAll: "Clear All",
    share: "Share",
    note: "Note",
    print: "Print",
    quickTips: "Quick Tips",
  },

  shopping: {
    title: "Shopping List",
    inputPlaceholder: "Add groceries or household items",
    shareList: "Share List",
    hideChecked: "Hide Checked",
    showChecked: "Show Checked",
    clearChecked: "Clear Checked",
    addBoughtToPantry: "Add Bought to Pantry",
    empty: "List is empty",
    noUnchecked: "No unchecked items",
    clearConfirm: "Clear your entire shopping list?",
    copied: "Shopping list copied to clipboard!",
    noItemsToShare: "No unchecked items to share.",
    generatedWith: "Generated with Simple Dinners",
    editItem: "Edit Item",
    editItemSubtitle: "Update the item name or quantity.",

    tips: {
      addItems: "Add groceries or household items",
      grouped: "Items are grouped by store section",
      tapToCheck: "Tap items to check them off",
      selectedIngredients: "Add only selected ingredients from recipes",
    },
  },

  recipe: {
    ingredients: "Ingredients",
    instructions: "Instructions",
    startCookMode: "Start Cook Mode",
    addItems: "Add Items",
    saveRecipe: "Save",
    cooked: "Cooked",
    tapIngredients: "Tap ingredients to select specific items",
    followSteps: "Follow each step or switch to Cook Mode",
    showAllIngredients: "Show all ingredients",
    showFewerIngredients: "Show fewer ingredients",
    showAllSteps: "Show all steps",
    showFewerSteps: "Show fewer steps",
    back: "Back",
print: "Print",
share: "Share",
note: "Note",
save: "Save",
saved: "Saved",
addNote: "Add Note",
editNote: "Edit Note",
recipeDetails: "Recipe Details",
ingredientCount: "ingredients",
stepCount: "steps",

tips: {
  cookMode: "Use Cook Mode for step-by-step cooking.",
  ingredients: "Tap ingredients to select only what you want to add.",
  notes: "Add personal notes for changes you make often.",
  printShare: "Print or share recipes when you need them outside the app.",
},
  },

  cookMode: {
    exit: "Exit Cook Mode",
    keepScreenAwake: "Keep Screen Awake",
    screenAwakeOn: "Screen Awake On",
    ingredientsInStep: "Ingredients in this step",
    noIngredientsDetected: "No specific ingredients detected for this step.",
    myNotes: "My Notes",
    editNote: "Edit Note",
    addPersonalNote: "Add a personal note",
    previous: "Previous",
    next: "Next",
    markCooked: "Mark cooked",
    timer: "Timer",
    startTimer: "Start Timer",
  },

  plan: {
    title: "Kitchen & Plan",
    subtitle:
      "Use what you already have, set your preferences, and generate smarter dinners.",

    kitchenTitle: "What’s In Your Kitchen",
    kitchenSubtitle:
      "Add ingredients you already have. Your weekly plan will prefer meals that use them.",
    kitchenPlaceholder: "Chicken, spinach, rice, pasta sauce...",
    separateItems: "Separate items with commas or new lines.",
    itemCount: "items",

    dietaryPreferences: "Dietary Preferences",
    vegetarianMode: "Vegetarian Mode",
    vegetarianSubtitle: "Prioritize plant-based meals",

    allergies: "Allergies & Restrictions",
    allergiesSubtitle: "These are hard blockers for meal generation.",

    dietaryNotes: "Dietary Notes",
    dietaryNotesSubtitle:
      "Add dislikes, picky eater notes, or softer preferences for the planner.",
    dietaryNotesPlaceholder:
      "Kids don't like spicy food, no mushrooms, lighter meals on weekdays...",

    setYourWeek: "Set Your Week",
    setYourWeekSubtitle: "Tell the planner how much effort you want each day.",

    generatePlan: "Generate Plan",
    backToWeek: "Back to Week",

    language: "Language / Idioma",

    allergens: {
      shellfish: "Shellfish",
      fish: "Fish",
      dairy: "Dairy",
      eggs: "Eggs",
      peanuts: "Peanuts",
      treeNuts: "Tree Nuts",
      gluten: "Gluten",
      soy: "Soy",
      sesame: "Sesame",
    },

    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },

    effort: {
      quick: "Quick",
      normal: "Normal",
      big: "Big",
      takeout: "Takeout",
    },

    tips: {
      kitchen: "Add ingredients you already have so your plan can use them.",
      allergens: "Allergies are treated as hard blockers.",
      effort:
        "Choose easier meals for busy nights and bigger meals when you have more time.",
      notes: "Use notes for picky eaters, dislikes, or softer preferences.",
    },
  },

  categories: {
    produce: "Produce",
    meatSeafood: "Meat / Seafood",
    dairyEggs: "Dairy / Eggs",
    bakery: "Bakery",
    pantry: "Pantry",
    frozen: "Frozen",
    spices: "Spices",
    paperGoods: "Paper Goods",
    household: "Household",
    other: "Other",
  },
} as const;