import type { Meal } from "./types";


export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const ALLERGENS = [
  { key: "peanuts", label: "Peanuts", keywords: ["peanut", "peanuts"] },
  {
    key: "tree_nuts",
    label: "Tree Nuts",
    keywords: [
      "almond",
      "walnut",
      "pecan",
      "cashew",
      "pistachio",
      "hazelnut",
      "tree nut",
      "nuts",
    ],
  },
  {
    key: "dairy",
    label: "Dairy",
    keywords: [
      "milk",
      "cheese",
      "butter",
      "cream",
      "yogurt",
      "parmesan",
      "mozzarella",
      "feta",
      "ricotta",
      "cheddar",
      "swiss",
      "sour cream",
    ],
  },
  { key: "eggs", label: "Eggs", keywords: ["egg", "eggs", "mayonnaise", "mayo"] },
  {
    key: "soy",
    label: "Soy",
    keywords: ["soy", "soy sauce", "tofu", "tempeh", "edamame", "teriyaki"],
  },
  {
    key: "gluten",
    label: "Wheat / Gluten",
    keywords: [
      "wheat",
      "gluten",
      "bread",
      "pasta",
      "tortilla",
      "buns",
      "flour",
      "breadcrumbs",
      "cracker crumbs",
      "panko",
      "naan",
      "pie crust",
      "pizza dough",
      "manicotti",
      "egg noodles",
    ],
  },
  {
    key: "shellfish",
    label: "Shellfish",
    keywords: [
      "shrimp",
      "crab",
      "lobster",
      "scallop",
      "scallops",
      "shellfish",
      "clam",
      "clams",
      "mussels",
      "oysters",
    ],
  },
  { key: "fish", label: "Fish", keywords: ["fish", "salmon", "tuna", "tilapia", "cod"] },
  { key: "sesame", label: "Sesame", keywords: ["sesame", "tahini", "sesame oil", "sesame seeds"] },
];

export const MEAT_WORDS = [
  "beef",
  "ground beef",
  "chicken",
  "pork",
  "bacon",
  "sausage",
  "pepperoni",
  "meatball",
  "ham",
  "turkey",
  "salmon",
  "fish",
  "shrimp",
  "tilapia",
  "crab",
  "scallops",
];

// =====================================================
// DINNER / MAIN RECIPES
// =====================================================

export const NEW_BUILTIN_RECIPES: Meal[] = [
  {
    id: "quick-beef-chili",
    slug: "quick-beef-chili",
    name: "Chili",
    effort: "quick",
    photoUrl: "/images/quick-beef-chili.webp",
    tags: ["dinner", "beef", "one-pot", "spicy", "comfort", "quick", "leftovers"],
    notes: "A hearty, no-fuss chili that is easy to throw together and even better the next day.",
    ingredients: `1 lb ground beef
2 (14.5 oz) cans fire-roasted diced tomatoes
1 (28 oz) can diced tomatoes
1 (15.5 oz) can chili beans (do not drain)
1 (15 oz) can corn, drained
1 (15 oz) can black beans, drained and rinsed
1 packet chili seasoning
Shredded cheese (optional)
Sour cream (optional)
Fresh or pickled jalapeños (optional)`,
    instructions: `Brown the ground beef in a large pot over medium heat until fully cooked.
Drain excess grease.
Add fire-roasted tomatoes, diced tomatoes, chili beans, corn, black beans, and chili seasoning. Stir well.
Bring to a gentle simmer.
Reduce heat and simmer uncovered for 30 minutes, stirring occasionally.
Taste and adjust seasoning if needed.
Serve hot on its own or with crackers or cornbread. Top as desired.`,
  },

  {
    id: "normal-chicken-greenbean-mushroom-bake",
    slug: "normal-chicken-greenbean-mushroom-bake",
    name: "Chicken Green Bean Mushroom Bake",
    effort: "normal",
    photoUrl: "/images/normal-chicken-greenbean-mushroom-bake.webp",
    tags: ["dinner", "chicken", "bake", "casserole", "comfort"],
    notes: "A creamy baked chicken dinner that works well for cozy weeknights and reheats nicely.",
    ingredients: `4 skinless chicken breasts
4 oz baby bella (cremini) mushrooms, sliced
2 (10.5 oz) cans cream of mushroom soup
1 (14.5 oz) can green beans, drained
1 Tbsp minced garlic
2 Tbsp butter
1 cup white rice
2 cups water
1/2 cup shredded mozzarella cheese
Salt and pepper, to taste`,
    instructions: `Preheat oven to 375°F.
In a baking dish, mix 1 can cream of mushroom soup, mushrooms, and drained green beans.
In a skillet over medium-high heat, melt butter and brown chicken on both sides with minced garlic.
Place chicken on top of the mixture in the baking dish.
Spread the remaining can of cream of mushroom soup over the chicken.
Cover tightly with foil and bake for 30 minutes, or until chicken reaches 165°F.
Meanwhile, bring 2 cups water to a boil, add rice, reduce heat, cover, and simmer 15 minutes. Rest 5 minutes.
Uncover dish, sprinkle mozzarella on top, and return to oven 5 to 10 minutes until melted.
Serve chicken and mushroom mixture over rice; season with salt and pepper to taste.`,
  },

  {
    id: "big-beef-salisbury-steak",
    slug: "big-beef-salisbury-steak",
    name: "Salisbury Steak with Mushroom Gravy",
    effort: "big",
    photoUrl: "/images/big-beef-salisbury-steak.webp",
    tags: ["dinner", "beef", "stovetop", "comfort", "gravy"],
    notes: "Classic comfort food with rich mushroom gravy that is perfect over mashed potatoes.",
    ingredients: `FOR STEAKS
1 lb lean ground beef
1/4 cup panko breadcrumbs
1 large egg, beaten
2 tsp ketchup
1 tsp Dijon mustard
1/2 tsp dried oregano
1 Tbsp olive oil

FOR GRAVY
2 Tbsp butter
2 Tbsp flour
1 1/2 cups beef stock
1 Tbsp ketchup
1 tsp Worcestershire sauce
1/2 tsp onion powder
6 oz cremini mushrooms, sliced
Salt and pepper, to taste`,
    instructions: `In a bowl, mix ground beef, breadcrumbs, egg, ketchup, Dijon, and oregano until just combined.
Shape into 4 oval patties, about 3/4-inch thick.
Heat olive oil in a large skillet over medium-high heat.
Cook patties about 3 minutes per side until browned; transfer to a plate.
Reduce heat to medium; melt butter in the same skillet.
Whisk in flour until smooth; cook 1 to 2 minutes.
Reduce heat to medium-low and slowly whisk in beef stock until smooth.
Stir in ketchup, Worcestershire, and onion powder.
Add mushrooms and simmer about 5 minutes until thickened; season with salt and pepper.
Return patties to skillet, nestle into gravy, cover, and cook 10 minutes until 160°F.
Serve over mashed potatoes with mushroom gravy spooned on top.`,
  },

  {
    id: "normal-wild-west-shrimp",
    slug: "normal-wild-west-shrimp",
    name: "Wild West Shrimp",
    effort: "normal",
    photoUrl: "/images/normal-wild-west-shrimp.webp",
    tags: ["dinner", "seafood", "shellfish", "shrimp", "fried", "spicy"],
    notes: "A restaurant-style shrimp dish with bold buttery heat and a crunchy coating.",
    ingredients: `1 lb medium shrimp, peeled and deveined
1.5 cups all-purpose flour
1 tsp black pepper
1/2 tsp salt
1 cup milk
Frying oil (enough for about 2 inches deep)
Old Bay seasoning (to taste)

FOR SAUCE:
1/2 cup butter
1 Tbsp minced garlic
1 Tbsp lemon juice
6 cherry peppers, chopped`,
    instructions: `Add oil to a frying pan or pot and heat over medium-high.
In a bowl, mix flour, salt, and pepper.
Place milk in a separate bowl.
Dredge shrimp in milk, then coat in flour mixture. Shake off excess.
Fry shrimp in batches until golden and cooked through.
Remove with a slotted spoon and drain on paper towels.

In a separate pan, melt butter over low heat.
Add garlic and lemon juice and stir.
Add chopped cherry peppers and about 1 1/2 tablespoons Old Bay seasoning.
Sauté over low heat for 2 to 3 minutes.

Drizzle the butter sauce and peppers over fried shrimp.
Serve warm with ranch dressing.`,
  },

  {
    id: "big-mushroom-swiss-sliders",
    slug: "big-mushroom-swiss-sliders",
    name: "Mushroom Swiss Sliders",
    effort: "big",
    photoUrl: "/images/big-mushroom-swiss-sliders.webp",
    tags: ["dinner", "beef", "sandwich", "bake", "party", "comfort"],
    notes: "Great for feeding a crowd or using as a fun family dinner night.",
    ingredients: `FOR HAMBURGER:
1 Tbsp seasoned salt
1 Tbsp hamburger seasoning
1/4 tsp kosher salt
1/4 tsp black pepper
1 Tbsp canola oil
1/2 cup yellow onion, diced
1 tsp minced garlic
1 lb ground beef
1/2 tsp Worcestershire sauce

FOR MUSHROOM SWISS SAUCE:
1/2 cup (1 stick) butter
8 oz baby bella mushrooms, sliced
1/4 cup beef broth
1/4 cup milk
1/2 cup shredded Swiss cheese
Pinch of salt and pepper

FOR SEASONED BUTTER:
1/4 cup (1/2 stick) butter, melted
1 tsp garlic salt
2 tsp sesame seeds

FOR ASSEMBLY:
1 package King’s Hawaiian Rolls (12 count)
12 slices Swiss cheese`,
    instructions: `Preheat oven to 350°F. Spray a 9x13-inch baking dish with nonstick spray.

HAMBURGER:
In a small bowl, mix seasoned salt, hamburger seasoning, salt, and pepper.
Heat oil in a large skillet over medium heat.
Add onion and garlic and cook 1 to 2 minutes.
Add ground beef and break apart with a spoon.
Stir in Worcestershire and seasoning mixture.
Cook 8 to 10 minutes until no pink remains. Drain and set aside.

MUSHROOM SWISS SAUCE:
In a medium saucepan over medium heat, melt butter.
Add mushrooms and cook 5 to 10 minutes until softened.
Add beef broth and milk.
Reduce heat and slowly whisk in shredded Swiss cheese until melted.
Stir in cooked hamburger mixture and combine well.

SEASONED BUTTER:
Mix melted butter, garlic salt, and sesame seeds in a small bowl.

ASSEMBLY:
Slice rolls in half and place bottom halves in baking dish.
Layer 6 slices Swiss cheese on bottom buns.
Spread hamburger mixture evenly over cheese.
Top with remaining 6 slices of Swiss cheese.
Place top halves of buns on sliders.
Brush tops with seasoned butter mixture.

Cover with foil and bake 20 minutes until cheese is melted.
Remove foil and bake 5 more minutes until tops are golden brown.
Serve warm.`,
  },

  {
    id: "normal-school-pizza",
    slug: "normal-school-pizza",
    name: "School Pizza",
    effort: "normal",
    photoUrl: "/images/normal-school-pizza.webp",
    tags: ["dinner", "pizza", "bake", "comfort", "kid-friendly"],
    notes: "A nostalgic sheet-pan pizza that brings back cafeteria memories in the best way.",
    ingredients: `4 Tbsp olive oil, divided
3 Tbsp cornmeal
1 lb prepared pizza dough
1 lb mild ground Italian sausage
3 Tbsp Italian seasoning
1 (13 oz) jar pizza sauce
4 cups shredded mozzarella cheese`,
    instructions: `Preheat oven to 400°F.
Drizzle 3 tablespoons olive oil onto a half sheet pan and brush to coat evenly.
Sprinkle cornmeal over the pan.

Stretch pizza dough into a rectangle to fit the sheet pan.
If the dough resists stretching, let it rest 5 minutes and continue.

Heat remaining 1 tablespoon olive oil in a skillet over medium-high heat.
Add sausage and Italian seasoning.
Cook 7 to 8 minutes until browned and no longer pink.
Drain excess grease.

Bake crust alone for 7 to 8 minutes until it no longer looks wet and begins to lightly brown.
Remove from oven.

Spread pizza sauce evenly over crust, reaching the edges.
Sprinkle cooked sausage evenly over sauce.
Top with shredded mozzarella.

Return to oven and bake 8 to 10 minutes until cheese is melted and lightly golden.
Remove and slice into 8 rectangles.
Serve warm.`,
  },

  {
    id: "big-shotgun-shells",
    slug: "big-shotgun-shells",
    name: "Shotgun Shells",
    effort: "big",
    photoUrl: "/images/big-shotgun-shells.webp",
    tags: ["dinner", "beef", "pork", "bake", "bbq", "party", "comfort"],
    notes: "A big-flavor BBQ dinner that is fun for weekends, cookouts, or game day.",
    ingredients: `2 (8 oz) boxes manicotti shells (uncooked)
1 1/2 lb ground beef
1 lb hot Italian sausage
1 medium onion, finely diced
2 cups Colby Jack cheese, shredded
6 oz cream cheese, softened
1 jalapeno, finely diced
2 tsp Cajun seasoning
2 tsp garlic powder
2 tsp black pepper
1 tsp red pepper flakes
3 (12 oz) packages bacon
1/2 cup barbecue sauce (plus extra for brushing)`,
    instructions: `Preheat oven to 300°F.
Line a baking sheet with aluminum foil and place a wire rack on top.

In a large bowl, mix together ground beef, Italian sausage, onion, shredded cheese, cream cheese, jalapeno, Cajun seasoning, garlic powder, black pepper, and red pepper flakes until fully combined.

Gently stuff uncooked manicotti shells from both ends, making sure there are no air pockets.

Wrap each stuffed shell tightly with bacon, covering the ends completely. You may need two pieces of bacon per shell.

Brush additional barbecue sauce over both sides of each wrapped shell.

Place shells on prepared rack and bake for 60 minutes.

Flip shells over, brush with more barbecue sauce, and bake an additional 60 to 70 minutes until bacon is crispy and cooked through.

Serve hot.`,
  },

  {
    id: "normal-shrimp-and-sausage-bake",
    slug: "normal-shrimp-and-sausage-bake",
    name: "Shrimp and Sausage Bake",
    effort: "normal",
    photoUrl: "/images/normal-shrimp-and-sausage-bake.webp",
    tags: ["dinner", "sheet-pan", "seafood", "shellfish", "shrimp", "sausage", "one-pan", "leftovers"],
    notes: "A low-mess sheet-pan dinner with big flavor and a nice mix of protein and veggies.",
    ingredients: `Cooking spray
1 lb red potatoes (about 3 cups), cut into 1-inch pieces
4 Tbsp butter, melted
3 Tbsp olive oil
2 tsp minced garlic
1 Tbsp dried parsley
1 Tbsp dried oregano
1/2 tsp garlic powder
1/2 tsp seasoned salt
1 tsp paprika
1/4 tsp cayenne pepper (optional)

1 lb extra-large shrimp, peeled and deveined
1 package smoked sausage, sliced into coins
1 large yellow onion, cut into 1/2-inch pieces
1 red bell pepper, cut into 1-inch pieces
1 green bell pepper, cut into 1-inch pieces
1 can corn, drained
Fresh parsley (optional, for garnish)`,
    instructions: `Preheat oven to 400°F.
Lightly coat a large sheet pan with cooking spray.

Add cut potatoes to the sheet pan.

In a small bowl, whisk together melted butter, olive oil, garlic, dried parsley, dried oregano, garlic powder, seasoned salt, paprika, and optional cayenne.

Remove 2 tablespoons of this mixture and toss with potatoes until evenly coated.
Spread potatoes into an even layer and bake for 15 minutes.

Meanwhile, pat shrimp dry and toss with 2 1/2 tablespoons of the butter-herb mixture. Set aside.

Slice sausage into coins.
Cut onion into 1/2-inch pieces.
Cut bell peppers into 1-inch pieces.
Drain corn thoroughly.

Remove potatoes from oven and toss.
Push potatoes to one side of the sheet pan.
Add sausage, onion, and bell peppers to the other side.

Pour remaining herb-butter mixture over everything and toss well.
Spread into an even layer and return to oven for 15 minutes.

Toss and bake an additional 8 minutes.

Remove from oven and space vegetables evenly.
Add shrimp to pan and bake 6 minutes, or until shrimp is cooked through and vegetables are crisp-tender.

Add drained corn on top and bake 1 additional minute.

Toss gently and garnish with fresh parsley before serving.`,
  },

  {
    id: "normal-classic-meatloaf",
    slug: "normal-classic-meatloaf",
    name: "Meatloaf",
    effort: "normal",
    photoUrl: "/images/normal-classic-meatloaf.webp",
    tags: ["dinner", "beef", "bake", "comfort", "kid-friendly", "leftovers"],
    notes: "A family-style meatloaf with a sweet tangy topping and dependable leftovers.",
    ingredients: `2 large eggs
2/3 cup milk
2 tsp salt
1/4 tsp ground black pepper
3 slices bread, crumbled
1 1/2 lbs ground beef
1 onion, chopped
1 cup shredded Cheddar cheese
1/2 cup shredded carrot

FOR TOPPING:
1/4 cup brown sugar
1/4 cup ketchup
1 Tbsp yellow mustard`,
    instructions: `Preheat oven to 350°F.

In a large bowl, whisk together eggs, milk, salt, and black pepper.
Add crumbled bread and stir until softened.

Mix in ground beef, chopped onion, shredded Cheddar cheese, and shredded carrot until evenly combined.

Transfer mixture to a 9x5-inch loaf pan and shape evenly.

In a small bowl, combine brown sugar, ketchup, and mustard.
Spread mixture evenly over the top of the meatloaf.

Bake for 60 to 75 minutes, or until the center reaches at least 160°F and is no longer pink.

Let rest 5 to 10 minutes before slicing and serving.`,
  },

  {
    id: "normal-tilapia-asparagus-foil-packets",
    slug: "normal-tilapia-asparagus-foil-packets",
    name: "Tilapia & Asparagus Foil Packets",
    effort: "normal",
    photoUrl: "/images/normal-tilapia-asparagus-foil-packets.webp",
    tags: ["dinner", "seafood", "fish", "foil-packets", "bake", "healthy"],
    notes: "A light and easy fish dinner with almost no cleanup.",
    ingredients: `1 bunch asparagus, tough ends removed and divided
2 yellow squash, sliced and divided
Garlic powder, to taste
4 (6 oz) tilapia fillets, thawed
Salt, to taste
Paprika, to taste
4 Tbsp butter, divided
4 tsp lemon juice, divided
1 tsp dried oregano, divided
Capers (optional)`,
    instructions: `Preheat oven to 375°F.

Lay out four 2-foot sheets of aluminum foil.

For each packet:
Place asparagus slightly off-center on the foil, forming a base layer.
Top with sliced squash and sprinkle with garlic powder.

Place one tilapia fillet on top of the vegetables.
Season with salt and paprika.

Add 1 tablespoon butter on top of each fillet.
Drizzle with 1 teaspoon lemon juice.
Sprinkle with dried oregano and optional capers.

Fold foil over and seal all three edges tightly to create a packet.

Place packets on a baking sheet or in glass baking dishes.

Bake for 20 minutes.

Carefully open packets. Steam will be hot. Remove from foil before serving.`,
  },

  {
    id: "normal-slow-cooker-beef-enchilada-casserole",
    slug: "normal-slow-cooker-beef-enchilada-casserole",
    name: "Slow Cooker Beef Enchilada Casserole",
    effort: "normal",
    photoUrl: "/images/normal-slow-cooker-beef-enchilada-casserole.webp",
    tags: ["dinner", "beef", "slow-cooker", "mexican", "comfort", "casserole", "leftovers"],
    notes: "An easy crockpot dinner that is filling, cheesy, and great for busy evenings.",
    ingredients: `1 1/2 lbs lean ground beef
1 packet taco seasoning
1 (15 oz) can beans, drained and rinsed
1 (28 oz) jar enchilada sauce
1 (4 oz) can green chilies
1 white onion, diced
10 (6-inch) corn tortillas, cut into wedges
1 1/2 cups shredded Mexican cheese blend

FOR GARNISH:
Chopped cilantro
Pico de gallo
Sour cream`,
    instructions: `In a large skillet over medium-high heat, cook ground beef until browned, about 7 minutes.
Drain excess grease and stir in taco seasoning.

Transfer beef to the slow cooker.
Add enchilada sauce, beans, green chilies, and diced onion.
Stir to combine.

Cover and cook on Low for 3 to 4 hours.

Stir in half of the tortilla wedges and half of the shredded cheese.
Top with remaining tortilla wedges and remaining cheese.

Cover and cook on High for about 30 minutes, or until cheese is fully melted.

Garnish with cilantro, pico de gallo, and sour cream before serving.`,
  },

  {
    id: "normal-caprese-stuffed-portobello-mushrooms",
    slug: "normal-caprese-stuffed-portobello-mushrooms",
    name: "Caprese Stuffed Portobello Mushrooms",
    effort: "normal",
    photoUrl: "/images/normal-caprese-stuffed-portobello-mushrooms.webp",
    tags: ["dinner", "vegetarian", "bake", "italian", "healthy"],
    notes: "A lighter dinner option with lots of fresh caprese flavor.",
    ingredients: `2 tbsp butter
2 cloves garlic, crushed
1 tbsp freshly chopped parsley
5–6 large portobello mushrooms, stems removed
5–6 fresh mozzarella balls, sliced
1 cup cherry tomatoes, sliced
Fresh basil, shredded
1/4 cup balsamic vinegar
2 tsp brown sugar`,
    instructions: `Preheat oven to broil on high and position rack in the middle.

Melt butter with garlic and parsley until fragrant.

Brush mushroom bottoms with garlic butter and place buttered side down on baking tray.

Flip mushrooms and brush remaining butter inside each cap.

Fill with mozzarella and tomatoes.

Broil about 8 minutes until cheese is melted and golden.

In a small saucepan, combine balsamic vinegar and brown sugar. Bring to a boil, reduce heat, and simmer 5 to 8 minutes until thickened.

Drizzle glaze over mushrooms, top with basil, season to taste, and serve.`,
  },

  {
    id: "normal-shepherds-pie",
    slug: "normal-shepherds-pie",
    name: "Shepherd’s Pie",
    effort: "normal",
    photoUrl: "/images/normal-shepherds-pie.webp",
    tags: ["dinner", "beef", "bake", "comfort", "casserole", "leftovers"],
    notes: "A warm, classic comfort meal that feels right at home on chilly nights.",
    ingredients: `1 1/2 to 2 lbs potatoes (about 3 large), peeled and quartered
8 tbsp butter (1 stick), divided
1 medium onion, chopped
1–2 cups mixed vegetables (diced carrots, corn, peas)
1 1/2 lbs ground beef
1/2 cup beef broth
1 tsp Worcestershire sauce
Salt and pepper, to taste
8 oz baby bella mushrooms
2 cloves garlic`,
    instructions: `Place potatoes in a pot and cover with at least 1 inch of cold water. Add a teaspoon of salt. Bring to a boil, reduce to a simmer, and cook until tender, about 20 minutes.

While potatoes cook, melt 4 tbsp butter in a large sauté pan over medium heat. Add onion and carrots and cook until tender, about 6 to 10 minutes.

Add mushrooms and garlic and cook 2 to 3 minutes until mushrooms soften.

Add ground beef, corn, and peas. Cook until no longer pink. Season with salt and pepper.

Stir in Worcestershire sauce and beef broth. Bring to a simmer, reduce heat to low, and cook uncovered for about 10 minutes. Add a splash more broth if needed to keep it from drying out.

Drain potatoes and place in a bowl with remaining 4 tbsp butter. Mash and season with salt and pepper to taste.

Preheat oven to 400°F. Spread beef mixture in an even layer in an 8x13 baking dish.

Spread mashed potatoes over the top. Rough up the surface with a fork to create peaks.

Bake about 30 minutes until browned and bubbling.`,
  },

  {
    id: "normal-italian-sausage-stuffed-peppers",
    slug: "normal-italian-sausage-stuffed-peppers",
    name: "Italian Sausage Stuffed Peppers",
    effort: "normal",
    photoUrl: "/images/normal-italian-sausage-stuffed-peppers.webp",
    tags: ["dinner", "pork", "bake", "italian", "comfort"],
    notes: "A solid weeknight baked dinner that is filling without being too fussy.",
    ingredients: `1 lb Italian sausage
2 tsp olive oil
1 (14.5 oz) can fire-roasted diced tomatoes
2 tsp garlic powder
2 tsp onion powder
2 tsp Italian seasoning
1 tsp Worcestershire sauce
1 1/2 cups cooked rice
1/4 cup chicken broth
1/4 cup grated Parmesan cheese
1 cup mozzarella cheese, grated
3–4 large bell peppers
Red pepper flakes (optional)
Fresh basil (optional)`,
    instructions: `Preheat oven to 375°F.

Cut around the stem of each bell pepper and remove it. Slice peppers in half lengthwise and remove seeds and white membrane. Place cut-side up in a baking dish.

Heat olive oil in a large skillet over medium-high heat. Brown sausage, breaking into small pieces, about 3 to 4 minutes. Drain grease if needed.

Add tomatoes, garlic powder, onion powder, Italian seasoning, Worcestershire sauce, chicken broth, and cooked rice. Stir to combine and bring to a simmer. Cook 3 to 4 minutes until liquid is mostly gone.

Stir in Parmesan cheese and remove from heat.

Fill pepper halves with sausage mixture and top with mozzarella.

Cover with foil and bake 25 to 30 minutes, or longer if you like softer peppers, until peppers are tender.

Remove foil and broil 2 to 3 minutes until cheese is browned.

Cool 1 to 2 minutes. Top with fresh basil and red pepper flakes if desired and serve.`,
  },

  {
    id: "quick-honey-garlic-chicken",
    slug: "quick-honey-garlic-chicken",
    name: "Honey Garlic Chicken",
    effort: "quick",
    photoUrl: "/images/quick-honey-garlic-chicken.webp",
    tags: ["dinner", "chicken", "stovetop", "quick", "sweet-savory"],
    notes: "Fast, simple, and family-friendly with a sweet-savory sauce that works well over rice.",
    ingredients: `4 boneless skinless chicken breasts
Salt and pepper, to taste
1/3 cup honey
1/4 cup soy sauce
4 cloves garlic, minced
1 tbsp olive oil
1 tsp cornstarch (optional, for thickening)`,
    instructions: `Season chicken with salt and pepper.

Heat olive oil in a skillet over medium heat. Cook chicken 5 to 6 minutes per side until cooked through. Remove and set aside.

In the same pan, add honey, soy sauce, and garlic. Simmer 2 to 3 minutes.

If thicker sauce is desired, stir cornstarch with 1 tbsp water and add to pan.

Return chicken to skillet and coat in sauce. Simmer 2 to 3 minutes and serve.`,
  },

  {
    id: "quick-creamy-tortellini",
    slug: "quick-creamy-tortellini",
    name: "Creamy Spinach Tortellini",
    effort: "quick",
    photoUrl: "/images/quick-creamy-tortellini.webp",
    tags: ["dinner", "pasta", "vegetarian", "quick", "comfort"],
    notes: "A quick comfort dinner that feels creamy and satisfying without much effort.",
    ingredients: `1 (20 oz) package cheese tortellini
1 cup heavy cream
1/2 cup grated Parmesan cheese
2 cloves garlic, minced
2 cups fresh spinach
Salt and pepper, to taste`,
    instructions: `Cook tortellini according to package directions. Drain.

In a skillet over medium heat, sauté garlic for 30 seconds.

Add heavy cream and simmer 3 to 4 minutes.

Stir in Parmesan and spinach. Cook until spinach wilts.

Add tortellini and toss to coat. Season to taste and serve.`,
  },

  {
    id: "quick-lemon-butter-salmon",
    slug: "quick-lemon-butter-salmon",
    name: "Lemon Butter Salmon",
    effort: "quick",
    photoUrl: "/images/quick-lemon-butter-salmon.webp",
    tags: ["dinner", "seafood", "fish", "salmon", "quick", "healthy"],
    notes: "An easy skillet salmon recipe with bright lemon flavor and minimal cleanup.",
    ingredients: `4 salmon fillets
Salt and pepper, to taste
3 tbsp butter
2 cloves garlic, minced
Juice of 1 lemon
Fresh parsley (optional)`,
    instructions: `Season salmon with salt and pepper.

Melt butter in a skillet over medium heat. Add garlic and cook 30 seconds.

Place salmon skin-side down and cook 4 to 5 minutes per side until flaky.

Squeeze lemon juice over salmon and garnish with parsley before serving.`,
  },

  {
    id: "quick-chicken-fried-rice",
    slug: "quick-chicken-fried-rice",
    name: "Chicken Fried Rice",
    effort: "quick",
    photoUrl: "/images/quick-chicken-fried-rice.webp",
    tags: ["dinner", "chicken", "rice", "one-pan", "quick", "leftovers"],
    notes: "A great use for leftover rice and chicken when you need dinner fast.",
    ingredients: `2 cups cooked rice
1 lb cooked chicken, diced
2 eggs, beaten
1 cup frozen mixed vegetables
3 tbsp soy sauce
1 tbsp sesame oil
2 green onions, sliced`,
    instructions: `Heat sesame oil in a large skillet.

Scramble eggs and set aside.

Add vegetables and cook 2 to 3 minutes.

Stir in rice and chicken. Cook until heated through.

Add soy sauce and scrambled eggs. Toss well.

Top with green onions and serve.`,
  },

  {
    id: "quick-bbq-chicken-flatbread",
    slug: "quick-bbq-chicken-flatbread",
    name: "BBQ Chicken Flatbread",
    effort: "quick",
    photoUrl: "/images/quick-bbq-chicken-flatbread.webp",
    tags: ["dinner", "chicken", "quick", "pizza", "kid-friendly"],
    notes: "An easy shortcut dinner that feels fun and customizable.",
    ingredients: `2 flatbreads or naan
1 cup cooked chicken, shredded
1/2 cup BBQ sauce
1/2 red onion, thinly sliced
1 cup shredded mozzarella cheese`,
    instructions: `Preheat oven to 400°F.

Spread BBQ sauce over flatbreads.

Top with chicken, red onion, and mozzarella.

Bake 8 to 10 minutes until cheese is melted and bubbly.

Slice and serve.`,
  },

  {
    id: "normal-baked-ziti",
    slug: "normal-baked-ziti",
    name: "Baked Ziti",
    effort: "normal",
    photoUrl: "/images/normal-baked-ziti.webp",
    tags: ["dinner", "pasta", "beef", "bake", "comfort", "kid-friendly"],
    notes: "A dependable baked pasta dinner that feeds a crowd and makes good leftovers.",
    ingredients: `1 lb ziti pasta
1 lb ground beef
1 (24 oz) jar marinara sauce
1 cup ricotta cheese
2 cups shredded mozzarella
1/2 cup grated Parmesan`,
    instructions: `Preheat oven to 375°F.

Cook pasta according to package directions. Drain.

Brown ground beef in skillet and drain grease. Stir in marinara.

In a baking dish, layer pasta, meat sauce, ricotta, and mozzarella.

Repeat layers and top with Parmesan.

Bake 25 to 30 minutes until bubbly and golden.`,
  },

  {
    id: "normal-chicken-alfredo",
    slug: "normal-chicken-alfredo",
    name: "Chicken Alfredo",
    effort: "normal",
    photoUrl: "/images/normal-chicken-alfredo.webp",
    tags: ["dinner", "pasta", "chicken", "comfort", "italian"],
    notes: "Creamy, comforting, and always a crowd-pleaser for pasta night.",
    ingredients: `2 chicken breasts, sliced
12 oz fettuccine
1 cup heavy cream
1/2 cup butter
1 cup grated Parmesan
2 cloves garlic, minced
Salt and pepper, to taste`,
    instructions: `Cook pasta according to package directions.

Season chicken and cook in skillet until done. Remove and set aside.

In same pan, melt butter and sauté garlic.

Add heavy cream and simmer 5 minutes.

Stir in Parmesan until smooth.

Add chicken and pasta. Toss and serve.`,
  },

  {
    id: "normal-beef-stroganoff",
    slug: "normal-beef-stroganoff",
    name: "Beef Stroganoff",
    effort: "normal",
    photoUrl: "/images/normal-beef-stroganoff.webp",
    tags: ["dinner", "beef", "comfort", "stovetop", "pasta"],
    notes: "A rich and cozy skillet dinner that is especially good on colder nights.",
    ingredients: `1 lb beef sirloin, sliced
8 oz mushrooms
1 small onion, diced
2 cloves garlic, minced
1 cup beef broth
1/2 cup sour cream
2 tbsp flour
Egg noodles`,
    instructions: `Cook noodles according to package directions.

Sauté beef until browned. Remove and set aside.

Cook onions and mushrooms until tender.

Stir in flour, then add beef broth and simmer until thickened.

Stir in sour cream and return beef to pan.

Serve over noodles.`,
  },

  {
    id: "normal-chicken-pot-pie",
    slug: "normal-chicken-pot-pie",
    name: "Chicken Pot Pie",
    effort: "normal",
    photoUrl: "/images/normal-chicken-pot-pie.webp",
    tags: ["dinner", "chicken", "bake", "comfort", "casserole"],
    notes: "Creamy, classic, and one of those dinners that always feels like home.",
    ingredients: `2 cups cooked chicken, diced
1 cup frozen mixed vegetables
1/2 cup butter
1/2 cup flour
2 cups chicken broth
1 cup milk
1 refrigerated pie crust`,
    instructions: `Preheat oven to 400°F.

Melt butter in saucepan. Stir in flour and cook 1 minute.

Whisk in broth and milk. Cook until thickened.

Stir in chicken and vegetables.

Pour mixture into baking dish and top with pie crust.

Bake 30 to 35 minutes until golden.`,
  },

  {
  id: "normal-taco-pasta",
  slug: "normal-taco-pasta",
  name: "Cheesy Taco Pasta",
  photoUrl: "/images/normal-taco-pasta.webp",
  effort: "normal",
  tags: ["dinner", "pasta", "tex-mex", "beef", "cheesy", "family"],
  ingredients: `1 lb ground beef
8 oz pasta
1 can diced tomatoes
1 cup beef broth
1 cup shredded cheddar cheese

Taco Pasta Seasoning:
1 tbsp chili powder
1 tsp cumin
1/2 tsp paprika
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Brown ground beef in a large skillet and drain excess grease.

Cook pasta according to package directions.

Mix Taco Pasta Seasoning ingredients together.

Add diced tomatoes, broth, and seasoning to the beef.

Stir in cooked pasta and shredded cheese until melted and combined.

Serve warm.`,
  notes: "A cheesy taco-inspired pasta that comes together fast.",
},

  {
    id: "pan-seared-scallops-lemon-risotto",
    slug: "pan-seared-scallops-lemon-risotto",
    name: "Pan-Seared Scallops with Lemon Risotto",
    effort: "big",
    photoUrl: "/images/pan-seared-scallops-lemon-risotto.webp",
    tags: ["dinner", "seafood", "shellfish", "scallops", "risotto", "date-night"],
    notes: "A special-occasion dinner that feels restaurant-worthy at home.",
    ingredients: `10 large sea scallops
1 cup Arborio rice
3 cups warm chicken stock
1 tbsp lemon zest
1/2 cup parmesan cheese`,
    instructions: `Sauté rice in butter, then add warm stock one ladle at a time, stirring until absorbed.

Continue adding stock until rice is creamy and tender.

Pat scallops dry and sear in a very hot pan for about 2 minutes per side.

Fold lemon zest and parmesan into the risotto and top with the scallops.`,
  },

  {
    id: "lemon-herb-roasted-salmon",
    slug: "lemon-herb-roasted-salmon",
    name: "Lemon Herb Roasted Salmon",
    effort: "normal",
    photoUrl: "/images/lemon-herb-roasted-salmon.webp",
    tags: ["dinner", "seafood", "fish", "salmon", "oven", "healthy"],
    notes: "A simple salmon dinner that pairs well with roasted vegetables or rice.",
    ingredients: `4 salmon fillets
1 bunch asparagus
1 lemon, sliced
2 tbsp chopped fresh dill
2 cloves garlic, minced
2 tbsp olive oil`,
    instructions: `Preheat oven to 400°F.

Place salmon and asparagus on a baking sheet.

Drizzle with olive oil and top with garlic, dill, and lemon slices.

Roast for 12 to 15 minutes until salmon flakes easily with a fork.`,
  },

  {
    id: "beef-broccoli-stir-fry",
    slug: "beef-broccoli-stir-fry",
    name: "Beef and Broccoli Stir-Fry",
    effort: "quick",
    photoUrl: "/images/beef-broccoli-stir-fry.webp",
    tags: ["dinner", "beef", "stir-fry", "one-pan", "quick"],
    notes: "A better-than-takeout weeknight option with fast cook time and simple ingredients.",
    ingredients: `1 lb flank steak, thinly sliced
3 cups broccoli florets
1/4 cup soy sauce
1 tsp fresh ginger, grated
1 tbsp brown sugar
1 tbsp sesame oil`,
    instructions: `Whisk soy sauce, ginger, and brown sugar in a small bowl.

Heat sesame oil in a wok or large skillet.

Sear beef until browned, then remove from pan.

Stir-fry broccoli until tender-crisp.

Return beef to pan, add sauce, and toss until thickened.`,
  },

  {
    id: "zuppa-toscana-soup",
    slug: "zuppa-toscana-soup",
    name: "Zuppa Toscana Soup",
    effort: "normal",
    photoUrl: "/images/zuppa-toscana-soup.webp",
    tags: ["dinner", "soup", "pork", "italian", "comfort", "one-pot"],
    notes: "A rich and cozy soup that feels like restaurant comfort food at home.",
    ingredients: `1 lb Italian ground sausage
4 tbsp butter
1 white onion, diced
1 tbsp minced garlic
6 cups chicken broth
2 cups water
4–5 yellow potatoes, cut into 1-inch pieces
3 tsp salt, or to taste
1 tsp black pepper
2 cups heavy cream
4 cups fresh kale, chopped
Bacon bits and grated parmesan cheese for topping (optional)`,
    instructions: `In a large pot sauté sausage for 5 to 6 minutes until browned.

Use a slotted spoon to transfer sausage to a plate and set aside.

In the same pot add butter and sauté onions over medium heat until translucent.

Add garlic and sauté for another minute until fragrant.

Add chicken broth, water, potatoes, salt, and pepper and bring to a boil.

Boil until potatoes are tender.

Stir in kale and heavy cream, then add the sausage back to the pot.

Taste and adjust salt and pepper if needed.

Serve topped with grated parmesan cheese and bacon bits if desired.`,
  },

  {
    id: "hidden-veggie-meatloaf",
    slug: "hidden-veggie-meatloaf",
    name: "Hidden Veggie Meatloaf",
    effort: "normal",
    photoUrl: "/images/hidden-veggie-meatloaf.webp",
    tags: ["dinner", "beef", "meatloaf", "family", "comfort", "kid-friendly", "leftovers"],
    notes: "A great way to sneak extra vegetables into dinner without sacrificing comfort-food flavor. Perfect with mashed potatoes.",
    ingredients: `1 1/2 lbs ground beef
1 medium zucchini, peeled and finely grated
2 carrots, peeled and finely grated
1/2 yellow onion, minced or grated
1/2 cup finely chopped spinach
1 large egg
3/4 cup panko breadcrumbs
1/4 cup milk
1 tbsp Worcestershire sauce
1 tsp garlic powder
1 tsp salt
1/2 tsp pepper

For the glaze:
1/2 cup ketchup
1 tbsp brown sugar
1 tsp mustard`,
    instructions: `Preheat oven to 375°F.

After grating the zucchini, squeeze it in a paper towel to remove excess moisture.

In a large bowl, combine egg, milk, breadcrumbs, seasonings, Worcestershire sauce, and all grated vegetables.

Add the ground beef and mix gently until just combined. Do not overmix.

Form into a loaf shape on a parchment-lined baking sheet or press into a loaf pan.

Bake for 40 minutes.

In a small bowl, whisk together ketchup, brown sugar, and mustard.

Brush the glaze generously over the top of the meatloaf and bake for another 15 to 20 minutes, until the internal temperature reaches 160°F.

Let rest for 5 to 10 minutes before slicing.`,
  },

  {
    id: "toms-spaghetti",
    slug: "toms-spaghetti",
    name: "Tom's Spaghetti",
    effort: "normal",
    photoUrl: "/images/toms-spaghetti.webp",
    tags: ["dinner", "pasta", "beef", "spaghetti", "family", "comfort", "leftovers"],
    notes: "A classic, hearty spaghetti dinner that pairs perfectly with Caesar salad and garlic bread.",
    ingredients: `1 box angel hair pasta
1 lb ground beef
1 green pepper, diced
1 (28 oz) can diced tomatoes
1 (16 oz) can tomato sauce
1 (6 oz) can tomato paste
2 tsp dried thyme
4 tbsp Italian seasoning, divided
1 tsp salt
1/2 tsp black pepper
2 tbsp butter
1 tbsp olive oil`,
    instructions: `Cook ground beef in a skillet over medium heat until browned. Drain grease.

Add diced green pepper, diced tomatoes, tomato sauce, tomato paste, thyme, 2 tbsp Italian seasoning, salt, and pepper. Stir well.

Bring to a simmer, reduce heat to low, and simmer for 30 minutes.

In a pot, bring 6 cups of salted water to a boil. Add angel hair pasta and cook for about 5 minutes, stirring occasionally.

Drain pasta and return it to the pot. Add butter, olive oil, and remaining 2 tbsp Italian seasoning. Stir well.

Serve pasta topped with meat sauce.

Optional: Pair with Caesar salad and garlic bread.`,
  },

  {
    id: "shrimp-scampi",
    slug: "shrimp-scampi",
    name: "Shrimp Scampi",
    effort: "quick",
    photoUrl: "/images/shrimp-scampi.webp",
    tags: ["dinner", "seafood", "shellfish", "shrimp", "quick", "skillet", "pasta"],
    notes: "Light, buttery, and full of flavor. Great over angel hair pasta for an easy restaurant-style dinner at home.",
    ingredients: `1 1/2 lbs large shrimp, peeled and deveined
2 tbsp butter
2 tbsp olive oil
4 garlic cloves, minced
1/4 tsp red pepper flakes (optional)
1/2 cup dry white wine or low-sodium chicken broth
1 1/2 tbsp lemon juice
1 lemon, cut into wedges
1/4 cup chopped fresh parsley
Salt and black pepper to taste`,
    instructions: `Pat shrimp dry and season with 1/2 tsp salt and 1/2 tsp pepper.

Heat 1 tbsp olive oil and 1 tbsp butter in a large non-reactive skillet over medium-high heat.

Add shrimp in a single layer and cook 1 to 2 minutes per side until just opaque. Remove to a plate.

Lower heat to medium. Add remaining olive oil and butter.

Sauté garlic and red pepper flakes, if using, for about 30 seconds until fragrant.

Add wine or broth and simmer for 2 minutes until reduced by half.

Stir in lemon juice.

Return shrimp and any juices to the skillet and toss to coat.

Remove from heat and stir in parsley.

Serve with lemon wedges.

Optional: Pair with angel hair pasta.`,
  },

  {
    id: "maryland-crab-cake",
    slug: "maryland-crab-cake",
    name: "Maryland Crab Cake",
    effort: "normal",
    photoUrl: "/images/maryland-crab-cake.webp",
    tags: ["dinner", "seafood", "shellfish", "crab", "baked", "maryland"],
    notes: "Classic crab cakes with plenty of crab flavor and just enough binder to hold them together.",
    ingredients: `1 lb lump crab meat
1 large egg
1/4 cup mayonnaise
1 tsp Dijon mustard
1 tsp Worcestershire sauce
1 tsp fresh lemon juice
1 1/2 tsp Old Bay seasoning
1 tsp fresh parsley, chopped
2/3 cup cracker crumbs
1 lemon, cut into wedges`,
    instructions: `In a small bowl, whisk together mayonnaise, egg, mustard, Worcestershire sauce, Old Bay seasoning, lemon juice, and parsley.

Add crab meat and gently fold it into the sauce.

Add cracker crumbs and continue mixing gently. Be careful not to break up the crab meat too much.

Cover and refrigerate for at least 30 minutes.

Preheat oven to 400°F.

Divide mixture into 6 portions and form into slightly flattened crab cakes.

Place on a parchment-lined baking sheet.

Bake for 15 to 18 minutes, until lightly browned.

Serve with lemon wedges and your choice of cocktail sauce or tartar sauce.`,
  },

  {
    id: "crock-pot-roast-beef",
    slug: "crock-pot-roast-beef",
    name: "Crock Pot Roast Beef",
    effort: "big",
    photoUrl: "/images/crock-pot-roast-beef.webp",
    tags: ["dinner", "beef", "roast", "slow-cooker", "comfort", "family", "leftovers"],
    notes: "A hearty slow-cooker classic with tender beef, vegetables, and an optional homemade gravy.",
    ingredients: `1 1/2 tbsp olive oil, divided
1 (3 lb) chuck roast
Salt and freshly ground black pepper
1 medium yellow onion, peeled, halved, and cut into thick slices
5 garlic cloves, minced
2 cups beef broth
2 tsp Worcestershire sauce
1 tbsp minced fresh thyme
1 tbsp minced fresh rosemary
2 1/2 lbs small Yukon gold potatoes, left whole
2 cups baby carrots
2 cups celery, cut into 1-inch pieces
1 (8 oz) package baby bella mushrooms
2 1/2 tbsp cornstarch mixed with 3 tbsp beef broth, optional
2 tbsp chopped fresh parsley`,
    instructions: `Heat 1 tbsp olive oil in a large pot over medium-high heat.

Pat roast dry and season generously with salt and pepper.

Sear roast until browned on both sides, about 4 to 5 minutes per side. Transfer to slow cooker.

Add remaining 1/2 tbsp olive oil to the pot. Add onion and cook for 2 minutes.

Add mushrooms and cook until they begin to brown. Add garlic and cook for 30 seconds more.

Pour onion and mushroom mixture over roast in slow cooker.

Return pot to heat. Add beef broth, Worcestershire sauce, thyme, and rosemary. Scrape up browned bits from the bottom of the pot, then remove from heat.

Layer potatoes, carrots, and celery over and around the roast. Pour broth mixture over the top and season lightly with salt and pepper.

Cover and cook on low for 8 to 9 hours, until roast and vegetables are tender.

Remove roast and vegetables. Shred roast and discard excess fat.

Optional gravy: Strain broth into a saucepan. Heat over medium-high. Whisk cornstarch mixture, then stir into broth. Simmer 30 to 60 seconds until thickened.

Serve roast and vegetables topped with gravy and sprinkled with parsley.`,
  },

  {
  id: "big-crockpot-potato-soup",
  slug: "big-crockpot-potato-soup",
  name: "Crock Pot Potato Soup",
  photoUrl: "/images/big-crockpot-potato-soup.webp",
  effort: "big",
  tags: ["dinner", "soup", "comfort", "slow-cooker", "potatoes", "family"],
  ingredients: `1 bag frozen breakfast potatoes
1 (32 oz) chicken broth
1 (10.75 oz) cream of chicken soup
1/2 cup onion, chopped
1/3 tsp black pepper
1 (8 oz) cream cheese, softened
Green onion, chopped (optional)
Shredded cheddar cheese (optional)
Bacon bits (optional)`,
  instructions: `Add frozen potatoes, chicken broth, cream of chicken soup, onion, and pepper to a crock pot.

Cover and cook on low for 5 hours.

Add softened cream cheese and cook for an additional 30 minutes, stirring occasionally until smooth.

Serve hot and top with cheddar cheese, bacon bits, and green onions if desired.`,
  notes: "Super easy comfort meal. Thick, creamy, and perfect for colder days.",
},
{
  id: "quick-blueberry-cheesecake-crescent-rolls",
  slug: "quick-blueberry-cheesecake-crescent-rolls",
  name: "Blueberry Cheesecake Crescent Rolls",
  photoUrl: "/images/quick-blueberry-cheesecake-crescent-rolls.webp",
  effort: "quick",
  tags: ["dessert", "quick", "sweet", "baked", "blueberry", "easy"],
  ingredients: `3 oz cream cheese, softened
1/2 tsp vanilla extract
2 1/2 tbsp powdered sugar
1 tube crescent roll dough
2/3 cup fresh blueberries`,
  instructions: `Preheat oven to 375°F.

In a bowl, mix cream cheese, vanilla, and powdered sugar until smooth.

Separate crescent dough into triangles.

Spread cream cheese mixture on the bottom third of each triangle and top with blueberries.

Roll from the wide end to the tip.

Place on a baking sheet and bake for 10 minutes or until golden brown.`,
  notes: "Simple dessert that feels fancy. Great for breakfast treats too.",
},
{
  id: "big-french-toast-casserole",
  slug: "big-french-toast-casserole",
  name: "French Toast Casserole",
  photoUrl: "/images/big-french-toast-casserole.webp",
  effort: "big",
  tags: ["breakfast", "brunch", "baked", "sweet", "family", "make-ahead"],
  ingredients: `1 loaf sourdough bread
8 large eggs
2 cups milk
1/2 cup heavy cream
1 tbsp vanilla extract
3/4 cup sugar
1/2 cup all-purpose flour
1/2 cup light brown sugar
1 tsp ground cinnamon
1/4 tsp salt
1 stick unsalted butter, cut into pieces
Fresh blueberries (optional)
Fresh strawberries (optional)`,
  instructions: `Preheat oven to 350°F.

Cut bread into cubes and place in a greased 9x13 baking dish.

Mix eggs, milk, cream, vanilla, and sugar. Pour over bread.

Cover and refrigerate for at least 4 hours.

Mix flour, brown sugar, cinnamon, and salt. Cut in butter until crumbly. Refrigerate.

Remove dish from fridge and sprinkle topping over bread.

Bake uncovered for 50 minutes.

Top with fresh fruit if desired.`,
  notes: "Perfect make-ahead breakfast for holidays or weekends.",
},
{
  id: "quick-captains-wing-rub",
  slug: "quick-captains-wing-rub",
  name: "Captain's Wing Rub",
  photoUrl: "/images/quick-captains-wing-rub.webp",
  effort: "quick",
  tags: ["seasoning", "spice", "wings", "bbq", "homemade"],
  ingredients: `2 tbsp smoked paprika
1 1/2 tbsp cayenne pepper
1 tsp ancho chili powder
1 tsp garlic powder
1 tsp onion powder
1 tsp fine sea salt
1/2 tsp citric acid
1/2 tsp cumin
1/4 tsp chipotle powder
1/2 tsp jalapeno pepper flakes`,
  instructions: `Combine all ingredients in a bowl.

Mix thoroughly and store in an airtight container.

Use as a dry rub or seasoning for wings and meats.`,
  notes: "Bold, spicy, and tangy. Great for wings or grilled meats.",
},
{
  id: "big-crispy-chicken-wings",
  slug: "big-crispy-chicken-wings",
  name: "Crispy Chicken Wings",
  photoUrl: "/images/big-crispy-chicken-wings.webp",
  effort: "big",
  tags: ["dinner", "wings", "fried", "game-day", "crispy", "comfort"],
  ingredients: `2–3 lbs chicken wings
Vegetable oil (for frying)
1 tbsp beef tallow
1/2 cup cornstarch
Celery (optional)
Carrots (optional)
Wing sauce of choice

Buffalo Sauce:
1/2 cup Frank’s RedHot
1/3 cup melted butter`,
  instructions: `If using whole wings, separate into flats and drums.

Pat wings completely dry. For best results, refrigerate uncovered overnight.

Heat oil and beef tallow to 375°F.

Toss wings with cornstarch and seasoning.

Fry in batches for 10–12 minutes until golden and internal temp reaches 165°F.

Remove to a wire rack.

Toss in sauce or serve sauce on the side.`,
  notes: "Crispy, restaurant-quality wings at home. Drying them well is key.",
}
];

// =====================================================
// SIDE DISHES / DESSERTS / NON-DINNER EXTRAS
// =====================================================

export const SIDE_DISHES: Meal[] = [
  {
    id: "quick-airfryer-baked-potato",
    slug: "quick-airfryer-baked-potato",
    name: "Air Fryer Baked Potato",
    effort: "quick",
    photoUrl: "/images/quick-airfryer-baked-potato.webp",
    tags: ["side", "air-fryer", "comfort", "quick", "vegetarian"],
    notes: "An easy side dish that goes with almost anything and needs very little hands-on work.",
    ingredients: `1 large russet potato
1/2 tsp salt
1 Tbsp olive oil (or cooking spray)
1–2 Tbsp butter (depending on potato size)
Shredded cheese (optional)
Sour cream (optional)`,
    instructions: `Rinse the potato and dry completely.
Pierce the potato with a fork in 4 to 6 spots.
Coat the potato evenly with olive oil or spray.
Sprinkle with salt and rotate to coat all sides.
Preheat air fryer to 400°F.
Air fry for 60 minutes, shaking the basket once or twice.
Slice down the middle, fluff with a fork, and add butter and toppings.`,
  },

  {
    id: "quick-garlic-roasted-potatoes",
    slug: "quick-garlic-roasted-potatoes",
    name: "Garlic Roasted Potatoes",
    effort: "quick",
    photoUrl: "/images/quick-garlic-roasted-potatoes.webp",
    tags: ["side", "roasted", "vegetarian", "comfort"],
    notes: "Crispy, simple potatoes that work with almost any main dish.",
    ingredients: `3 lbs small red or white potatoes
1/4 cup olive oil
1 1/2 tsp kosher salt
1 tsp freshly ground black pepper
2 tbsp minced garlic
2 tbsp minced fresh parsley`,
    instructions: `Preheat oven to 400°F.

Cut potatoes in halves or quarters and place in a bowl with olive oil, salt, pepper, and garlic. Toss until coated.

Transfer to a sheet pan and spread into a single layer.

Roast 45 minutes to 1 hour until browned and crisp, flipping twice during cooking for even browning.

Remove from oven, toss with parsley, season to taste, and serve hot.`,
  },

  {
    id: "quick-roasted-broccoli",
    slug: "quick-roasted-broccoli",
    name: "Roasted Broccoli",
    effort: "quick",
    photoUrl: "/images/quick-roasted-broccoli.webp",
    tags: ["side", "roasted", "vegetarian", "healthy", "quick"],
    notes: "A fast vegetable side that pairs well with chicken, pasta, or fish.",
    ingredients: `1 1/2 lbs broccoli florets
1/4 cup olive oil
1 1/2 tsp kosher salt
1/2 tsp freshly ground black pepper`,
    instructions: `Place a foil-lined baking sheet on the middle rack in the oven and preheat to 425°F.

Toss broccoli with olive oil, salt, and pepper until fully coated.

Carefully spread broccoli on the hot baking sheet in an even layer, scraping any oil and seasoning from the bowl over the broccoli.

Roast 14 to 16 minutes, tossing halfway through, until browned and tender-crisp.

Transfer to a serving platter and serve hot.`,
  },
];

export const DESSERTS: Meal[] = [
  {
    id: "quick-dark-chocolate-dipped-strawberries",
    slug: "quick-dark-chocolate-dipped-strawberries",
    name: "Dark Chocolate Dipped Strawberries",
    effort: "quick",
    photoUrl: "/images/quick-dark-chocolate-dipped-strawberries.webp",
    tags: ["dessert", "snack", "no-bake", "quick", "vegetarian"],
    notes: "A simple dessert that feels special without a lot of work.",
    ingredients: `12 large ripe strawberries
1/2 cup dark chocolate baking chips
1 tsp coconut oil`,
    instructions: `Wash strawberries and dry completely. Chocolate will not stick if wet.
Bring a small pot with a few inches of water to a gentle simmer.
Add chocolate chips and coconut oil to a heat-safe glass bowl.
Set bowl over the pot like a double boiler, making sure the bowl does not touch the water.
Stir until chocolate is fully melted and smooth.
Line a sheet pan with parchment paper.
Dip strawberries one at a time and place on parchment.
Refrigerate 20 to 30 minutes until chocolate sets.
Store leftovers in an airtight container in the refrigerator.`,
  },
];

export const EXTRA_RECIPES: Meal[] = [
  {
    id: "quick-classic-guacamole",
    slug: "quick-classic-guacamole",
    name: "Guacamole",
    effort: "quick",
    photoUrl: "/images/quick-classic-guacamole.webp",
    tags: ["dip", "snack", "mexican", "no-cook", "quick", "vegetarian"],
    notes: "Fresh and simple guacamole that works as a snack, side, or taco-night add-on.",
    ingredients: `3 ripe avocados, peeled and pitted
1 lime, juiced
1 tsp salt
1/2 cup diced white onion
3 Tbsp chopped fresh cilantro
2 Roma tomatoes, diced
1 tsp minced garlic
Pinch of ground cayenne pepper (optional)`,
    instructions: `Mash avocados with lime juice and salt until slightly chunky.
Stir in onion, cilantro, tomatoes, and garlic.
Add cayenne pepper if desired and mix well.
Taste and adjust salt or lime as needed.
Refrigerate 1 hour for best flavor, or serve immediately.`,
  },

  {
    id: "quick-homemade-chili-seasoning",
    slug: "quick-homemade-chili-seasoning",
    name: "Homemade Chili Seasoning",
    effort: "quick",
    photoUrl: "/images/quick-homemade-chili-seasoning.webp",
    tags: ["seasoning", "pantry", "spice-mix", "quick", "vegetarian"],
    notes: "A pantry staple that is great to keep on hand for chili nights.",
    ingredients: `1 Tbsp chili powder
1 tsp ground cumin
1/4 tsp cayenne pepper
1/4 tsp garlic powder
1/2 tsp onion powder
1 tsp salt
1/4 tsp freshly ground black pepper
Small pinch ground cinnamon`,
    instructions: `Add all ingredients to a small bowl.
Stir very well until evenly combined.
Transfer to an airtight container or spice shaker.
Store in a cool, dry place.
Use in place of one store-bought chili seasoning packet.`,
  },

  {
    id: "normal-spinach-mushroom-feta-crustless-quiche",
    slug: "normal-spinach-mushroom-feta-crustless-quiche",
    name: "Spinach Mushroom Feta Crustless Quiche",
    effort: "normal",
    photoUrl: "/images/normal-spinach-mushroom-feta-crustless-quiche.webp",
    tags: ["breakfast", "brunch", "vegetarian", "bake", "meal-prep", "healthy"],
    notes: "A good breakfast-for-dinner or meal-prep option with lots of savory flavor.",
    ingredients: `1 (10 oz) bag spinach
8 oz baby bella mushrooms, sliced
1 clove garlic, minced
1/8 tsp salt
1 Tbsp cooking oil, divided
2 oz feta cheese, crumbled
4 large eggs
1/4 cup grated Parmesan cheese
1/4 tsp black pepper
1 cup milk
1/2 cup shredded mozzarella`,
    instructions: `Preheat oven to 350°F.

Rinse mushrooms and slice thinly. Mince garlic.

In a skillet over medium heat, add mushrooms, garlic, salt, and 1/2 Tbsp cooking oil.
Sauté until mushrooms release moisture and it fully evaporates. No liquid should remain.

Brush remaining 1/2 Tbsp oil inside a 9-inch pie plate.

Layer cooked mushrooms, fresh spinach, and crumbled feta into the pie plate.

In a large bowl, whisk together eggs, Parmesan, black pepper, and milk.

Pour egg mixture evenly over the vegetables and cheese.
Top with shredded mozzarella.

Bake for about 50 minutes, or until golden on top and internal temperature reaches 160°F.

Let rest slightly before slicing and serving.`,
  },

  {
    id: "quick-sausage-muffins",
    slug: "quick-sausage-muffins",
    name: "Sausage Muffins",
    effort: "quick",
    photoUrl: "/images/quick-sausage-muffins.webp",
    tags: ["breakfast", "quick", "kid-friendly", "meal-prep", "pork"],
    notes: "Easy grab-and-go breakfast muffins that also work for busy mornings or snacks.",
    ingredients: `1 cup Bisquick
1 lb breakfast sausage, cooked
4 eggs, beaten
1 cup shredded cheddar cheese`,
    instructions: `Preheat oven to 350°F.

Cook sausage and set aside.

In a medium bowl, combine eggs, Bisquick, sausage, and cheese. Mix well.

Spray muffin tins with cooking spray.

Fill each muffin cup 1/2 to 3/4 full.

Bake for 20 minutes or until set and lightly browned.`,
  },

  {
    id: "grilled-cheese-sandwich",
    slug: "grilled-cheese-sandwich",
    name: "Grilled Cheese Sandwich",
    effort: "quick",
    photoUrl: "/images/grilled-cheese-sandwich.webp",
    tags: ["lunch", "sandwich", "quick", "comfort", "cheese"],
    notes: "Simple, classic, and always a winner. Even better with a bowl of warm tomato soup.",
    ingredients: `Sourdough bread
Butter
Mild cheddar cheese slices`,
    instructions: `Spread 1/2 tbsp butter on one side of each slice of bread.

Heat a non-stick pan over medium-low heat.

Place 2 slices of bread in the pan, buttered side down.

Stack cheese slices on one piece of bread, then top with the other piece of bread.

Cook, flipping once, until both sides are golden brown and the cheese is melted, about 6 minutes total.

Cut in half diagonally and serve.

Optional: Serve with warm tomato soup.`,
  },

   {
    id: "quick-sloppy-joes-sandwich",
    slug: "quick-sloppy-joes-sandwich",
    name: "Sloppy Joes Sandwich",
    photoUrl: "/images/quick-sloppy-joes-sandwich.webp",
    notes: "A smoky, saucy sandwich dinner that is easy to make and always family-friendly.",
    effort: "quick",
    tags: ["dinner", "beef", "sandwiches", "quick", "family-friendly"],
    ingredients: `2 cloves garlic, minced
1 lb ground beef
8 oz tomato sauce
½ cup ketchup
2 tbsp brown sugar
2 tbsp Worcestershire sauce
1 tsp mustard
½ tsp garlic powder
¼ tsp onion powder
pepper, to taste
Hamburger buns
Sliced pickles`,
    instructions: `In a medium bowl stir together the tomato sauce, ketchup, brown sugar, Worcestershire sauce, mustard, garlic powder, onion powder, and pepper until well combined; set aside.

Set a large pot over medium-low heat. Add a few drops of extra-virgin olive oil, and saute the garlic for a minute or two until just fragrant and very light golden brown. Add ground beef, increase heat to medium/medium high, and cook until nicely browned with no pink remaining, breaking apart and stirring as the meat cooks. Drain the grease.

Pour the sauce over the browned meat, stir to combine, and simmer for at least 10 minutes until heated through, stirring occasionally.

Serve warm on hamburger buns with sliced pickles on top.`,
  },

  {
    id: "quick-chicken-parmesan-melts",
    slug: "quick-chicken-parmesan-melts",
    name: "Chicken Parmesan Melts",
    photoUrl: "/images/quick-chicken-parmesan-melts.webp",
    notes: "An easy shortcut dinner with crispy chicken, marinara, and melted mozzarella on rolls.",
    effort: "quick",
    tags: ["dinner", "chicken", "quick", "italian", "sandwiches", "cheesy"],
    ingredients: `4 cooked chicken cutlets or breaded chicken patties
1 cup marinara sauce
1 cup shredded mozzarella
4 sandwich rolls`,
    instructions: `Heat chicken according to package directions or warm leftover cutlets.

Place chicken on rolls, top with marinara and mozzarella.

Broil or bake until cheese is melted and bubbly.

Serve warm.`,
  },

  {
    id: "quick-taco-mac-skillet",
    slug: "quick-taco-mac-skillet",
    name: "Taco Mac Skillet",
    photoUrl: "/images/quick-taco-mac-skillet.webp",
    notes: "A fast one-pan mashup of taco night and mac and cheese with bold Tex-Mex flavor.",
    effort: "quick",
    tags: ["dinner", "beef", "pasta", "quick", "tex-mex", "one-pan"],
    ingredients: `1 lb ground beef
2 cups cooked macaroni
1 packet taco seasoning
1/2 cup water
1 cup salsa
1 cup shredded cheddar`,
    instructions: `Brown ground beef in a skillet and drain if needed.

Add taco seasoning, water, and salsa. Stir well.

Fold in cooked macaroni and cheddar.

Cook until cheese melts and everything is hot. Serve immediately.`,
  },

  {
    id: "quick-lemon-pepper-tilapia",
    slug: "quick-lemon-pepper-tilapia",
    name: "Lemon Pepper Tilapia",
    photoUrl: "/images/quick-lemon-pepper-tilapia.webp",
    notes: "A light and quick seafood dinner with bright lemon flavor and simple seasoning.",
    effort: "quick",
    tags: ["dinner", "fish", "quick", "seafood", "light"],
    ingredients: `4 tilapia fillets
1 tbsp olive oil
1 tsp lemon pepper seasoning
1/2 tsp garlic powder
1 lemon, sliced
Salt to taste`,
    instructions: `Heat olive oil in a skillet over medium heat.

Season tilapia with lemon pepper, garlic powder, and salt.

Cook 3–4 minutes per side until fish flakes easily.

Serve with lemon slices and a simple side.`,
  },

   {
    id: "quick-bbq-chicken",
    slug: "quick-bbq-chicken",
    name: "Oven BBQ Chicken",
    photoUrl: "/images/quick-bbq-chicken.webp",
    notes: "BBQ chicken is a savory dish featuring tender, juicy chicken that is seasoned with a savory BBQ sauce and baked to perfection",
    effort: "quick",
    tags: ["dinner", "chicken", "quick", "bbq", "family-friendly"],
    ingredients: `4 boneless skinless chicken breasts
extra virgin olive oil
salt , to taste
pepper , to taste
½ cup BBQ sauce`,
    instructions: `Preheat the oven to 450. 

Drizzle each chicken breast with oil. Season with kosher salt and black pepper. Place on a baking sheet lined with aluminum foil.

Bake in the oven for 15 minutes. Brush the top side of the chicken with BBQ sauce, return to the oven and cook for 5-8 minutes longer, or until the internal temperature is 160°.

Let the chicken rest a few minutes for the internal temp to raise to 165° and the juices to settle before serving.

Serve with corn in the cob.`,
  },

  {
    id: "normal-simple-tacos",
    slug: "normal-simple-tacos",
    name: "Simple Tacos",
    photoUrl: "/images/normal-simple-tacos.webp",
    notes: "Tacos are a fast, versatile, and crowd-pleasing dish featuring seasoned ground beef tucked into crispy hard shells or soft tortillas",
    effort: "normal",
    tags: ["dinner", "beef", "tacos", "simple", "family-friendly"],
    ingredients: `1 lb ground beef 
1 packet taco seasoning (Store bought or make your own, see below 👇)
2/3 cup of water
1/2 white onion, diced
4 roma tomatoes, diced
1 cup shredded cheddar cheese 
2 cups lettuce, chopped 
Taco shells (hard or soft)
hot sauce (optional)
sour cream (optional)

Taco seasoning:
½ tbsp chili powder
1 tsp cumin
1 tsp salt
½ tsp garlic powder
½ tsp onion powder
½ tsp paprika
⅛ tsp oregano
¼ tsp pepper
⅛ tsp crushed red pepper or jalapeno flakes `,
    instructions: `Preheat oven to 350

If you are making the taco seasoning, add all the ingredients in a bowl and stir until combined. Set aside.

In a skillet add you ground beef and cook until there is no more pink, drain excess grease. Add water and seasoning and bring to a simmer. Cook until the meat mixture soaks up all the water.

Cook taco shells according to the package. Place diced onions, diced tomatoes, shredded cheese, chopped lettuce and optional ingredients out for a taco bar.`,
  },

   {
    id: "quick-sloppy-joes-sandwich",
    slug: "quick-sloppy-joes-sandwich",
    name: "Sloppy Joes Sandwich",
    photoUrl: "/images/quick-sloppy-joes-sandwich.webp",
    notes: "A smoky, saucy sandwich dinner that is easy to make and always family-friendly.",
    effort: "quick",
    tags: ["dinner", "beef", "sandwiches", "quick", "family-friendly"],
    ingredients: `2 cloves garlic, minced
1 lb ground beef
8 oz tomato sauce
½ cup ketchup
2 tbsp brown sugar
2 tbsp Worcestershire sauce
1 tsp mustard
½ tsp garlic powder
¼ tsp onion powder
pepper, to taste
Hamburger buns
Sliced pickles`,
    instructions: `In a medium bowl stir together the tomato sauce, ketchup, brown sugar, Worcestershire sauce, mustard, garlic powder, onion powder, and pepper until well combined; set aside.

Set a large pot over medium-low heat. Add a few drops of extra-virgin olive oil, and saute the garlic for a minute or two until just fragrant and very light golden brown. Add ground beef, increase heat to medium/medium high, and cook until nicely browned with no pink remaining, breaking apart and stirring as the meat cooks. Drain the grease.

Pour the sauce over the browned meat, stir to combine, and simmer for at least 10 minutes until heated through, stirring occasionally.

Serve warm on hamburger buns with sliced pickles on top.`,
  },

  {
    id: "quick-chicken-parmesan-melts",
    slug: "quick-chicken-parmesan-melts",
    name: "Chicken Parmesan Melts",
    photoUrl: "/images/quick-chicken-parmesan-melts.webp",
    notes: "An easy shortcut dinner with crispy chicken, marinara, and melted mozzarella on rolls.",
    effort: "quick",
    tags: ["dinner", "chicken", "quick", "italian", "sandwiches", "cheesy"],
    ingredients: `4 cooked chicken cutlets or breaded chicken patties
1 cup marinara sauce
1 cup shredded mozzarella
4 sandwich rolls`,
    instructions: `Heat chicken according to package directions or warm leftover cutlets.

Place chicken on rolls, top with marinara and mozzarella.

Broil or bake until cheese is melted and bubbly.

Serve warm.`,
  },

  {
    id: "quick-taco-mac-skillet",
    slug: "quick-taco-mac-skillet",
    name: "Taco Mac Skillet",
    photoUrl: "/images/quick-taco-mac-skillet.webp",
    notes: "A fast one-pan mashup of taco night and mac and cheese with bold Tex-Mex flavor.",
    effort: "quick",
    tags: ["dinner", "beef", "pasta", "quick", "tex-mex", "one-pan"],
    ingredients: `1 lb ground beef
2 cups cooked macaroni
1 packet taco seasoning
1/2 cup water
1 cup salsa
1 cup shredded cheddar`,
    instructions: `Brown ground beef in a skillet and drain if needed.

Add taco seasoning, water, and salsa. Stir well.

Fold in cooked macaroni and cheddar.

Cook until cheese melts and everything is hot. Serve immediately.`,
  },

  {
    id: "quick-lemon-pepper-tilapia",
    slug: "quick-lemon-pepper-tilapia",
    name: "Lemon Pepper Tilapia",
    photoUrl: "/images/quick-lemon-pepper-tilapia.webp",
    notes: "A light and quick seafood dinner with bright lemon flavor and simple seasoning.",
    effort: "quick",
    tags: ["dinner", "fish", "quick", "seafood", "light"],
    ingredients: `4 tilapia fillets
1 tbsp olive oil
1 tsp lemon pepper seasoning
1/2 tsp garlic powder
1 lemon, sliced
Salt to taste`,
    instructions: `Heat olive oil in a skillet over medium heat.

Season tilapia with lemon pepper, garlic powder, and salt.

Cook 3–4 minutes per side until fish flakes easily.

Serve with lemon slices and a simple side.`,
  },

   {
    id: "quick-bbq-chicken",
    slug: "quick-bbq-chicken",
    name: "Oven BBQ Chicken",
    photoUrl: "/images/quick-bbq-chicken.webp",
    notes: "BBQ chicken is a savory dish featuring tender, juicy chicken that is seasoned with a savory BBQ sauce and baked to perfection",
    effort: "quick",
    tags: ["dinner", "chicken", "quick", "bbq", "family-friendly"],
    ingredients: `4 boneless skinless chicken breasts
extra virgin olive oil
salt , to taste
pepper , to taste
½ cup BBQ sauce`,
    instructions: `Preheat the oven to 450. 

Drizzle each chicken breast with oil. Season with kosher salt and black pepper. Place on a baking sheet lined with aluminum foil.

Bake in the oven for 15 minutes. Brush the top side of the chicken with BBQ sauce, return to the oven and cook for 5-8 minutes longer, or until the internal temperature is 160°.

Let the chicken rest a few minutes for the internal temp to raise to 165° and the juices to settle before serving.

Serve with corn in the cob.`,
  },

  {
    id: "normal-simple-tacos",
    slug: "normal-simple-tacos",
    name: "Simple Tacos",
    photoUrl: "/images/normal-simple-tacos.webp",
    notes: "Tacos are a fast, versatile, and crowd-pleasing dish featuring seasoned ground beef tucked into crispy hard shells or soft tortillas",
    effort: "normal",
    tags: ["dinner", "beef", "tacos", "simple", "family-friendly"],
    ingredients: `1 lb ground beef 
1 packet taco seasoning (Store bought or make your own, see below 👇)
2/3 cup of water
1/2 white onion, diced
4 roma tomatoes, diced
1 cup shredded cheddar cheese 
2 cups lettuce, chopped 
Taco shells (hard or soft)
hot sauce (optional)
sour cream (optional)

Taco seasoning:
½ tbsp chili powder
1 tsp cumin
1 tsp salt
½ tsp garlic powder
½ tsp onion powder
½ tsp paprika
⅛ tsp oregano
¼ tsp pepper
⅛ tsp crushed red pepper or jalapeno flakes `,
    instructions: `Preheat oven to 350

If you are making the taco seasoning, add all the ingredients in a bowl and stir until combined. Set aside.

In a skillet add you ground beef and cook until there is no more pink, drain excess grease. Add water and seasoning and bring to a simmer. Cook until the meat mixture soaks up all the water.

Cook taco shells according to the package. Place diced onions, diced tomatoes, shredded cheese, chopped lettuce and optional ingredients out for a taco bar.`,
  },

  {
    id: "big-beef-lasagna",
    slug: "big-beef-lasagna",
    name: "Classic Lasagna",
    photoUrl: "/images/big-beef-lasagna.webp",
    notes: "A crowd-pleasing layered pasta bake with beef, sausage, ricotta, and plenty of cheese.",
    effort: "big",
    tags: ["dinner", "pasta", "beef", "baked", "italian", "crowd-pleaser"],
    ingredients: `12 lasagna noodles uncooked
2 ½ cups shredded mozzarella cheese
¼ cup shredded Parmesan cheese
½ pound lean ground beef
½ pound Italian sausage
1 yellow onion diced
2 cloves garlic minced
36 ounces pasta sauce
2 tablespoons tomato paste
1 teaspoon Italian seasoning
½ teaspoon salt more to taste
2 cups ricotta cheese or cottage cheese
¼ cup chopped fresh parsley
1 large egg beaten
1 ½ cups shredded mozzarella cheese
¼ cup shredded Parmesan cheese
¼ teaspoon salt`,
    instructions: `Preheat the oven to 350°F. 

Bring a large pot of salted water to a boil. Add the lasagna noodles and cook until al dente. Drain, rinse under cold water, and set aside.

In a large skillet brown the beef, sausage, onion, and garlic over medium-high heat until no pink remains. Drain any fat.

Stir in the pasta sauce, tomato paste, Italian seasoning, ½ teaspoon of salt, and ¼ teaspoon of black pepper. Simmer uncovered over medium heat for 5 minutes or until slightly thickened. Taste and season with additional salt if desired.

In a separate medium bowl, combine 1 ½ cups mozzarella cheese, ¼ cup parmesan cheese, ricotta, parsley, egg, and ¼ teaspoon salt.

Spread 1 cup of the meat sauce in a 9×13 pan or casserole dish. Top it with 3 lasagna noodles. Layer with 1 cup of the ricotta cheese mixture and 1 cup of meat sauce. Repeat twice more. Finish with 3 noodles topped with remaining sauce.

Cover with foil and bake for 45 minutes. 
Remove the foil and sprinkle the top of the lasagna with 2 ½ cups mozzarella cheese and ¼ cup Parmesan cheese. 

Bake uncovered for an additional 15 minutes or until browned and bubbly. Broil for 2-3 minutes if desired.

Rest for at least 15 minutes before cutting.`,
  },

  {
  id: "normal-chili-cheese-dogs",
  slug: "normal-chili-cheese-dogs",
  name: "Chili Cheese Dogs",
  photoUrl: "/images/normal-chili-cheese-dogs.png",
  effort: "normal",
  tags: ["dinner", "hot-dogs", "family", "comfort", "quick-ish"],
  ingredients: `8 hot dogs
8 hot dog buns
1 cup shredded cheddar cheese
1 small onion, diced (optional)

Quick Chili Topping:
1 lb ground beef
1 can tomato sauce
1 tbsp chili powder
1 tsp cumin
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Cook hot dogs using your preferred method.

In a skillet, brown the ground beef and drain excess grease.

Add tomato sauce and all Quick Chili Topping seasonings. Stir and simmer for 10 minutes.

Place hot dogs in buns and top with chili, cheddar cheese, and onion if desired.

Serve warm.`,
  notes: "An easy dinner that feels fun and filling for the whole family.",
},
{
  id: "big-white-chicken-chili",
  slug: "big-white-chicken-chili",
  name: "White Chicken Chili",
  photoUrl: "/images/big-white-chicken-chili.png",
  effort: "big",
  tags: ["dinner", "chili", "chicken", "comfort", "one-pot", "creamy"],
  ingredients: `2 cups cooked shredded chicken
1 small onion, chopped
2 cloves garlic, minced
2 cans white beans, drained
1 can green chiles
4 cups chicken broth
4 oz cream cheese, softened

White Chili Seasoning:
1 tsp cumin
1 tsp chili powder
1/2 tsp oregano
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp black pepper
1/4 tsp cayenne pepper (optional)`,
  instructions: `Add onion and garlic to a large pot and cook until softened.

Stir in chicken, beans, green chiles, and chicken broth.

Mix White Chili Seasoning ingredients together and add to the pot.

Simmer for 20 minutes.

Stir in cream cheese until smooth and fully combined.

Serve hot.`,
  notes: "Creamy, cozy, and a great twist on classic chili night.",
},

{
  id: "normal-taco-soup",
  slug: "normal-taco-soup",
  name: "Taco Soup",
  photoUrl: "/images/normal-taco-soup.png",
  effort: "normal",
  tags: ["dinner", "soup", "tex-mex", "one-pot", "beef", "family"],
  ingredients: `1 lb ground beef
1 small onion, chopped
1 can corn, drained
1 can black beans, drained
1 can diced tomatoes
1 can Rotel
2 cups beef broth

Taco Seasoning:
1 tbsp chili powder
1 tsp cumin
1/2 tsp paprika
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Brown ground beef with onion in a large pot and drain excess grease.

Add corn, black beans, diced tomatoes, Rotel, and broth.

Mix Taco Seasoning ingredients together and stir into the soup.

Simmer for 20 to 25 minutes.

Serve with shredded cheese, sour cream, or tortilla chips if desired.`,
  notes: "Easy taco flavor in a cozy soup form.",
},
{
  id: "big-sheet-pan-fajitas",
  slug: "big-sheet-pan-fajitas",
  name: "Sheet Pan Fajitas",
  photoUrl: "/images/big-sheet-pan-fajitas.png",
  effort: "big",
  tags: ["dinner", "chicken", "sheet-pan", "tex-mex", "family"],
  ingredients: `1 1/2 lbs chicken breast, sliced
2 bell peppers, sliced
1 onion, sliced
2 tbsp olive oil

Fajita Seasoning:
1 tbsp chili powder
1 tsp paprika
1 tsp cumin
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp black pepper
1/4 tsp cayenne pepper (optional)

Tortillas for serving`,
  instructions: `Preheat oven to 425°F.

Place chicken, peppers, and onion on a sheet pan.

Mix Fajita Seasoning ingredients together and sprinkle over the pan.

Drizzle with olive oil and toss everything well.

Bake for 20 to 25 minutes, stirring once halfway through.

Serve in warm tortillas.`,
  notes: "A colorful, easy dinner with homemade fajita flavor.",
},
{
  id: "normal-air-fryer-chicken-tenders",
  slug: "normal-air-fryer-chicken-tenders",
  name: "Air Fryer Chicken Tenders",
  photoUrl: "/images/normal-air-fryer-chicken-tenders.png",
  effort: "normal",
  tags: ["dinner", "chicken", "air-fryer", "family", "crispy", "kid-friendly"],
  ingredients: `1 1/2 lbs chicken tenders
1 cup breadcrumbs
1/2 cup flour
2 eggs, beaten

Chicken Seasoning:
1 tsp paprika
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp black pepper

Cooking spray`,
  instructions: `Preheat air fryer to 400°F.

Mix Chicken Seasoning into the breadcrumbs.

Dredge chicken in flour, then egg, then seasoned breadcrumbs.

Place tenders in the air fryer basket in a single layer and spray lightly with cooking spray.

Cook for 10 to 12 minutes, flipping halfway through, until golden and cooked through.

Serve hot.`,
  notes: "Crispy homemade tenders with an easy built-in seasoning blend.",
},
{
  id: "big-baked-chicken-thighs",
  slug: "big-baked-chicken-thighs",
  name: "Baked Chicken Thighs",
  photoUrl: "/images/big-baked-chicken-thighs.png",
  effort: "big",
  tags: ["dinner", "chicken", "baked", "family", "crispy", "comfort"],
  ingredients: `6 bone-in chicken thighs
1 tbsp olive oil

Chicken Rub:
1 tsp smoked paprika
1 tsp garlic powder
1 tsp onion powder
1/2 tsp salt
1/2 tsp black pepper
1/2 tsp dried thyme`,
  instructions: `Preheat oven to 425°F.

Pat chicken thighs dry and rub with olive oil.

Mix Chicken Rub ingredients together and coat the chicken evenly.

Place on a baking sheet or baking dish.

Bake for 35 to 40 minutes until skin is crisp and chicken is cooked through.

Serve hot.`,
  notes: "Simple, flavorful baked chicken with a great crispy finish.",
},

{
  id: "big-bbq-chicken-drumsticks",
  slug: "big-bbq-chicken-drumsticks",
  name: "BBQ Chicken Drumsticks",
  photoUrl: "/images/big-bbq-chicken-drumsticks.jpg",
  effort: "big",
  tags: ["dinner", "chicken", "bbq", "baked", "family", "comfort"],
  ingredients: `8 chicken drumsticks
1 tbsp olive oil
1/2 cup barbecue sauce

BBQ Rub:
1 tsp smoked paprika
1 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/2 tsp black pepper
1/2 tsp brown sugar`,
  instructions: `Preheat oven to 400°F.

Pat drumsticks dry and rub with olive oil.

Mix BBQ Rub ingredients together and season the drumsticks evenly.

Bake for 35 minutes.

Brush with barbecue sauce and bake an additional 10 minutes until sticky and cooked through.

Serve hot.`,
  notes: "A simple baked BBQ chicken recipe with great flavor from the rub.",
},
];

// =====================================================
// VEGETARIAN DINNERS
// =====================================================

export const NEW_VEGETARIAN_RECIPES: Meal[] = [
  {
    id: "quick-vegetable-stir-fry",
    slug: "quick-vegetable-stir-fry",
    name: "Vegetable Stir Fry",
    effort: "quick",
    photoUrl: "/images/quick-vegetable-stir-fry.webp",
    tags: ["vegetarian", "dinner", "quick", "healthy", "skillet", "asian"],
    notes: "A flexible, colorful dinner that is easy to adjust with whatever vegetables you have on hand.",
    ingredients: `2 tbsp olive oil
1 red bell pepper, sliced
1 yellow bell pepper, sliced
8 oz baby bella mushrooms, sliced
3 cups small broccoli florets
1 cup sugar snap peas
1 cup carrots, thinly sliced
3 green onions, thinly sliced
Sesame seeds, for garnish

STIR FRY SAUCE
1/2 cup water
1/3 cup low-sodium soy sauce
1 tbsp honey or brown sugar
1 tbsp rice vinegar
2 tsp toasted sesame oil
2 garlic cloves, grated
2 tsp grated fresh ginger
1 tbsp cornstarch
1/2 tsp red pepper flakes, optional
Salt and pepper, to taste`,
    instructions: `In a medium bowl, whisk together the water, soy sauce, honey or brown sugar, rice vinegar, sesame oil, garlic, ginger, cornstarch, and red pepper flakes if using. Set aside.

Heat the olive oil in a large skillet or wok over high heat. Add the peppers, mushrooms, broccoli, snap peas, carrots, and most of the green onions. Toss and cook, stirring occasionally, for 3 to 4 minutes, or until vegetables soften slightly.

Reduce heat to medium and pour in the sauce. Stir and cook for 1 to 2 minutes, or until the sauce thickens and vegetables are crisp-tender. Season to taste.

Top with remaining green onions and sesame seeds and serve.`,
  },

  {
    id: "normal-vegan-jambalaya",
    slug: "normal-vegan-jambalaya",
    name: "Vegan Jambalaya",
    effort: "normal",
    photoUrl: "/images/normal-vegan-jambalaya.webp",
    tags: ["vegetarian", "dinner", "one-pot", "healthy", "spicy"],
    notes: "A hearty one-pot dinner with bold seasoning and good pantry-friendly ingredients.",
    ingredients: `2 tbsp olive oil
1/2 onion, chopped
2 garlic cloves, minced
1/2 red bell pepper, chopped
1/2 green bell pepper, chopped
1 carrot, peeled and chopped
1 (14 oz) can crushed tomatoes
2 tbsp soy sauce
2 tsp dried oregano
1 tsp dried thyme
1 tsp garlic powder
1 tsp onion powder
1 tsp ground cumin
1 tsp paprika
1/8 tsp ground black pepper
1/8 tsp cayenne pepper
1 cup uncooked white rice
3 cups vegetable stock
1 (15 oz) can chickpeas, drained and rinsed
1 (15 oz) can kidney beans, drained and rinsed
Fresh parsley, chopped, optional`,
    instructions: `Add olive oil to a large skillet or pot over medium-high heat. When hot, add onion, garlic, bell peppers, and carrot. Cook 5 minutes.

Add crushed tomatoes and cook 5 minutes.

Stir in soy sauce and spices. Add rice and vegetable stock and bring to a boil. Reduce heat to medium, cover, and cook 15 minutes or until rice is tender, stirring once or twice to prevent sticking.

Stir in chickpeas and kidney beans and cook 1 to 2 minutes more.

Serve topped with chopped parsley if desired.`,
  },

  {
    id: "quick-black-bean-quesadillas",
    slug: "quick-black-bean-quesadillas",
    name: "Black Bean Quesadillas",
    effort: "quick",
    photoUrl: "/images/quick-black-bean-quesadillas.webp",
    tags: ["vegetarian", "dinner", "quick", "mexican", "kid-friendly", "skillet"],
    notes: "A super easy dinner for busy nights that still feels filling and satisfying.",
    ingredients: `4 small flour tortillas
1 cup shredded cheddar
1 (15 oz) can black beans, drained and rinsed
1/2 cup salsa`,
    instructions: `Place a tortilla in a dry skillet over medium heat.

Sprinkle cheese and black beans over half the tortilla. Fold over and cook 2 minutes per side until the tortilla is golden and cheese is melted.

Serve with salsa on the side.`,
  },

  {
    id: "quick-pesto-naan-pizzas",
    slug: "quick-pesto-naan-pizzas",
    name: "Pesto Naan Pizzas",
    effort: "quick",
    photoUrl: "/images/quick-pesto-naan-pizzas.webp",
    tags: ["vegetarian", "dinner", "quick", "pizza", "kid-friendly"],
    notes: "An easy shortcut pizza night with bright pesto flavor.",
    ingredients: `2 naan breads
1/4 cup basil pesto
1 cup shredded mozzarella
1/2 cup cherry tomatoes, halved`,
    instructions: `Preheat oven to 400°F.

Spread pesto over each naan. Top with mozzarella and cherry tomatoes.

Bake 8 to 10 minutes until cheese is bubbly and edges are crisp.`,
  },

  {
    id: "quick-jamaican-jerk-tofu",
    slug: "quick-jamaican-jerk-tofu",
    name: "Jamaican Jerk Tofu",
    effort: "quick",
    photoUrl: "/images/quick-jamaican-jerk-tofu.webp",
    tags: ["vegetarian", "dinner", "quick", "spicy", "skillet", "healthy"],
    notes: "A fast tofu dinner with bold spice and a little kick.",
    ingredients: `1 block extra-firm tofu
2 tbsp Jamaican jerk seasoning
1 tbsp olive oil
1 cup bell peppers, sliced`,
    instructions: `Press tofu to remove excess water and cut into cubes. Toss tofu and bell peppers with jerk seasoning.

Heat olive oil in a skillet over medium-high heat. Sauté 8 to 10 minutes until tofu is crisped and peppers are tender.`,
  },

  {
    id: "big-vegetarian-shepherds-pie",
    slug: "big-vegetarian-shepherds-pie",
    name: "Vegetarian Shepherd’s Pie",
    effort: "big",
    photoUrl: "/images/big-vegetarian-shepherds-pie.webp",
    tags: ["vegetarian", "dinner", "bake", "comfort", "casserole"],
    notes: "A cozy meatless comfort dinner that still feels hearty and filling.",
    ingredients: `1 1/2 cups cooked lentils
4 large potatoes, peeled and chopped
2 cups mixed vegetables (carrots, peas, corn)
1 cup vegetable broth
1/4 cup milk
2 tbsp butter
1 tbsp olive oil
Salt and pepper, to taste`,
    instructions: `Preheat oven to 400°F.

Boil potatoes in salted water until fork-tender. Drain and mash with butter and milk. Season with salt and pepper.

Heat olive oil in a skillet over medium heat. Sauté mixed vegetables 5 to 7 minutes. Stir in cooked lentils and vegetable broth. Simmer 3 to 5 minutes until slightly thickened. Season to taste.

Transfer lentil mixture to a baking dish and spread mashed potatoes on top.

Bake 20 minutes until the top is lightly golden.`,
  },

  {
    id: "big-spinach-ricotta-stuffed-shells",
    slug: "big-spinach-ricotta-stuffed-shells",
    name: "Spinach and Ricotta Stuffed Shells",
    effort: "big",
    photoUrl: "/images/big-spinach-ricotta-stuffed-shells.webp",
    tags: ["vegetarian", "dinner", "pasta", "bake", "comfort", "italian"],
    notes: "A classic cheesy baked pasta that works well for family dinner or leftovers.",
    ingredients: `1 box jumbo pasta shells
1 (15 oz) ricotta
2 cups fresh spinach, chopped
1 (24 oz) marinara sauce
1 cup shredded mozzarella
Salt and pepper, to taste`,
    instructions: `Preheat oven to 375°F.

Boil pasta shells until al dente. Drain.

Mix ricotta, spinach, half the mozzarella, salt, and pepper in a bowl. Stuff each shell with the cheese mixture.

Spread a thin layer of marinara in a baking dish. Arrange shells and cover with remaining marinara.

Top with remaining mozzarella and bake 25 minutes until bubbly.`,
  },

  {
    id: "normal-chickpea-curry-basmati",
    slug: "normal-chickpea-curry-basmati",
    name: "Chickpea Curry with Basmati Rice",
    effort: "normal",
    photoUrl: "/images/normal-chickpea-curry-basmati.webp",
    tags: ["vegetarian", "dinner", "one-pot", "healthy", "spicy"],
    notes: "A flavorful pantry-friendly dinner with a creamy curry sauce.",
    ingredients: `2 (15 oz) cans chickpeas, drained and rinsed
1 (13.5 oz) can coconut milk
1 cup crushed tomatoes
2 tbsp curry powder
2 cups cooked basmati rice
1 small onion, diced
2 garlic cloves, minced
1 tbsp olive oil
Salt and pepper, to taste`,
    instructions: `Heat olive oil in a pot over medium heat. Sauté onion 3 to 4 minutes until softened. Add garlic and cook 30 seconds.

Stir in curry powder and toast 1 minute.

Add chickpeas, coconut milk, and crushed tomatoes. Simmer 15 to 20 minutes until sauce thickens. Season to taste.

Serve over hot basmati rice.`,
  },

  {
    id: "normal-spicy-tofu-mushroom-hash",
    slug: "normal-spicy-tofu-mushroom-hash",
    name: "Vegetarian Spicy Skillet Surf and Turf Hash",
    effort: "normal",
    photoUrl: "/images/normal-spicy-tofu-mushroom-hash.webp",
    tags: ["vegetarian", "dinner", "skillet", "spicy", "healthy"],
    notes: "A hearty skillet dinner with crispy potatoes and lots of texture.",
    ingredients: `1 block firm tofu, cubed
2 cups king oyster mushrooms, sliced
2 cups potatoes, diced
1 cup bell peppers, diced
2 tbsp Cajun spice blend
2 tbsp olive oil
Salt and pepper, to taste
Fresh parsley, optional`,
    instructions: `Heat 1 tbsp olive oil in a large skillet over medium-high heat. Add diced potatoes and cook, stirring occasionally, until crisping and tender, 10 to 12 minutes. Season lightly.

Push potatoes to the side and add remaining 1 tbsp olive oil. Add tofu and mushrooms and cook until browned, 6 to 8 minutes.

Stir in bell peppers and Cajun seasoning. Cook 5 to 7 minutes until peppers are tender. Season to taste.

Garnish with fresh parsley if desired and serve.`,
  },

  {
    id: "quick-caprese-pasta",
    slug: "quick-caprese-pasta",
    name: "Caprese Pasta",
    effort: "quick",
    photoUrl: "/images/quick-caprese-pasta.webp",
    tags: ["vegetarian", "dinner", "pasta", "quick", "italian", "healthy"],
    notes: "Fresh, simple, and perfect for a lighter pasta night.",
    ingredients: `1/2 lb penne pasta
1 cup cherry tomatoes, halved
1/2 cup mozzarella pearls
1/4 cup fresh basil
2 tbsp olive oil
Salt and pepper, to taste`,
    instructions: `Cook pasta according to package directions. While pasta boils, halve the cherry tomatoes.

Drain pasta and return to the pot. Toss with olive oil, tomatoes, mozzarella, and torn basil.

Season with salt and pepper and serve immediately.`,
  },

  {
    id: "big-mediterranean-stuffed-peppers",
    slug: "big-mediterranean-stuffed-peppers",
    name: "Mediterranean Stuffed Bell Peppers",
    effort: "big",
    photoUrl: "/images/big-mediterranean-stuffed-peppers.webp",
    tags: ["vegetarian", "dinner", "bake", "healthy", "mediterranean"],
    notes: "A colorful meatless dinner with a fresh Mediterranean feel.",
    ingredients: `4 large bell peppers
2 cups cooked quinoa
1/2 cup feta, crumbled
1/4 cup Kalamata olives, chopped
1 tsp dried oregano
Salt and pepper, to taste`,
    instructions: `Preheat oven to 375°F.

Cut the tops off peppers and remove seeds.

In a bowl, mix quinoa, feta, olives, oregano, salt, and pepper. Stuff mixture into peppers.

Place peppers in a baking dish with a splash of water in the bottom. Cover with foil and bake 30 minutes until peppers are tender.`,
  },

  {
    id: "quick-vegetable-pad-thai",
    slug: "quick-vegetable-pad-thai",
    name: "Vegetable Pad Thai",
    effort: "quick",
    photoUrl: "/images/quick-vegetable-pad-thai.webp",
    tags: ["vegetarian", "dinner", "quick", "asian", "skillet"],
    notes: "A quick noodle dinner with great takeout-style energy.",
    ingredients: `8 oz rice noodles
8 oz tofu, cubed
1 cup bean sprouts
1/3 cup pad Thai sauce
2 tsp crushed peanuts
1 tbsp olive oil
Lime wedges, optional`,
    instructions: `Soak rice noodles in warm water according to package directions. Drain well.

Heat olive oil in a wok or large skillet over medium-high heat. Sauté tofu until golden.

Add drained noodles and pad Thai sauce. Toss to coat and heat through.

Stir in bean sprouts and cook 2 minutes.

Serve topped with crushed peanuts and a lime wedge if desired.`,
  },

  {
    id: "big-roasted-vegetable-wellington",
    slug: "big-roasted-vegetable-wellington",
    name: "Roasted Vegetable Wellington",
    effort: "big",
    photoUrl: "/images/big-roasted-vegetable-wellington.webp",
    tags: ["vegetarian", "dinner", "bake", "comfort", "holiday"],
    notes: "A more elevated vegetarian dinner that feels great for holidays or special meals.",
    ingredients: `1 sheet puff pastry
1 large sweet potato, roasted
4 cups spinach, wilted
2 large portobello mushrooms
4 oz goat cheese
1 egg, for egg wash
1 tbsp olive oil
Salt and pepper, to taste`,
    instructions: `Preheat oven to 400°F.

Heat olive oil in a skillet over medium heat and cook portobello mushrooms until tender. Season with salt and pepper.

Layer roasted sweet potato, wilted spinach, and mushrooms in the center of the puff pastry. Crumble goat cheese over the top.

Fold pastry over filling and seal edges with a little water. Brush with egg wash and score the top lightly with a knife.

Bake 25 to 30 minutes until golden and puffed.`,
  },

  {
    id: "big-black-bean-burgers-sweet-potato-fries",
    slug: "big-black-bean-burgers-sweet-potato-fries",
    name: "Black Bean Burgers with Sweet Potato Fries",
    effort: "big",
    photoUrl: "/images/big-black-bean-burgers-sweet-potato-fries.webp",
    tags: ["vegetarian", "dinner", "comfort", "kid-friendly", "american"],
    notes: "A fun homemade burger night that keeps things meatless but still hearty.",
    ingredients: `2 (15 oz) cans black beans, drained and rinsed
2 large sweet potatoes, cut into wedges
1/2 cup breadcrumbs
1/2 red onion, finely diced
3 garlic cloves, minced
1 tbsp ground cumin
3 tbsp olive oil
4 burger buns
Salt and pepper, to taste`,
    instructions: `Preheat oven to 400°F.

Toss sweet potato wedges with 1 1/2 tbsp olive oil, salt, and pepper. Spread on a baking sheet and roast 25 to 30 minutes, flipping halfway.

In a bowl, mash black beans until mostly pasty. Stir in onion, garlic, breadcrumbs, cumin, salt, and pepper. Form into 4 patties.

Heat remaining 1 1/2 tbsp olive oil in a skillet over medium heat. Cook patties 5 minutes per side until browned.

Serve on buns with favorite toppings alongside sweet potato fries.`,
  },

  {
    id: "big-sweet-potato-black-bean-enchiladas",
    slug: "big-sweet-potato-black-bean-enchiladas",
    name: "Sweet Potato and Black Bean Enchiladas",
    effort: "big",
    photoUrl: "/images/big-sweet-potato-black-bean-enchiladas.webp",
    tags: ["vegetarian", "dinner", "bake", "mexican", "comfort"],
    notes: "A satisfying baked vegetarian dinner with sweet and savory flavor.",
    ingredients: `2 large sweet potatoes, peeled and cubed
1 (15 oz) can black beans, drained and rinsed
8 corn tortillas
2 cups enchilada sauce
1 1/2 cups Monterey Jack, shredded
1/4 cup cilantro, chopped
Salt and pepper, to taste`,
    instructions: `Boil sweet potatoes until soft, then drain and mash. Season with salt and pepper. Mix in black beans and half the cilantro.

Preheat oven to 375°F.

Spread a thin layer of enchilada sauce in a baking dish. Dip each tortilla in enchilada sauce, fill with sweet potato mixture, and roll tightly. Place seam-side down in the dish.

Cover with remaining sauce and top with cheese.

Bake 20 minutes until cheese is bubbly. Garnish with remaining cilantro.`,
  },

  {
    id: "vegetarian-fri-chik-noodle-casserole",
    slug: "vegetarian-fri-chik-noodle-casserole",
    name: "Vegetarian Fri-Chik Noodle Casserole",
    effort: "normal",
    photoUrl: "/images/vegetarian-fri-chik-noodle-casserole.webp",
    tags: ["vegetarian", "dinner", "casserole", "pasta", "comfort", "baked"],
    notes: "A hearty, comforting casserole that even non-vegetarians will love. Perfect for make-ahead dinners since it tastes even better the next day.",
    ingredients: `12 oz egg noodles
1 medium yellow onion, chopped
1 medium white onion, chopped
1 can Loma Linda Fri-Chik & Gravy
2 eggs, beaten
2 1/2 tbsp McKay's Chicken Seasoning
1 (10.5 oz) can cream of mushroom soup
1 cup milk
1 (8 oz) block sharp cheddar cheese, shredded
1 (8 oz) baby bella mushrooms, sliced
2 tbsp butter
1 tbsp olive oil
1 tbsp minced garlic
1 (4–7 oz) can green chilies (optional)
Salt and pepper to taste`,
    instructions: `Preheat oven to 350°F.

Cook egg noodles according to package directions, omitting salt. Drain and set aside.

In a skillet, heat butter and olive oil over medium heat. Cook onions until translucent.

Add mushrooms and cook until they begin to brown. Stir in minced garlic and cook for 2 more minutes.

Chop the Fri-Chik into small pieces.

In a large bowl, combine noodles, eggs, milk, cooked onions and mushrooms, cream of mushroom soup, shredded cheese, reserving some for topping, Fri-Chik, seasoning, salt, pepper, and green chilies if using. Mix well.

Transfer to a baking dish and cover with foil. Bake for 1 hour.

Remove foil, top with remaining cheese, and bake uncovered for 5 to 10 minutes until cheese is melted.`,
  },

   {
    id: "quick-cream-cheese-spinach-pasta",
    slug: "quick-cream-cheese-spinach-pasta",
    name: "Cream Cheese Spinach Pasta",
    photoUrl: "/images/quick-cream-cheese-spinach-pasta.webp",
    notes: "A creamy meatless pasta made with pantry basics and fresh spinach for an easy comfort meal.",
    effort: "quick",
    tags: ["dinner", "vegetarian", "pasta", "quick", "meatless", "creamy"],
    ingredients: `12 oz pasta
4 oz cream cheese
1/2 cup grated Parmesan
2 cups fresh spinach
2 cloves garlic, minced
1 tbsp butter
1/2 cup reserved pasta water
Salt and black pepper to taste`,
    instructions: `Cook pasta and reserve 1/2 cup pasta water.

In the same pot or a skillet, melt butter and cook garlic for 30 seconds.

Add cream cheese, Parmesan, and reserved pasta water. Stir until smooth.

Add spinach and cooked pasta. Toss until spinach wilts and pasta is coated.

Season to taste and serve.`,
  },

  

 

];

// Optional non-dinner vegetarian meals
export const VEGETARIAN_EXTRAS: Meal[] = [
{
    id: "quick-avocado-white-bean-wraps",
    slug: "quick-avocado-white-bean-wraps",
    name: "Avocado and White Bean Wraps",
    effort: "quick",
    photoUrl: "/images/quick-avocado-white-bean-wraps.webp",
    tags: ["vegetarian", "lunch", "quick", "no-cook", "healthy"],
    notes: "A fast no-cook option for lunch or a lighter meal.",
    ingredients: `1 cup cannellini beans, drained and rinsed
1 ripe avocado
1 tbsp lime juice
2 tbsp fresh cilantro, chopped
Salt and pepper, to taste
2 large whole wheat tortillas
1/4 cup shredded carrots
1/2 cup fresh spinach leaves`,
    instructions: `In a medium bowl, mash the avocado with lime juice, salt, and pepper. Fold in the beans and cilantro until well combined.

Lay out tortillas and spread the mixture down the center of each. Top with shredded carrots and spinach.

Roll tightly, tuck in ends, and slice in half to serve.`,
  },

  {
    id: "quick-caprese-grilled-cheese-sandwich",
    slug: "quick-caprese-grilled-cheese-sandwich",
    name: "Caprese Grilled Cheese",
    effort: "quick",
    photoUrl: "/images/quick-caprese-grilled-cheese-sandwich.webp",
    tags: ["vegetarian", "lunch", "quick", "skillet", "comfort"],
    notes: "A fresh spin on grilled cheese with tomato and basil.",
    ingredients: `4 slices sourdough bread
4 oz fresh mozzarella, sliced
1 tomato, thinly sliced
1/4 cup fresh basil leaves
1 tbsp butter`,
    instructions: `Layer mozzarella, tomato, and basil between bread slices.

Butter the outside of the sandwiches.

Grill in a skillet over medium heat for 3 to 4 minutes per side until bread is golden and cheese is melted.`,
  },

  {
    id: "normal-spicy-mushroom-potato-hash",
    slug: "normal-spicy-mushroom-potato-hash",
    name: "Spicy Skillet Mushroom and Potato Hash",
    effort: "normal",
    photoUrl: "/images/normal-spicy-mushroom-potato-hash.webp",
    tags: ["vegetarian", "breakfast", "skillet", "spicy", "comfort"],
    notes: "A savory skillet dish that works well for breakfast-for-dinner too.",
    ingredients: `2 large russet potatoes, diced
8 oz baby bella mushrooms, sliced
1 jalapeño, minced
1/2 red onion, diced
1 tsp smoked paprika
2 eggs
2 tbsp olive oil
Salt and pepper, to taste`,
    instructions: `Parboil diced potatoes in salted water for 5 minutes, then drain.

Heat olive oil in a heavy skillet over medium-high heat. Add potatoes and fry until starting to crisp, 8 to 10 minutes.

Add mushrooms, onion, and jalapeño. Season with smoked paprika, salt, and pepper. Cook until mushrooms are tender and potatoes are golden, 6 to 8 minutes.

Create two wells in the hash, crack an egg into each, and cover until eggs are cooked to your preference.`,
  },
];

export const NEW_SALAD_RECIPES: Meal[] = [
  // =====================================================
  // QUICK
  // =====================================================
  {
    id: "quick-classic-garden-salad",
    slug: "quick-classic-garden-salad",
    name: "Classic Garden Salad",
    photoUrl: "/images/quick-classic-garden-salad.webp",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "side", "fresh", "healthy"],
    ingredients: `1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cucumber, sliced
1/2 red onion, thinly sliced
1/2 cup shredded carrots
1/2 cup croutons
1/4 cup ranch or Italian dressing`,
    instructions: `Wash and chop the lettuce.
Add lettuce, tomatoes, cucumber, onion, and carrots to a large bowl.
Top with croutons.
Drizzle with dressing just before serving and toss well.`,
    notes: "A crisp everyday salad that works as a side or a light lunch.",
  },

  {
    id: "quick-greek-salad",
    slug: "quick-greek-salad",
    name: "Greek Salad",
    photoUrl: "/images/quick-greek-salad.webp",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "mediterranean", "fresh", "healthy"],
    ingredients: `1 cucumber, chopped
1 pint cherry tomatoes, halved
1/2 red onion, sliced
1 green bell pepper, chopped
1/2 cup kalamata olives
1/2 cup feta cheese, crumbled
2 tbsp olive oil
1 tbsp red wine vinegar
1 tsp dried oregano
Salt and black pepper to taste`,
    instructions: `Add cucumber, tomatoes, onion, bell pepper, olives, and feta to a large bowl.
Whisk together olive oil, red wine vinegar, oregano, salt, and pepper.
Pour dressing over salad and toss gently.
Serve immediately or chill until ready to serve.`,
    notes: "Bright, salty, and refreshing with a classic Mediterranean flavor.",
  },

  {
    id: "quick-caprese-salad",
    slug: "quick-caprese-salad",
    name: "Caprese Salad",
    photoUrl: "/images/quick-caprese-salad.webp",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "italian", "fresh", "no-cook"],
    ingredients: `3 large tomatoes, sliced
8 oz fresh mozzarella, sliced
1/4 cup fresh basil leaves
2 tbsp olive oil
1 tbsp balsamic glaze
Salt and black pepper to taste`,
    instructions: `Arrange tomato slices and mozzarella slices on a platter.
Tuck fresh basil leaves between the layers.
Drizzle with olive oil and balsamic glaze.
Season lightly with salt and pepper before serving.`,
    notes: "Simple, fresh, and perfect for warm-weather meals.",
  },

  {
    id: "quick-southwest-chicken-salad",
    slug: "quick-southwest-chicken-salad",
    name: "Southwest Chicken Salad",
    photoUrl: "/images/quick-southwest-chicken-salad.webp",
    effort: "quick",
    tags: ["salad", "quick", "chicken", "dinner", "protein", "tex-mex"],
    ingredients: `2 cups cooked chicken, chopped
1 head romaine lettuce, chopped
1 cup corn
1 cup black beans, drained and rinsed
1 cup cherry tomatoes, halved
1/2 cup shredded cheddar cheese
1 avocado, diced
1/4 cup tortilla strips
1/3 cup southwest ranch dressing`,
    instructions: `Add lettuce, chicken, corn, black beans, tomatoes, cheese, and avocado to a large bowl.
Top with tortilla strips.
Drizzle with southwest ranch dressing and toss just before serving.`,
    notes: "A hearty salad that feels like a full dinner, not just a side.",
  },

  {
    id: "quick-cucumber-tomato-salad",
    slug: "quick-cucumber-tomato-salad",
    name: "Cucumber Tomato Salad",
    photoUrl: "/images/quick-cucumber-tomato-salad.webp",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "side", "fresh", "summer"],
    ingredients: `2 cucumbers, sliced
3 tomatoes, chopped
1/4 red onion, thinly sliced
2 tbsp olive oil
1 tbsp red wine vinegar
1 tsp sugar
Salt and black pepper to taste`,
    instructions: `Add cucumbers, tomatoes, and red onion to a bowl.
Whisk together olive oil, vinegar, sugar, salt, and pepper.
Pour over vegetables and toss well.
Chill for 15 minutes before serving if desired.`,
    notes: "Cool, crisp, and great with grilled dinners.",
  },

  // =====================================================
  // NORMAL
  // =====================================================
  {
    id: "normal-grilled-chicken-caesar-salad",
    slug: "normal-grilled-chicken-caesar-salad",
    name: "Grilled Chicken Caesar Salad",
    photoUrl: "/images/normal-grilled-chicken-caesar-salad.webp",
    effort: "normal",
    tags: ["salad", "normal", "chicken", "dinner", "protein", "classic"],
    ingredients: `2 chicken breasts
1 tbsp olive oil
1 tsp garlic powder
1/2 tsp salt
1/4 tsp black pepper
1 head romaine lettuce, chopped
1/2 cup Caesar dressing
1/3 cup parmesan cheese
1 cup croutons`,
    instructions: `Season chicken with olive oil, garlic powder, salt, and pepper.
Cook chicken in a skillet or grill pan until fully cooked, then slice.
Add romaine, Caesar dressing, parmesan, and croutons to a bowl and toss.
Top with sliced chicken and serve.`,
    notes: "A restaurant-style classic that works perfectly as a dinner salad.",
  },

  {
    id: "normal-cobb-salad",
    slug: "normal-cobb-salad",
    name: "Cobb Salad",
    photoUrl: "/images/normal-cobb-salad.webp",
    effort: "normal",
    tags: ["salad", "normal", "chicken", "bacon", "dinner", "protein"],
    ingredients: `1 head romaine lettuce, chopped
2 cups cooked chicken, chopped
4 strips bacon, cooked and crumbled
2 hard-boiled eggs, chopped
1 avocado, diced
1 cup cherry tomatoes, halved
1/2 cup blue cheese crumbles
1/3 cup ranch dressing`,
    instructions: `Arrange lettuce in a large serving bowl or platter.
Top in rows with chicken, bacon, eggs, avocado, tomatoes, and blue cheese.
Drizzle with dressing or serve dressing on the side.`,
    notes: "Loaded with protein and toppings, this one eats like a full meal.",
  },

  {
    id: "normal-steakhouse-salad",
    slug: "normal-steakhouse-salad",
    name: "Steakhouse Salad",
    photoUrl: "/images/normal-steakhouse-salad.webp",
    effort: "normal",
    tags: ["salad", "normal", "beef", "dinner", "protein", "hearty"],
    ingredients: `1 lb sirloin steak
1 tbsp olive oil
1 tsp salt
1/2 tsp black pepper
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1/2 red onion, sliced
1/2 cup crumbled blue cheese
1/4 cup crispy fried onions
1/3 cup balsamic vinaigrette`,
    instructions: `Season steak with olive oil, salt, and pepper.
Cook steak in a skillet to desired doneness, then rest and slice thinly.
Add lettuce, tomatoes, onion, blue cheese, and fried onions to a bowl.
Top with steak and drizzle with balsamic vinaigrette.`,
    notes: "Bold steakhouse flavor in a lighter, salad-style dinner.",
  },

  {
    id: "normal-broccoli-bacon-salad",
    slug: "normal-broccoli-bacon-salad",
    name: "Broccoli Bacon Salad",
    photoUrl: "/images/normal-broccoli-bacon-salad.webp",
    effort: "normal",
    tags: ["salad", "normal", "side", "broccoli", "bacon", "potluck"],
    ingredients: `4 cups broccoli florets
6 strips bacon, cooked and crumbled
1/2 red onion, diced
1/2 cup shredded cheddar cheese
1/4 cup sunflower seeds
1/3 cup mayonnaise
1 tbsp apple cider vinegar
1 tbsp sugar`,
    instructions: `Add broccoli, bacon, red onion, cheddar, and sunflower seeds to a large bowl.
Whisk together mayonnaise, apple cider vinegar, and sugar.
Pour dressing over salad and mix well.
Chill before serving for best flavor.`,
    notes: "Crunchy, creamy, and one of those salads people always go back for.",
  },

  {
    id: "normal-avocado-ranch-chicken-salad",
    slug: "normal-avocado-ranch-chicken-salad",
    name: "Avocado Ranch Chicken Salad",
    photoUrl: "/images/normal-avocado-ranch-chicken-salad.webp",
    effort: "normal",
    tags: ["salad", "normal", "chicken", "avocado", "dinner", "protein"],
    ingredients: `2 cups cooked chicken, chopped
1 head romaine lettuce, chopped
1 avocado, diced
1 cup cherry tomatoes, halved
1/2 cucumber, sliced
1/4 red onion, sliced
1/2 cup shredded cheddar cheese
1/3 cup ranch dressing`,
    instructions: `Add lettuce, chicken, avocado, tomatoes, cucumber, onion, and cheese to a large bowl.
Drizzle with ranch dressing.
Toss gently and serve right away.`,
    notes: "Creamy, filling, and easy enough for a weeknight dinner.",
  },

  // =====================================================
  // BIG
  // =====================================================
  {
    id: "big-buffalo-chicken-salad",
    slug: "big-buffalo-chicken-salad",
    name: "Buffalo Chicken Salad",
    photoUrl: "/images/big-buffalo-chicken-salad.webp",
    effort: "big",
    tags: ["salad", "big", "chicken", "buffalo", "dinner", "spicy"],
    ingredients: `2 chicken breasts, breaded or grilled
1/3 cup buffalo sauce
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1/2 cucumber, sliced
1/4 red onion, sliced
1/2 cup shredded cheddar cheese
1/4 cup blue cheese crumbles
1/3 cup ranch or blue cheese dressing`,
    instructions: `Cook chicken until fully done, then slice.
Toss cooked chicken with buffalo sauce.
Add lettuce, tomatoes, cucumber, onion, cheddar, and blue cheese to a large bowl.
Top with buffalo chicken and drizzle with dressing.`,
    notes: "Big flavor and just enough heat to make salad night exciting.",
  },

  {
    id: "big-asian-chicken-salad",
    slug: "big-asian-chicken-salad",
    name: "Asian Chicken Salad",
    photoUrl: "/images/big-asian-chicken-salad.webp",
    effort: "big",
    tags: ["salad", "big", "chicken", "dinner", "crunchy", "asian-inspired"],
    ingredients: `2 cups cooked chicken, shredded
1 bag coleslaw mix
1 cup romaine lettuce, chopped
1/2 cup shredded carrots
1/2 cup sliced almonds
1/4 cup crispy chow mein noodles
2 green onions, sliced
1/4 cup sesame ginger dressing`,
    instructions: `Add coleslaw mix, romaine, carrots, almonds, chow mein noodles, and green onions to a large bowl.
Top with shredded chicken.
Drizzle with sesame ginger dressing and toss just before serving.`,
    notes: "Crunchy, colorful, and a great break from the usual salad routine.",
  },

  {
    id: "big-strawberry-spinach-salad",
    slug: "big-strawberry-spinach-salad",
    name: "Strawberry Spinach Salad",
    photoUrl: "/images/big-strawberry-spinach-salad.webp",
    effort: "big",
    tags: ["salad", "big", "vegetarian", "spinach", "fruit", "fresh"],
    ingredients: `1 bag baby spinach
1 cup strawberries, sliced
1/2 cup blueberries
1/4 red onion, thinly sliced
1/2 cup feta cheese
1/4 cup candied pecans
1/3 cup poppy seed dressing`,
    instructions: `Add spinach, strawberries, blueberries, red onion, feta, and candied pecans to a large bowl.
Drizzle with poppy seed dressing.
Toss gently and serve immediately.`,
    notes: "Sweet, tangy, and pretty enough to steal the show on the table.",
  },

  {
    id: "big-taco-salad",
    slug: "big-taco-salad",
    name: "Taco Salad",
    photoUrl: "/images/big-taco-salad.webp",
    effort: "big",
    tags: ["salad", "big", "beef", "tex-mex", "dinner", "family-friendly"],
    ingredients: `1 lb ground beef
1 packet taco seasoning
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cup corn
1 cup black beans, drained and rinsed
1 cup shredded cheddar cheese
1/2 cup salsa
1/2 cup sour cream
1 cup tortilla chips, crushed`,
    instructions: `Cook ground beef in a skillet and stir in taco seasoning.
Add lettuce, tomatoes, corn, black beans, and cheese to a large bowl.
Top with warm taco meat.
Add salsa, sour cream, and crushed tortilla chips before serving.`,
    notes: "A fun dinner salad that still feels hearty and family-friendly.",
  },

  {
    id: "big-mediterranean-chickpea-salad",
    slug: "big-mediterranean-chickpea-salad",
    name: "Mediterranean Chickpea Salad",
    photoUrl: "/images/big-mediterranean-chickpea-salad.webp",
    effort: "big",
    tags: ["salad", "big", "vegetarian", "chickpeas", "healthy", "meal-prep"],
    ingredients: `2 cans chickpeas, drained and rinsed
1 cucumber, chopped
1 pint cherry tomatoes, halved
1/2 red onion, diced
1/2 cup feta cheese
1/4 cup parsley, chopped
2 tbsp olive oil
1 tbsp lemon juice
1 tsp dried oregano
Salt and black pepper to taste`,
    instructions: `Add chickpeas, cucumber, tomatoes, red onion, feta, and parsley to a large bowl.
Whisk together olive oil, lemon juice, oregano, salt, and pepper.
Pour dressing over salad and toss well.
Chill or serve immediately.`,
    notes: "Protein-packed, fresh, and great for lunches the next day too.",
  },
];

export const FROZEN_MEALS: Meal[] = [
  {
    id: "frozen-lasagna",
    slug: "frozen-lasagna",
    name: "Frozen Lasagna",
    effort: "frozen",
    photoUrl: "/images/frozen-lasagna.webp",
    tags: ["dinner", "frozen", "italian", "comfort", "backup"],
    notes: "A dependable freezer meal for busy nights when you still want something hearty.",
    ingredients: `1 frozen lasagna`,
    instructions: `Preheat oven according to package directions.

Remove packaging and cover if needed.

Bake until heated through and bubbly.

Let rest 5 to 10 minutes before serving.`,
  },

  {
    id: "frozen-chicken-pot-pie",
    slug: "frozen-chicken-pot-pie",
    name: "Frozen Chicken Pot Pie",
    effort: "frozen",
    photoUrl: "/images/frozen-chicken-pot-pie.webp",
    tags: ["dinner", "frozen", "chicken", "comfort", "backup"],
    notes: "A classic freezer comfort option that feels a little more like a full dinner.",
    ingredients: `1 frozen chicken pot pie`,
    instructions: `Preheat oven according to package directions.

Place pot pie on a baking sheet if recommended.

Bake until the crust is golden brown and the filling is hot.

Let cool slightly before serving.`,
  },

  {
    id: "frozen-cheese-pizza",
    slug: "frozen-cheese-pizza",
    name: "Frozen Cheese Pizza",
    effort: "frozen",
    photoUrl: "/images/frozen-cheese-pizza.webp",
    tags: ["dinner", "frozen", "pizza", "kid-friendly", "backup"],
    notes: "An easy freezer staple that works great for chaotic weeknights.",
    ingredients: `1 frozen cheese pizza`,
    instructions: `Preheat oven according to package directions.

Remove pizza from all packaging.

Bake directly on the oven rack or a baking sheet as directed.

Slice and serve hot.`,
  },

  {
    id: "frozen-pepperoni-pizza",
    slug: "frozen-pepperoni-pizza",
    name: "Frozen Pepperoni Pizza",
    effort: "frozen",
    photoUrl: "/images/frozen-pepperoni-pizza.webp",
    tags: ["dinner", "frozen", "pizza", "pepperoni", "kid-friendly", "backup"],
    notes: "A freezer favorite for nights when you need dinner on the table fast.",
    ingredients: `1 frozen pepperoni pizza`,
    instructions: `Preheat oven according to package directions.

Remove pizza from packaging.

Bake until crust is crisp and cheese is melted.

Slice and serve hot.`,
  },

  {
    id: "frozen-mac-and-cheese",
    slug: "frozen-mac-and-cheese",
    name: "Frozen Mac and Cheese",
    effort: "frozen",
    photoUrl: "/images/frozen-mac-and-cheese.webp",
    tags: ["dinner", "frozen", "pasta", "comfort", "kid-friendly", "backup", "vegetarian"],
    notes: "A super easy freezer option that works well on its own or with a side.",
    ingredients: `1 frozen mac and cheese entrée`,
    instructions: `Cook according to package directions.

Stir halfway through if needed.

Let stand a minute or two before serving.`,
  },

  {
    id: "frozen-chicken-alfredo",
    slug: "frozen-chicken-alfredo",
    name: "Frozen Chicken Alfredo",
    effort: "frozen",
    photoUrl: "/images/frozen-chicken-alfredo.webp",
    tags: ["dinner", "frozen", "chicken", "pasta", "comfort", "backup"],
    notes: "A realistic freezer dinner for nights when you want something creamy and filling.",
    ingredients: `1 frozen chicken Alfredo entrée`,
    instructions: `Cook according to package directions.

Stir carefully halfway through if microwaving.

Heat until hot throughout and serve.`,
  },

  {
    id: "frozen-meatloaf-and-mashed-potatoes",
    slug: "frozen-meatloaf-and-mashed-potatoes",
    name: "Frozen Meatloaf and Mashed Potatoes",
    effort: "frozen",
    photoUrl: "/images/frozen-meatloaf-and-mashed-potatoes.webp",
    tags: ["dinner", "frozen", "beef", "comfort", "backup"],
    notes: "A hearty heat-and-eat dinner that feels more like a traditional plate meal.",
    ingredients: `1 frozen meatloaf and mashed potatoes entrée`,
    instructions: `Cook according to package directions.

Carefully stir potatoes or gravy if needed.

Let stand briefly before serving.`,
  },

  {
    id: "frozen-orange-chicken",
    slug: "frozen-orange-chicken",
    name: "Frozen Orange Chicken",
    effort: "frozen",
    photoUrl: "/images/frozen-orange-chicken.webp",
    tags: ["dinner", "frozen", "chicken", "asian", "backup"],
    notes: "A quick freezer dinner that pairs easily with rice or steamed vegetables.",
    ingredients: `1 frozen orange chicken entrée`,
    instructions: `Cook chicken according to package directions.

Heat sauce as directed.

Toss chicken with sauce and serve hot.`,
  },

  {
    id: "frozen-broccoli-cheddar-stuffed-chicken",
    slug: "frozen-broccoli-cheddar-stuffed-chicken",
    name: "Frozen Broccoli Cheddar Stuffed Chicken",
    effort: "frozen",
    photoUrl: "/images/frozen-broccoli-cheddar-stuffed-chicken.webp",
    tags: ["dinner", "frozen", "chicken", "comfort", "backup"],
    notes: "A nice freezer option when you want something easy that still feels like a full entrée.",
    ingredients: `2 frozen broccoli cheddar stuffed chicken breasts`,
    instructions: `Preheat oven according to package directions.

Place stuffed chicken on a baking sheet.

Bake until heated through and the center reaches a safe temperature.

Let rest briefly before serving.`,
  },

  {
    id: "frozen-cheese-ravioli",
    slug: "frozen-cheese-ravioli",
    name: "Frozen Cheese Ravioli",
    effort: "frozen",
    photoUrl: "/images/frozen-cheese-ravioli.webp",
    tags: ["dinner", "frozen", "pasta", "vegetarian", "italian", "backup"],
    notes: "An easy freezer meal that can feel a little more homemade with jarred sauce on top.",
    ingredients: `1 bag frozen cheese ravioli
1 jar pasta sauce (optional)`,
    instructions: `Cook ravioli according to package directions.

Warm sauce separately if using.

Drain ravioli, top with sauce, and serve.`,
  },

  {
    id: "frozen-chicken-nuggets-and-fries",
    slug: "frozen-chicken-nuggets-and-fries",
    name: "Frozen Chicken Nuggets and Fries",
    effort: "frozen",
    photoUrl: "/images/frozen-chicken-nuggets-and-fries.webp",
    tags: ["dinner", "frozen", "chicken", "kid-friendly", "backup"],
    notes: "A realistic family fallback meal for nights when simple is the win.",
    ingredients: `1 bag frozen chicken nuggets
1 bag frozen fries`,
    instructions: `Preheat oven or air fryer according to package directions.

Cook nuggets and fries until hot and crispy.

Serve with favorite dipping sauces.`,
  },

  {
    id: "frozen-veggie-burger-and-fries",
    slug: "frozen-veggie-burger-and-fries",
    name: "Frozen Veggie Burger and Fries",
    effort: "frozen",
    photoUrl: "/images/frozen-veggie-burger-and-fries.webp",
    tags: ["dinner", "frozen", "vegetarian", "kid-friendly", "backup"],
    notes: "A simple vegetarian freezer dinner that is easy to keep on hand.",
    ingredients: `2 frozen veggie burgers
2 burger buns
1 bag frozen fries
Burger toppings of choice`,
    instructions: `Cook veggie burgers according to package directions.

Cook fries according to package directions.

Assemble burgers with buns and toppings, then serve with fries.`,
  },
];

// =====================================================
// SUBSTITUTIONS / POOLS
// =====================================================

export const SUBS = [
  { pattern: /\bground beef\b/gi, replacement: "black beans" },
  { pattern: /\bbeef\b/gi, replacement: "black beans" },
  { pattern: /\bchicken\b/gi, replacement: "tofu" },
  { pattern: /\bpork\b/gi, replacement: "jackfruit" },
  { pattern: /\bbacon\b/gi, replacement: "tempeh bacon" },
  { pattern: /\bsausage\b/gi, replacement: "plant sausage" },
  { pattern: /\bpepperoni\b/gi, replacement: "plant pepperoni" },
  { pattern: /\bmeatballs?\b/gi, replacement: "lentil meatballs" },
  { pattern: /\bham\b/gi, replacement: "smoked tofu" },
  { pattern: /\bturkey\b/gi, replacement: "tofu" },
  { pattern: /\bsalmon\b/gi, replacement: "chickpeas" },
  { pattern: /\bfish\b/gi, replacement: "chickpeas" },
  { pattern: /\bshrimp\b/gi, replacement: "hearts of palm" },
  { pattern: /\bcrab\b/gi, replacement: "hearts of palm" },
  { pattern: /\bscallops?\b/gi, replacement: "king oyster mushrooms" },
];

export const VEGGIE_POOL = NEW_VEGETARIAN_RECIPES.map((meal) => ({
  ...meal,
  isVegetarian: true,
}));

export const ALL_RECIPES: Meal[] = [
  ...NEW_BUILTIN_RECIPES,
  ...NEW_VEGETARIAN_RECIPES,
  ...FROZEN_MEALS,
  ...SIDE_DISHES,
  ...DESSERTS,
  ...EXTRA_RECIPES,
  ...VEGETARIAN_EXTRAS,
  ...NEW_SALAD_RECIPES,
];