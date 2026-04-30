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
  { key: "eggs", label: "eggs", keywords: ["egg", "eggs", "mayonnaise", "mayo"] },
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
    photoUrl: "/images/quick-beef-chili.jpg",
    tags: ["dinner", "beef", "one-pot", "stovetop", "spicy", "comfort", "quick", "leftovers-friendly"],
    notes: "A hearty, no-fuss chili that is easy to throw together and even better the next day.",
    ingredients: `1 lb ground beef
2 (14.5 oz) cans fire-roasted diced tomatoes
1 (28 oz) can diced tomatoes
1 (15.5 oz) can chili beans (do not drain)
1 (15 oz) can corn, drained
1 (15 oz) can black beans, drained and rinsed
1 packet chili seasoning
shredded cheese
sour cream
fresh or pickled jalapeños`,
    instructions: `Brown the ground beef in a large pot over medium heat until fully cooked.
Drain excess grease.
Add fire-roasted tomatoes, diced tomatoes, chili beans, corn, black beans, and chili seasoning. Stir well.
Bring to a gentle simmer.
Reduce heat and simmer uncovered for 30 minutes, stirring occasionally.
Serve hot and top with shredded cheese, sour cream, and jalapeños.`,
  },

  {
    id: "normal-chicken-greenbean-mushroom-bake",
    slug: "normal-chicken-greenbean-mushroom-bake",
    name: "Chicken Green Bean Mushroom Bake",
    effort: "normal",
    photoUrl: "/images/normal-chicken-greenbean-mushroom-bake.jpg",
    tags: ["dinner", "chicken", "bake", "casserole", "comfort", "family-friendly", "leftovers-friendly"],
    notes: "A creamy baked chicken dinner that works well for cozy weeknights and reheats nicely.",
    ingredients: `4 skinless chicken breasts
8 oz baby bella mushrooms, sliced
2 (10.5 oz) cans cream of mushroom soup
1 (14.5 oz) can green beans, drained
1 Tbsp garlic, minced
2 Tbsp butter
1 cup white rice
2 cups water
1/2 cup shredded mozzarella cheese
salt
pepper`,
    instructions: `Preheat oven to 375°F.
In a baking dish, mix 1 can of cream of mushroom soup, mushrooms, and green beans.
In a skillet over medium-high heat, melt 2 Tbsp butter and brown chicken on both sides with 1 Tbsp garlic.
Place chicken on top of the mixture in the baking dish.
Spread the remaining 1 can of cream of mushroom soup over the chicken.
Cover tightly with foil and bake for 30 minutes, or until chicken reaches 165°F.
Meanwhile, bring 2 cups water to a boil, add rice, reduce heat, cover, and simmer 15 minutes. Rest 5 minutes.
Uncover dish, sprinkle mozzarella on top, and return to oven 5 to 10 minutes until melted.
Serve chicken and mushroom mixture over rice; season with salt and pepper.`,
  },

  {
    id: "big-beef-salisbury-steak",
    slug: "big-beef-salisbury-steak",
    name: "Salisbury Steak with Mushroom Gravy",
    effort: "big",
    photoUrl: "/images/big-beef-salisbury-steak.jpg",
    tags: ["dinner", "beef", "stovetop", "comfort", "gravy", "family-friendly"],
    notes: "Classic comfort food with rich mushroom gravy that is perfect over mashed potatoes.",
    ingredients: `1 lb ground beef
1/4 cup panko breadcrumbs
1 large egg, beaten
5 tsp ketchup
1 tsp dijon mustard
1/2 tsp dried oregano
1 Tbsp olive oil
2 Tbsp butter
2 Tbsp flour
1 1/2 cups beef stock
1 tsp worcestershire sauce
1/2 tsp onion powder
8 oz baby bella mushrooms, sliced
salt
pepper`,
    instructions: `In a bowl, mix ground beef, 1/4 cup breadcrumbs, 1 egg, 2 tsp ketchup, 1 tsp dijon, and 1/2 tsp oregano until just combined.
Shape into 4 oval patties, about 3/4-inch thick.
Heat 1 Tbsp olive oil in a large skillet over medium-high heat.
Cook patties about 3 minutes per side until browned; transfer to a plate.
Reduce heat to medium; melt 2 Tbsp butter in the same skillet.
Whisk in 2 Tbsp flour until smooth; cook 1 to 2 minutes.
Reduce heat to medium-low and slowly whisk in 1 1/2 cups beef stock until smooth.
Stir in 1 Tbsp ketchup, 1 tsp worcestershire, and 1/2 tsp onion powder.
Add mushrooms and simmer about 5 minutes until thickened; season with salt and pepper.
Return patties to skillet, nestle into gravy, cover, and cook 10 minutes or until temperature reaches 160°F.
Serve over mashed potatoes with mushroom gravy spooned on top.`,
  },

  {
    id: "normal-wild-west-shrimp",
    slug: "normal-wild-west-shrimp",
    name: "Wild West Shrimp",
    effort: "normal",
    photoUrl: "/images/normal-wild-west-shrimp.jpg",
    tags: ["dinner", "seafood", "shellfish", "shrimp", "fried", "spicy", "restaurant-style"],
    notes: "A restaurant-style shrimp dish with bold buttery heat and a crunchy coating.",
    ingredients: `1 lb medium shrimp, peeled and deveined
1 1/2 cups flour
1 tsp pepper
1/2 tsp salt
1 cup milk
frying oil (enough for about 2 inches deep)
1 Tbsp Old Bay seasoning
1/2 cup butter
1 Tbsp garlic, minced
1 Tbsp lemon juice
6 cherry peppers, chopped`,
    instructions: `Add oil to a frying pan or pot and heat over medium-high.
In a bowl, mix 1 1/2 cups flour, 1/2 tsp salt, and 1 tsp pepper.
Place 1 cup milk in a separate bowl.
Dredge shrimp in milk, then coat in flour mixture. Shake off excess.
Fry shrimp in batches until golden and cooked through.
Remove with a slotted spoon and drain on paper towels.

In a separate pan, melt 1/2 cup butter over low heat.
Add 1 Tbsp garlic and 1 Tbsp lemon juice and stir.
Add 6 chopped cherry peppers and about 1 Tbsp Old Bay seasoning.
Sauté over low heat for 2 to 3 minutes.

Drizzle the mixture over the fried shrimp.
Serve warm with ranch dressing.`,
  },

  {
    id: "big-mushroom-swiss-sliders",
    slug: "big-mushroom-swiss-sliders",
    name: "Mushroom Swiss Sliders",
    effort: "big",
    photoUrl: "/images/big-mushroom-swiss-sliders.jpg",
    tags: ["dinner", "beef", "sliders", "sandwich", "bake", "party", "comfort", "family-friendly"],
    notes: "Great for feeding a crowd or using as a fun family dinner night.",
    ingredients: `1 Tbsp seasoned salt
1 Tbsp hamburger seasoning
1/4 tsp salt
1/4 tsp pepper
1 Tbsp olive oil
1/2 cup yellow onion, diced
1 tsp garlic, minced
1 lb ground beef
1/2 tsp worcestershire sauce
3/4 cup (1 1/2 stick) butter
8 oz baby bella mushrooms, sliced
1/4 cup beef broth
1/4 cup milk
1/2 cup shredded Swiss cheese
1 tsp garlic salt
2 tsp sesame seeds
1 package King’s Hawaiian rolls (12 count)
12 slices Swiss cheese`,
    instructions: `Preheat oven to 350°F. Spray a 9x13-inch baking dish with nonstick spray.

In a small bowl, mix 1 Tbsp seasoned salt, 1 Tbsp hamburger seasoning, 1/4 tsp salt, and 1/4 tsp pepper.
Heat 1 Tbsp olive oil in a large skillet over medium heat.
Add 1/2 cup diced onion and 1 tsp garlic and cook 1 to 2 minutes.
Add ground beef and break apart with a spoon.
Stir in 1/2 tsp worcestershire and seasoning mixture.
Cook 8 to 10 minutes until no pink remains. Drain and set aside.

In a medium saucepan over medium heat, melt 1/2 cup butter.
Add mushrooms and cook 5 to 10 minutes until softened.
Add 1/4 cup beef broth and 1/4 cup milk.
Reduce heat and slowly whisk in 1/2 cup shredded Swiss cheese until melted.
Stir in cooked hamburger mixture and combine well.

Melt 1/4 cup butter and mix with 1 tsp garlic salt and 2 tsp sesame seeds in a small bowl.

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
    photoUrl: "/images/normal-school-pizza.jpg",
    tags: ["dinner", "pizza", "bake", "comfort", "kid-friendly", "sheet-pan", "family-friendly"],
    notes: "A nostalgic sheet-pan pizza that brings back cafeteria memories in the best way.",
    ingredients: `4 Tbsp olive oil, divided
3 Tbsp cornmeal
1 lb prepared pizza dough
1 lb mild ground Italian sausage
3 Tbsp Italian seasoning
1 (13 oz) jar pizza sauce
4 cups shredded mozzarella cheese`,
    instructions: `Preheat oven to 400°F.
Drizzle 3 Tbsp olive oil onto a half sheet pan and brush to coat evenly.
Sprinkle 3 Tbsp cornmeal over the pan.

Stretch pizza dough into a rectangle to fit the sheet pan.
If the dough resists stretching, let it rest 5 minutes and continue.

Heat remaining 1 Tbsp olive oil in a skillet over medium-high heat.
Add sausage and 3 Tbsp Italian seasoning.
Cook 7 to 8 minutes until browned and no longer pink.
Drain excess grease.

Bake crust alone for 7 to 8 minutes until it no longer looks wet and begins to lightly brown.
Remove from oven.

Spread pizza sauce evenly over crust, reaching the edges.
Sprinkle cooked sausage evenly over sauce.
Top with 4 cups shredded mozzarella.

Return to oven and bake 8 to 10 minutes until cheese is melted and lightly golden.
Remove and slice into 8 rectangles.
Serve warm.`,
  },

  {
    id: "big-shotgun-shells",
    slug: "big-shotgun-shells",
    name: "Shotgun Shells",
    effort: "big",
    photoUrl: "/images/big-shotgun-shells.jpg",
    tags: ["dinner", "beef", "pork", "bbq", "bake", "party", "comfort", "game-day"],
    notes: "A big-flavor BBQ dinner that is fun for weekends, cookouts, or game day.",
    ingredients: `2 (8 oz) boxes manicotti shells (uncooked)
1 1/2 lb ground beef
1 lb hot Italian sausage
1 medium red onion, finely diced
2 cups colby jack cheese, shredded
6 oz cream cheese, softened
1 jalapeno, finely diced
2 tsp Cajun seasoning
2 tsp garlic powder
2 tsp pepper
1 tsp red pepper flakes
3 (12 oz) packages bacon
1/2 cup barbecue sauce (plus extra for brushing)`,
    instructions: `Preheat oven to 300°F.
Line a baking sheet with aluminum foil and place a wire rack on top.

In a large bowl, mix together 1 1/2 lb ground beef, 1 lb hot Italian sausage, 1 medium onion, 2 cups colby jack cheese, 6 oz cream cheese, 1 jalapeno, 2 tsp Cajun seasoning, 2 tsp garlic powder, 2 tsp pepper, and 1 tsp red pepper flakes until fully combined.

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
    photoUrl: "/images/normal-shrimp-and-sausage-bake.jpg",
    tags: ["dinner", "sheet-pan", "seafood", "shellfish", "shrimp", "sausage", "one-pan", "leftovers-friendly"],
    notes: "A low-mess sheet-pan dinner with big flavor and a nice mix of protein and veggies.",
    ingredients: `cooking spray
3 cups red potatoes, cut into 1-inch pieces
4 Tbsp butter, melted
3 Tbsp olive oil
2 tsp garlic, minced
1 Tbsp dried parsley
1 Tbsp dried oregano
1/2 tsp garlic powder
1/2 tsp seasoned salt
1 tsp paprika
1/4 tsp cayenne pepper
1 lb extra-large shrimp, peeled and deveined
1 package smoked sausage, sliced into coins
1 large yellow onion, cut into 1/2-inch pieces
1 red bell pepper, cut into 1-inch pieces
1 green bell pepper, cut into 1-inch pieces
1 can corn, drained
fresh parsley`,
    instructions: `Preheat oven to 400°F.
Lightly coat a large sheet pan with cooking spray. Add cut potatoes to the sheet pan.

In a small bowl, whisk together 4 Tbsp melted butter, 3 Tbsp olive oil, 2 tsp garlic, 1 Tbsp dried parsley, 1 Tbsp dried oregano, 1/2 tsp garlic powder, 1/2 tsp seasoned salt, 1 tsp paprika, and 1/4 tsp cayenne pepper.

Remove 2 tablespoons of this mixture and toss with potatoes until evenly coated. Spread potatoes into an even layer and bake for 15 minutes.

Meanwhile, pat shrimp dry and toss with 2 1/2 tablespoons of the butter-herb mixture. Set aside.

Slice sausage into coins, cut onion into 1/2-inch pieces, cut bell peppers into 1-inch pieces, and drain corn thoroughly.

Remove potatoes from oven and toss. Push potatoes to one side of the sheet pan. Add sausage, onion, and bell peppers to the other side.

Pour remaining herb-butter mixture over everything and toss well. Spread into an even layer and return to oven for 15 minutes.

Toss and bake an additional 8 minutes.

Remove from oven and space vegetables evenly. Add shrimp to pan and bake 6 minutes, or until shrimp is cooked through and vegetables are crisp-tender.

Add drained corn on top and bake 1 additional minute.

Toss gently and garnish with fresh parsley before serving.`,
  },

  {
    id: "normal-classic-meatloaf",
    slug: "normal-classic-meatloaf",
    name: "Classic Meatloaf",
    effort: "normal",
    photoUrl: "/images/normal-classic-meatloaf.jpg",
    tags: ["dinner", "beef", "bake", "comfort", "classic", "family-friendly", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Juicy, tender meatloaf with a sweet and tangy glaze. For extra flavor, sauté the onions and garlic before mixing. Great served with mashed potatoes and green beans.",
    ingredients: `1 1/2 lbs ground beef
1 cup breadcrumbs (or crushed crackers)
1/2 cup milk
1 small yellow onion, finely diced
2 cloves garlic, minced
2 large eggs
2 Tbsp ketchup
1 Tbsp worcestershire sauce
1 tsp salt
1/2 tsp pepper
1 tsp smoked paprika
1/2 tsp dried thyme
1/2 tsp dried parsley
1/2 tsp onion powder

FOR GLAZE
1/3 cup ketchup
2 Tbsp brown sugar
1 Tbsp worcestershire sauce
1 tsp mustard`,
    instructions: `Preheat oven to 375°F. Line a baking sheet with parchment paper or lightly grease a loaf pan.

In a large bowl, combine 1 cup breadcrumbs and 1/2 cup milk. Let sit for 2 to 3 minutes until absorbed.

Add ground beef, diced onion, garlic, eggs, 2 Tbsp ketchup, 1 Tbsp worcestershire sauce, 1 tsp salt, 1/2 tsp pepper, 1 tsp smoked paprika, 1/2 tsp thyme, 1/2 tsp parsley, and 1/2 tsp onion powder. Mix gently with your hands until just combined. Do not overmix.

Transfer the mixture to the prepared baking sheet or loaf pan. Shape into a loaf about 8 to 9 inches long.

In a small bowl, whisk together 1/3 cup ketchup, 2 Tbsp brown sugar, 1 Tbsp worcestershire sauce, and 1 tsp mustard. Spread half of the glaze over the meatloaf.

Bake for 40 minutes. Remove from the oven, spread the remaining glaze on top, and return to the oven.

Bake for an additional 15 to 25 minutes, until the internal temperature reaches 160°F and the glaze is caramelized.

Let rest for 10 minutes before slicing and serving.`,
  },

  {
    id: "normal-tilapia-asparagus-foil-packets",
    slug: "normal-tilapia-asparagus-foil-packets",
    name: "Tilapia & Asparagus Foil Packets",
    effort: "normal",
    photoUrl: "/images/normal-tilapia-asparagus-foil-packets.jpg",
    tags: ["dinner", "seafood", "fish", "tilapia", "foil-packets", "bake", "healthy", "one-pan"],
    notes: "A light and easy fish dinner with almost no cleanup.",
    ingredients: `1 bunch asparagus
2 yellow squash
1/4 tsp garlic powder
4 tilapia fillets, thawed
1/4 tsp salt
1/4 tsp paprika
4 Tbsp butter
4 tsp lemon juice
1 tsp dried oregano`,
    instructions: `Preheat oven to 375°F.

Lay out four 2-foot sheets of aluminum foil.

Cut off end of asparagus and place slightly off-center on the foil, forming a base layer.
Top with sliced squash and sprinkle with 1/4 tsp garlic powder.

Place one tilapia fillet on top of the vegetables.
Season with 1/4 tsp salt and 1/4 tsp paprika.

Add 2 Tbsp butter on top of each fillet.
Drizzle with 2 tsp lemon juice.
Sprinkle with 1 tsp dried oregano.

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
    photoUrl: "/images/normal-slow-cooker-beef-enchilada-casserole.jpg",
    tags: ["dinner", "beef", "slow-cooker", "casserole", "mexican", "comfort", "leftovers-friendly"],
    notes: "An easy crockpot dinner that is filling, cheesy, and great for busy evenings.",
    ingredients: `1 1/2 lbs lean ground beef
1 packet taco seasoning
1 (15 oz) can black beans, drained and rinsed
1 (28 oz) jar enchilada sauce
1 (4 oz) can green chilies
1 white onion, diced
10 (6-inch) corn tortillas, cut into wedges
1 1/2 cups shredded Mexican cheese blend
cilantro, chopped
pico de gallo
sour cream`,
    instructions: `In a large skillet over medium-high heat, cook 1 1/2 lbs lean ground beef until browned.
Drain excess grease and stir in 1 packet of taco seasoning.

Transfer the seasoned beef to the slow cooker.
Add 28 oz enchilada sauce, 15 oz drained black beans, 4 oz green chilies, and 1 diced white onion.
Stir to combine.

Cover and cook on Low for 3 to 4 hours.

Stir in half of the corn tortilla wedges (5 tortillas) and 3/4 cup of the shredded Mexican cheese.
Layer the remaining tortilla wedges and the remaining 3/4 cup of cheese on top.

Cover and cook on High for about 30 minutes, or until the cheese is fully melted.

Garnish with chopped cilantro, pico de gallo, and sour cream before serving.`,
  },

  {
    id: "normal-shepherds-pie",
    slug: "normal-shepherds-pie",
    name: "Shepherd’s Pie",
    effort: "normal",
    photoUrl: "/images/normal-shepherds-pie.jpg",
    tags: ["dinner", "beef", "bake", "comfort", "casserole", "family-friendly", "leftovers-friendly"],
    notes: "A warm, classic comfort meal that feels right at home on chilly nights.",
    ingredients: `1 1/2 to 2 lbs potatoes (about 3 large), peeled and quartered
8 Tbsp butter (1 stick), divided
1 medium yellow onion, chopped
2 cups mixed vegetables (diced carrots, corn, peas)
1 1/2 lbs ground beef
1/2 cup beef broth
1 tsp worcestershire sauce
salt
pepper
8 oz baby bella mushrooms
2 cloves garlic`,
    instructions: `Place 1 1/2 to 2 lbs of peeled and quartered potatoes in a pot and cover with at least 1 inch of cold water. Add a teaspoon of salt. Bring to a boil, reduce to a simmer, and cook until tender, about 20 minutes.

While potatoes cook, melt 4 Tbsp butter in a large sauté pan over medium heat. Add 1 chopped medium onion and the diced carrots from the mixed vegetables and cook until tender, about 6 to 10 minutes.

Add 8 oz baby bella mushrooms and 2 cloves garlic; cook 2 to 3 minutes until mushrooms soften.

Add 1 1/2 lbs ground beef, along with the remaining corn and peas from the mixed vegetables. Cook until the beef is no longer pink. Season with salt and pepper.

Stir in 1 tsp worcestershire sauce and 1/2 cup beef broth. Bring to a simmer, reduce heat to low, and cook uncovered for about 10 minutes. Add a splash more broth if needed to keep it from drying out.

Drain the potatoes and place in a bowl with the remaining 4 Tbsp butter. Mash and season with salt and pepper to taste.

Preheat oven to 400°F. Spread the beef mixture in an even layer in an 8x13 baking dish.

Spread the mashed potatoes over the top. Rough up the surface with a fork to create peaks.

Bake about 30 minutes until browned and bubbling.`,
  },

  {
    id: "normal-italian-sausage-stuffed-peppers",
    slug: "normal-italian-sausage-stuffed-peppers",
    name: "Italian Sausage Stuffed Peppers",
    effort: "normal",
    photoUrl: "/images/normal-italian-sausage-stuffed-peppers.jpg",
    tags: ["dinner", "pork", "italian", "bake", "stuffed-peppers", "comfort", "family-friendly"],
    notes: "A solid weeknight baked dinner that is filling without being too fussy.",
    ingredients: `1 lb Italian sausage
2 tsp olive oil
1 (14.5 oz) can fire-roasted diced tomatoes
2 tsp garlic powder
2 tsp onion powder
2 tsp Italian seasoning
1 tsp worcestershire sauce
1 1/2 cups rice, cooked
1/4 cup chicken broth
1/4 cup grated Parmesan cheese
1 cup mozzarella cheese, grated
3 large bell peppers
red pepper flakes
fresh basil`,
    instructions: `Preheat oven to 375°F.

Cut around the stem of 3 large bell peppers and remove it. Slice peppers in half lengthwise and remove seeds and white membrane. Place cut-side up in a baking dish.

Heat 2 tsp olive oil in a large skillet over medium-high heat. Brown 1 lb Italian sausage, breaking into small pieces, about 3 to 4 minutes. Drain grease if needed.

Add 1 (14.5 oz) can fire-roasted diced tomatoes, 2 tsp garlic powder, 2 tsp onion powder, 2 tsp Italian seasoning, 1 tsp worcestershire sauce, 1/4 cup chicken broth, and 1 1/2 cups cooked rice. Stir to combine and bring to a simmer. Cook 3 to 4 minutes until liquid is mostly gone.

Stir in 1/4 cup grated Parmesan cheese and remove from heat.

Fill pepper halves with sausage mixture and top with 1 cup grated mozzarella cheese.

Cover with foil and bake 25 to 30 minutes, or longer if you like softer peppers, until peppers are tender.

Remove foil and broil 2 to 3 minutes until cheese is browned.

Cool 1 to 2 minutes. Top with fresh basil and red pepper flakes if desired and serve.`,
  },

  {
    id: "quick-honey-garlic-chicken",
    slug: "quick-honey-garlic-chicken",
    name: "Honey Garlic Chicken",
    effort: "quick",
    photoUrl: "/images/quick-honey-garlic-chicken.jpg",
    tags: ["dinner", "chicken", "quick", "one-pan", "sweet-savory", "weeknight", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Fast and flavorful honey garlic chicken with a sticky, glossy sauce. Great served over rice with steamed broccoli or stir-fried vegetables.",
    ingredients: `1 1/2 lbs boneless, skinless chicken breast
2 Tbsp cornstarch (optional)
1 Tbsp olive oil
1/2 tsp salt
1/2 tsp pepper
1/3 cup honey
1/4 cup soy sauce
4 cloves garlic, minced
1 Tbsp fresh ginger, grated (or 1/2 tsp ground ginger)
1 Tbsp rice vinegar (or apple cider vinegar)
1 tsp sesame oil (optional)
1 tsp cornstarch + 2 Tbsp water (for slurry)
2 green onions, sliced
1 tsp sesame seeds (optional)`,
    instructions: `Pat 1 1/2 lbs boneless, skinless chicken breast dry and cut into bite-sized pieces. Season with 1/2 tsp salt and 1/2 tsp pepper, then toss lightly with 2 Tbsp cornstarch if using.

Heat 1 Tbsp olive oil in a large skillet or cast iron pan over medium-high heat. Add chicken in a single layer and cook for 4 to 5 minutes without moving, until a deep golden-brown crust forms. Flip and cook another 3 to 4 minutes until nearly cooked through.

Reduce heat to medium. Add 4 cloves minced garlic and 1 Tbsp fresh grated ginger to the pan and cook for 30 to 60 seconds until fragrant.

Pour in 1/3 cup honey, 1/4 cup soy sauce, 1 Tbsp rice vinegar, and 1 tsp sesame oil. Stir well, scraping up any browned bits from the pan.

Bring the sauce to a gentle simmer. Mix 1 tsp cornstarch with 2 Tbsp water to create a slurry.

Stir the cornstarch slurry into the pan and cook for 2 to 3 minutes, stirring frequently, until the sauce thickens and becomes glossy.

Remove from heat and toss the chicken until fully coated in the sauce.

Garnish with 2 sliced green onions and 1 tsp sesame seeds before serving.`,
  },

  {
    id: "quick-lemon-butter-salmon",
    slug: "quick-lemon-butter-salmon",
    name: "Lemon Butter Salmon",
    effort: "quick",
    photoUrl: "/images/quick-lemon-butter-salmon.jpg",
    tags: ["dinner", "seafood", "fish", "salmon", "quick", "healthy", "one-pan", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Quick, restaurant-quality salmon with a rich lemon butter sauce. Crispy on the outside, tender inside. Excellent with rice, roasted vegetables, or a light salad.",
    ingredients: `4 salmon fillets (about 6 oz each, skin-on preferred)
1/2 tsp salt
1/2 tsp pepper
1 Tbsp olive oil
3 Tbsp unsalted butter
3 cloves garlic, minced
juice of 1 lemon
1 tsp lemon zest
1 Tbsp fresh parsley`,
    instructions: `Pat 4 salmon fillets (about 6 oz each) dry with paper towels. Season both sides with 1/2 tsp salt and 1/2 tsp pepper.

Heat 1 Tbsp olive oil in a large skillet (preferably cast iron or stainless steel) over medium-high heat.

Once the oil is hot and shimmering, place the salmon skin-side down. Press gently with a spatula for the first 30 seconds to prevent curling.

Cook undisturbed for 4 to 5 minutes, until the skin is crispy and a golden crust forms. The salmon should be mostly opaque about two-thirds up the sides.

Flip carefully and cook another 2 to 3 minutes, until just cooked through and flaky.

Reduce heat to medium-low. Add 3 Tbsp unsalted butter to the pan and let it melt. Stir in 3 cloves minced garlic and cook for 30 to 60 seconds until fragrant but not browned.

Squeeze in the juice of 1 lemon and add 1 tsp lemon zest if using. Spoon the lemon butter sauce over the salmon continuously for about 1 minute.

Remove from heat. Garnish with 1 Tbsp chopped fresh parsley and serve immediately.`,
  },

  {
    id: "quick-chicken-fried-rice",
    slug: "quick-chicken-fried-rice",
    name: "Chicken Fried Rice",
    effort: "quick",
    photoUrl: "/images/quick-chicken-fried-rice.jpg",
    tags: ["dinner", "chicken", "rice", "one-pan", "quick", "takeout-style", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Quick and flavorful fried rice using leftover chicken and rice. For best texture, use cold, day-old rice so it crisps up instead of getting mushy.",
    ingredients: `2 cups cooked and chilled rice (day-old preferred)
1 lb cooked chicken, diced (or rotisserie chicken)
2 eggs, beaten
1 cup frozen mixed vegetables
2 Tbsp soy sauce (plus more to taste)
1 Tbsp sesame oil
1 Tbsp vegetable oil
2 green onions, sliced
2 cloves garlic, minced
1 tsp fresh ginger, grated
1/2 tsp pepper`,
    instructions: `Heat a large skillet or wok over medium-high heat. Add 1 Tbsp vegetable oil.

Pour in 2 beaten eggs and scramble quickly until just set, about 1 minute. Remove from the pan and set aside.

In the same pan, add 2 cloves minced garlic and 1 tsp grated ginger. Cook for 30 seconds until fragrant.

Add 1 cup frozen mixed vegetables and cook for 2 to 3 minutes until heated through and slightly tender.

Add 2 cups cooked and chilled rice, breaking up any clumps with a spatula. Cook for 3 to 4 minutes, stirring occasionally, until the rice is hot and lightly crisped in spots.

Stir in 1 lb diced cooked chicken and cook for another 2 to 3 minutes until heated through.

Add 2 Tbsp soy sauce, 1 Tbsp sesame oil, and 1/2 tsp pepper. Toss everything together until evenly coated.

Return the scrambled eggs to the pan and gently fold them in.

Remove from heat, sprinkle with 2 sliced green onions, and serve immediately.`,
  },

  {
    id: "quick-bbq-chicken-flatbread",
    slug: "quick-bbq-chicken-flatbread",
    name: "BBQ Chicken Flatbread",
    effort: "quick",
    photoUrl: "/images/quick-bbq-chicken-flatbread.jpg",
    tags: ["dinner", "chicken", "quick", "flatbread", "pizza", "kid-friendly", "one-pan", "leftovers-friendly"],
    isVegetarian: false,
    notes: "A quick, fun flatbread loaded with BBQ chicken and melty cheese. Great for using leftover or rotisserie chicken and easy to customize with your favorite toppings.",
    ingredients: `2 flatbreads or naan
1 cup cooked chicken, shredded (rotisserie works great)
1/2 cup BBQ sauce (plus extra for drizzling)
1/2 small red onion, thinly sliced
1 cup mozzarella cheese, shredded
1/2 cup smoked gouda or cheddar cheese (optional, for more flavor)
1 Tbsp olive oil
1 Tbsp fresh cilantro, chopped (optional)
1/2 tsp garlic powder`,
    instructions: `Preheat oven to 400°F. Place 2 flatbreads on a baking sheet and lightly brush the edges with 1 Tbsp olive oil.

Spread 1/2 cup BBQ sauce evenly over each flatbread, leaving a small border around the edges.

Toss 1 cup shredded cooked chicken with a spoonful of BBQ sauce for extra flavor, then distribute evenly over the flatbreads.

Top with 1/2 small red onion, 1 cup shredded mozzarella, and 1/2 cup smoked gouda or cheddar.

Sprinkle lightly with 1/2 tsp garlic powder.

Bake for 8 to 10 minutes, until the cheese is fully melted, bubbly, and starting to brown on the edges.

For extra caramelization, broil on high for 1 to 2 minutes, watching closely so it doesn’t burn.

Remove from the oven, drizzle with additional BBQ sauce if desired, and sprinkle with 1 Tbsp chopped fresh cilantro.

Slice and serve immediately.`,
  },

  {
    id: "normal-baked-ziti",
    slug: "normal-baked-ziti",
    name: "Baked Ziti",
    effort: "normal",
    photoUrl: "/images/normal-baked-ziti.jpg",
    tags: ["dinner", "pasta", "beef", "bake", "comfort", "italian", "family-friendly", "leftovers-friendly"],
    isVegetarian: false,
    notes: "A hearty, cheesy baked pasta layered with rich meat sauce. Perfect for feeding a crowd and excellent for leftovers—flavors deepen even more the next day.",
    ingredients: `1 lb ziti pasta
1 lb ground beef (or Italian sausage for more flavor)
1 (24 oz) jar marinara sauce
1/2 cup water (or reserved pasta water)
1 cup ricotta cheese
2 cups mozzarella cheese, shredded
1/2 cup Parmesan cheese, grated
1 small yellow onion, diced
2 cloves garlic, minced
1 Tbsp olive oil
1 tsp Italian seasoning
1/2 tsp salt
1/2 tsp pepper
1/4 cup fresh parsley, chopped (optional)`,
    instructions: `Preheat oven to 375°F. Lightly grease a 9x13 baking dish.

Bring a large pot of salted water to a boil. Cook 1 lb ziti pasta until just al dente, about 1 to 2 minutes less than package directions. Drain and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1 diced small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook until browned, breaking it apart as it cooks. Drain excess grease if needed.

Stir in 1 (24 oz) jar marinara sauce, 1/2 cup water, 1 tsp Italian seasoning, 1/2 tsp salt, and 1/2 tsp pepper. Simmer for 5 to 10 minutes until slightly thickened.

In a large bowl, combine the cooked pasta with most of the meat sauce, reserving about 1 cup for layering.

Spread a thin layer of sauce on the bottom of the baking dish. Add half of the pasta mixture, then dollop 1/2 cup ricotta and sprinkle with 1 cup mozzarella.

Repeat with the remaining pasta, 1/2 cup ricotta, and 1 cup mozzarella. Top with the reserved sauce and finish with 1/2 cup Parmesan cheese.

Cover loosely with foil and bake for 20 minutes. Remove foil and bake another 10 to 15 minutes until the cheese is melted and bubbly with lightly golden edges.

Let rest for 10 minutes before serving. Garnish with 1/4 cup fresh chopped parsley if desired.`,
  },

  {
    id: "normal-chicken-alfredo",
    slug: "normal-chicken-alfredo",
    name: "Chicken Alfredo",
    effort: "normal",
    photoUrl: "/images/normal-chicken-alfredo.jpg",
    tags: ["dinner", "pasta", "chicken", "comfort", "italian", "stovetop", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Rich and creamy chicken alfredo with a smooth Parmesan sauce. Use freshly grated Parmesan for best results and add pasta water to achieve a silky, restaurant-style finish.",
    ingredients: `2 boneless, skinless chicken breasts, sliced
12 oz fettuccine
1 Tbsp olive oil
1/2 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder (optional)
1/2 cup (1 stick) unsalted butter
3 cloves garlic, minced
1 cup heavy cream
1 cup freshly grated Parmesan cheese
1/2 cup reserved pasta water
1/4 tsp pepper (for sauce)
1/4 cup fresh parsley, chopped (optional)`,
    instructions: `Bring a large pot of salted water to a boil. Cook 12 oz fettuccine according to package directions until al dente. Reserve 1/2 cup pasta water, then drain.

Season 2 sliced chicken breasts with 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp garlic powder.

Heat 1 Tbsp olive oil in a large skillet over medium-high heat. Add the chicken and cook for 4 to 5 minutes, stirring occasionally, until golden brown and cooked through. Remove and set aside.

Reduce heat to medium. In the same pan, melt 1/2 cup unsalted butter. Add 3 cloves minced garlic and cook for 30 to 60 seconds until fragrant.

Pour in 1 cup heavy cream and bring to a gentle simmer. Cook for 3 to 5 minutes, stirring occasionally, until slightly thickened.

Stir in 1 cup freshly grated Parmesan cheese gradually, whisking until melted and smooth.

Add a splash of the reserved pasta water and stir until the sauce becomes silky and coats the back of a spoon.

Return the chicken to the pan, then add the cooked pasta. Toss everything together until evenly coated with the sauce. Add 1/4 tsp pepper for seasoning.

Taste and adjust salt and pepper as needed. Remove from heat and garnish with 1/4 cup chopped fresh parsley before serving.`,
  },

  {
    id: "normal-beef-stroganoff",
    slug: "normal-beef-stroganoff",
    name: "Beef Stroganoff",
    effort: "normal",
    photoUrl: "/images/normal-beef-stroganoff.jpg",
    tags: ["dinner", "beef", "comfort", "stovetop", "pasta", "family-friendly", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Creamy, savory beef stroganoff with tender beef and mushrooms in a rich sauce. For best results, sear the beef quickly over high heat and avoid boiling after adding sour cream to prevent curdling.",
    ingredients: `1 lb beef sirloin, thinly sliced
8 oz baby bella mushrooms, sliced
1 small yellow onion, diced
2 cloves garlic, minced
2 Tbsp butter
1 Tbsp olive oil
2 Tbsp flour
1 cup beef broth
1 tsp worcestershire sauce
1/2 cup sour cream
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
8 oz egg noodles
1/4 cup fresh parsley, chopped (optional)`,
    instructions: `Cook 8 oz egg noodles in a large pot of salted boiling water according to package directions. Drain and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium-high heat. Add 1 lb thinly sliced beef sirloin in a single layer and sear for 2 to 3 minutes until browned. Season with 1/2 tsp salt and 1/2 tsp pepper. Do not overcrowd the pan. Remove and set aside.

In the same skillet, reduce heat to medium and add 2 Tbsp butter. Add 1 small diced yellow onion and cook for 4 to 5 minutes until softened.

Add 8 oz sliced baby bella mushrooms and cook for 5 to 7 minutes, stirring occasionally, until they release their moisture and begin to brown.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Sprinkle 2 Tbsp flour over the mixture and stir continuously for 1 minute to cook out the raw flour taste.

Slowly pour in 1 cup beef broth while stirring, scraping up any browned bits from the bottom of the pan. Stir in 1 tsp worcestershire sauce.

Bring to a gentle simmer and cook for 3 to 5 minutes, until the sauce thickens and coats the back of a spoon.

Reduce heat to low. Stir in 1/2 cup sour cream until smooth and creamy.

Return the beef to the pan and cook for 2 to 3 minutes until heated through. Do not boil after adding sour cream.

Serve over the cooked egg noodles and garnish with 1/4 cup fresh parsley if desired.`,
  },

  {
    id: "normal-chicken-pot-pie",
    slug: "normal-chicken-pot-pie",
    name: "Chicken Pot Pie",
    effort: "normal",
    photoUrl: "/images/normal-chicken-pot-pie.jpg",
    tags: ["dinner", "chicken", "bake", "comfort", "casserole", "family-friendly", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Creamy, classic chicken pot pie with a flaky golden crust. Letting it rest before serving helps the filling set and makes cleaner portions.",
    ingredients: `2 cups cooked chicken, diced (rotisserie works great)
1 cup frozen mixed vegetables
1/2 cup (1 stick) unsalted butter
1/2 cup all-purpose flour
2 cups chicken broth
1 cup milk
1 small yellow onion, diced
2 cloves garlic, minced
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1/2 tsp dried thyme (optional)
1 refrigerated pie crust
1 egg, beaten (optional, for egg wash)`,
    instructions: `Preheat oven to 400°F. Lightly grease a baking dish or pie dish.

In a large skillet or saucepan, melt 1/2 cup unsalted butter over medium heat. Add 1 diced small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Stir in 1/2 cup all-purpose flour and cook for 1 to 2 minutes, stirring constantly, to form a roux and remove the raw flour taste.

Slowly whisk in 2 cups chicken broth and 1 cup milk, stirring continuously to prevent lumps.

Bring to a gentle simmer and cook for 5 to 7 minutes, stirring often, until the sauce thickens and coats the back of a spoon.

Stir in 2 cups diced cooked chicken, 1 cup frozen mixed vegetables, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp dried thyme. Cook for 2 to 3 minutes until heated through.

Pour the filling into the prepared baking dish.

Lay 1 refrigerated pie crust over the top, trimming any excess and pressing lightly to seal the edges. Cut a few small slits in the top to allow steam to escape.

Brush with 1 beaten egg if using for a golden finish.

Bake for 30 to 35 minutes, until the crust is golden brown and the filling is bubbling around the edges.

Let rest for 10 minutes before serving to allow the filling to set.`,
  },

  {
    id: "normal-taco-pasta",
    slug: "normal-taco-pasta",
    name: "Cheesy Taco Pasta",
    effort: "normal",
    photoUrl: "/images/normal-taco-pasta.jpg",
    tags: ["dinner", "pasta", "tex-mex", "beef", "cheesy", "one-pan", "family-friendly", "leftovers-friendly"],
    isVegetarian: false,
    notes: "A cheesy, taco-inspired pasta with bold flavor and a creamy finish. Great for family dinners and even better as leftovers the next day.",
    ingredients: `1 lb ground beef
8 oz pasta (rotini or shells work best)
1 Tbsp olive oil
1 small yellow onion, diced
2 cloves garlic, minced
1 (14.5 oz) can diced tomatoes (with juices)
1 cup beef broth
1 cup cheddar cheese, shredded
1/2 cup Monterey Jack cheese (optional, for extra melt)
1/4 cup cream cheese (optional, for extra creaminess)

Taco Pasta Seasoning:
1 Tbsp chili powder
1 tsp cumin
1/2 tsp paprika (or smoked paprika for extra depth)
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper`,
    instructions: `Bring a large pot of salted water to a boil. Cook 8 oz pasta according to package directions until al dente. Drain and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1 diced small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook until browned, breaking it apart as it cooks. Drain excess grease if needed.

Stir in the taco seasoning: 1 Tbsp chili powder, 1 tsp cumin, 1/2 tsp paprika, 1/2 tsp garlic powder, 1/2 tsp onion powder, 1/2 tsp salt, and 1/4 tsp pepper. Cook for 1 minute to toast the spices.

Add 1 (14.5 oz) can diced tomatoes with their juices and 1 cup beef broth. Stir well and bring to a simmer.

Let the mixture simmer for 5 to 7 minutes, until slightly thickened and the flavors are well combined.

Reduce heat to low. Stir in 1/4 cup cream cheese if using until melted and smooth.

Add the cooked pasta and toss to coat evenly.

Stir in 1 cup shredded cheddar cheese and 1/2 cup Monterey Jack if using until melted and creamy.

Remove from heat and serve warm.`,
  },

  {
    id: "pan-seared-scallops-lemon-risotto",
    slug: "pan-seared-scallops-lemon-risotto",
    name: "Pan-Seared Scallops with Lemon Risotto",
    effort: "big",
    photoUrl: "/images/pan-seared-scallops-lemon-risotto.jpg",
    tags: ["dinner", "seafood", "shellfish", "scallops", "risotto", "date-night", "restaurant-style"],
    isVegetarian: false,
    notes: "Elegant, restaurant-quality scallops with creamy lemon risotto. Key to success: keep the stock warm, stir the risotto gradually, and ensure scallops are very dry before searing for a perfect golden crust.",
    ingredients: `10 large sea scallops (side muscle removed)
1 cup Arborio rice
3 cups chicken stock (kept warm)
1/2 cup dry white wine (optional, or extra stock)
1/2 cup Parmesan cheese, freshly grated
2 Tbsp butter (divided)
1 Tbsp olive oil
1 small shallot, finely diced (or 1/4 onion)
2 cloves garlic, minced
1 Tbsp lemon zest
1 Tbsp lemon juice
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1 Tbsp fresh parsley, chopped (optional)`,
    instructions: `In a saucepan, keep 3 cups chicken stock warm over low heat.

In a large skillet or sauté pan, melt 1 Tbsp butter with 1 Tbsp olive oil over medium heat. Add 1 finely diced small shallot and cook for 2 to 3 minutes until softened.

Add 2 cloves minced garlic and cook for 30 seconds until fragrant.

Stir in 1 cup Arborio rice and cook for 1 to 2 minutes, stirring constantly, until the edges of the grains look slightly translucent.

Pour in 1/2 cup dry white wine and stir until mostly absorbed.

Add the warm chicken stock one ladle at a time, stirring frequently. Allow each addition to absorb before adding the next.

Continue this process for 18 to 22 minutes, until the rice is creamy and tender with a slight bite.

Stir in the remaining 1 Tbsp butter, 1/2 cup freshly grated Parmesan cheese, 1 Tbsp lemon zest, 1 Tbsp lemon juice, 1/2 tsp salt, and 1/2 tsp pepper. The risotto should be loose and creamy, not stiff. Adjust with a splash of stock if needed. Keep warm.

Pat 10 large sea scallops very dry with paper towels and season lightly with salt and pepper.

Heat a separate skillet over high heat until very hot. Add a small amount of oil.

Place scallops in the pan and sear undisturbed for 1 1/2 to 2 minutes until a deep golden-brown crust forms.

Flip and cook another 1 to 2 minutes until just opaque in the center. Do not overcook.

Spoon risotto onto plates and top with the seared scallops. Garnish with 1 Tbsp chopped fresh parsley if desired and serve immediately.`,
  },

  {
    id: "lemon-herb-roasted-salmon",
    slug: "lemon-herb-roasted-salmon",
    name: "Lemon Herb Roasted Salmon",
    effort: "normal",
    photoUrl: "/images/lemon-herb-roasted-salmon.jpg",
    tags: ["dinner", "seafood", "fish", "salmon", "oven", "healthy", "one-pan", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Light, fresh roasted salmon with lemon and herbs. A simple one-pan meal that pairs perfectly with rice or roasted potatoes and reheats well for leftovers.",
    ingredients: `4 salmon fillets (about 6 oz each)
1 bunch asparagus, trimmed
2 Tbsp olive oil
2 cloves garlic, minced
1 lemon, sliced
1 Tbsp lemon juice
2 Tbsp fresh dill, chopped (or 1 tsp dried dill)
1/2 tsp salt
1/2 tsp pepper
1/2 tsp paprika (optional, for light color and depth)`,
    instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper or foil for easy cleanup.

Arrange 4 salmon fillets and 1 bunch trimmed asparagus on the baking sheet in a single layer.

Drizzle 2 Tbsp olive oil evenly over the salmon and asparagus.

Sprinkle 2 cloves minced garlic, 2 Tbsp chopped fresh dill, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp paprika if using over everything.

Place 1 sliced lemon on top of the salmon and drizzle with 1 Tbsp fresh lemon juice.

Roast for 12 to 15 minutes, depending on thickness, until the salmon is opaque and flakes easily with a fork.

For a slightly crisp top, broil on high for 1 to 2 minutes at the end, watching closely.

Remove from the oven and serve immediately.`,
  },

  {
    id: "beef-broccoli-stir-fry",
    slug: "beef-broccoli-stir-fry",
    name: "Beef and Broccoli Stir-Fry",
    effort: "quick",
    photoUrl: "/images/beef-broccoli-stir-fry.jpg",
    tags: ["dinner", "beef", "stir-fry", "one-pan", "quick", "takeout-style", "leftovers-friendly"],
    isVegetarian: false,
    notes: "Quick, takeout-style beef and broccoli with a savory, glossy sauce. Slice the beef thinly against the grain for maximum tenderness and cook quickly over high heat.",
    ingredients: `1 lb flank steak, thinly sliced against the grain
3 cups broccoli florets
2 Tbsp soy sauce (plus more to taste)
1 Tbsp oyster sauce (optional, for deeper flavor)
1 tsp fresh ginger, grated (or 1/2 tsp ground ginger)
2 cloves garlic, minced
1 Tbsp brown sugar
1 Tbsp sesame oil
1 Tbsp vegetable oil (or canola oil)
1/2 cup beef broth (or water)
1 tsp cornstarch + 2 Tbsp water (for slurry)
1/2 tsp pepper
2 green onions, sliced (optional)`,
    instructions: `In a small bowl, whisk together 2 Tbsp soy sauce, 1 Tbsp oyster sauce if using, 1 tsp grated ginger, 2 cloves minced garlic, 1 Tbsp brown sugar, and 1/2 cup beef broth. Set aside.

Heat a wok or large skillet over high heat. Add 1 Tbsp vegetable oil.

Add 1 lb thinly sliced flank steak in a single layer and sear for 2 to 3 minutes without stirring too much, until browned. Remove and set aside.

In the same pan, add 3 cups broccoli florets and stir-fry for 3 to 4 minutes until bright green and tender-crisp. Add a splash of water if needed to help steam.

Return the beef to the pan and pour in the prepared sauce.

Bring to a quick simmer over high heat. Mix 1 tsp cornstarch with 2 Tbsp water to create a slurry; stir it into the pan and cook for 1 to 2 minutes, stirring constantly, until the sauce thickens and becomes glossy.

Drizzle with 1 Tbsp sesame oil and sprinkle with 1/2 tsp pepper. Toss everything together until well coated.

Remove from heat, garnish with 2 sliced green onions if desired, and serve immediately.`,
  },

 {
  id: "zuppa-toscana-soup",
  slug: "zuppa-toscana-soup",
  name: "Zuppa Toscana Soup",
  effort: "normal",
  photoUrl: "/images/zuppa-toscana-soup.jpg",
  tags: ["dinner", "soup", "pork", "italian", "comfort", "one-pot", "family-friendly", "leftovers-friendly"],
  notes: "A rich and cozy soup that feels like restaurant comfort food at home.",
  ingredients: `1 lb Italian ground sausage
4 Tbsp butter
1 white onion, diced
1 Tbsp garlic, minced
6 cups chicken broth
2 cups water
5 yellow potatoes, cut into 1-inch pieces
3 tsp salt
1 tsp pepper
2 cups heavy cream
4 cups fresh kale, chopped
bacon bits
Parmesan cheese, grated`,
  instructions: `In a large pot, sauté 1 lb Italian ground sausage for 5 to 6 minutes until browned.

Use a slotted spoon to transfer the sausage to a plate and set aside.

In the same pot, add 4 Tbsp butter and sauté 1 diced white onion over medium heat until translucent.

Add 1 Tbsp minced garlic and sauté for another minute until fragrant.

Add 6 cups chicken broth, 2 cups water, 5 yellow potatoes cut into 1-inch pieces, 3 tsp salt, and 1 tsp pepper, and bring to a boil.

Boil until the potatoes are tender.

Stir in 4 cups fresh chopped kale and 2 cups heavy cream, then add the cooked sausage back to the pot.

Taste and adjust salt and pepper if needed.

Serve topped with grated Parmesan cheese and bacon bits if desired.`,
},

{
  id: "hidden-veggie-meatloaf",
  slug: "hidden-veggie-meatloaf",
  name: "Hidden Veggie Meatloaf",
  effort: "normal",
  photoUrl: "/images/hidden-veggie-meatloaf.jpg",
  tags: ["dinner", "beef", "meatloaf", "comfort", "family-friendly", "kid-friendly", "leftovers-friendly"],
  isVegetarian: false,
  notes: "A moist, flavorful meatloaf packed with hidden vegetables. Squeezing moisture from the zucchini is key to preventing a soggy texture. Perfect with mashed potatoes and great for leftovers.",
  ingredients: `1 1/2 lbs ground beef (80/20 preferred)
1 medium zucchini, peeled and finely grated
2 carrots, peeled and finely grated
1/2 small yellow onion, finely minced or grated
1/2 cup fresh spinach, finely chopped
1 large egg
3/4 cup panko breadcrumbs
1/4 cup milk
1 Tbsp worcestershire sauce
1 Tbsp ketchup
1 tsp garlic powder
1/2 tsp dried Italian seasoning (optional)
1 tsp salt
1/2 tsp pepper

For the glaze:
1/2 cup ketchup
1 Tbsp brown sugar
1 tsp yellow mustard`,
  instructions: `Preheat oven to 375°F. Line a baking sheet with parchment paper or lightly grease a loaf pan.

Place 1 medium peeled and finely grated zucchini in a clean towel or paper towels and squeeze out as much moisture as possible. This step prevents a watery meatloaf.

In a large bowl, combine 1 large egg, 1/4 cup milk, 3/4 cup panko breadcrumbs, 1 Tbsp worcestershire sauce, 1 Tbsp ketchup, 1 tsp garlic powder, 1/2 tsp dried Italian seasoning if using, 1 tsp salt, and 1/2 tsp pepper.

Add the squeezed grated zucchini, 2 peeled and finely grated carrots, 1/2 small finely minced yellow onion, and 1/2 cup finely chopped fresh spinach. Mix until evenly combined.

Add 1 1/2 lbs ground beef and gently mix with your hands until just combined. Do not overmix or the meatloaf will be dense.

Shape the mixture into a loaf on the prepared baking sheet or press into a loaf pan.

Bake for 40 minutes.

Meanwhile, whisk together 1/2 cup ketchup, 1 Tbsp brown sugar, and 1 tsp yellow mustard in a small bowl.

Remove the meatloaf from the oven, spread the glaze evenly over the top, and return to the oven.

Bake for an additional 15 to 20 minutes, until the internal temperature reaches 160°F and the glaze is slightly caramelized.

Let rest for 10 minutes before slicing and serving.`,
},

{
  id: "toms-spaghetti",
  slug: "toms-spaghetti",
  name: "Tom's Spaghetti",
  effort: "normal",
  photoUrl: "/images/toms-spaghetti.jpg",
  tags: ["dinner", "pasta", "beef", "spaghetti", "comfort", "family-friendly", "leftovers-friendly"],
  notes: "A classic, hearty spaghetti dinner that pairs perfectly with Caesar salad and garlic bread.",
  ingredients: `1 box angel hair pasta
1 lb ground beef
1 green bell pepper, diced
1 (28 oz) can diced tomatoes
1 (16 oz) can tomato sauce
1 (6 oz) can tomato paste
2 tsp dried thyme
4 Tbsp Italian seasoning, divided
1 tsp salt
1/2 tsp pepper
2 Tbsp butter
1 Tbsp olive oil`,
  instructions: `Cook 1 lb ground beef in a skillet over medium heat until browned. Drain grease.

Add 1 diced green bell pepper, 1 can diced tomatoes, 1 can tomato sauce, 1 can tomato paste, 2 tsp dried thyme, 2 Tbsp Italian seasoning, 1 tsp salt, and 1/2 tsp pepper. Stir well.

Bring to a simmer, reduce heat to low, and simmer for 30 minutes.

In a pot, bring 6 cups of salted water to a boil. Add 1 box angel hair pasta and cook for about 5 minutes, stirring occasionally.

Drain the pasta and return it to the pot. Add 2 Tbsp butter, 1 Tbsp olive oil, and the remaining 2 Tbsp Italian seasoning. Stir well.

Serve pasta topped with meat sauce.

Optional: Pair with Caesar salad and garlic bread.`,
},

{
  id: "shrimp-scampi",
  slug: "shrimp-scampi",
  name: "Shrimp Scampi",
  effort: "quick",
  photoUrl: "/images/shrimp-scampi.jpg",
  tags: ["dinner", "seafood", "shellfish", "shrimp", "quick", "skillet", "pasta", "restaurant-style"],
  notes: "Light, buttery, and full of flavor. Great over angel hair pasta for an easy restaurant-style dinner at home.",
  ingredients: `1 1/2 lbs large shrimp, peeled and deveined
2 Tbsp butter
2 Tbsp olive oil
4 garlic cloves, minced
1/4 tsp red pepper flakes (optional)
1/2 cup dry white wine or low-sodium chicken broth
1 1/2 Tbsp lemon juice
1 lemon, cut into wedges
1/4 cup chopped fresh parsley
salt, to taste
pepper, to taste`,
  instructions: `Pat 1 1/2 lbs large shrimp dry and season with 1/2 tsp salt and 1/2 tsp pepper.

Heat 1 Tbsp olive oil and 1 Tbsp butter in a large non-reactive skillet over medium-high heat.

Add the shrimp in a single layer and cook 1 to 2 minutes per side until just opaque. Remove to a plate.

Lower heat to medium. Add the remaining 1 Tbsp olive oil and 1 Tbsp butter.

Sauté 4 minced garlic cloves and 1/4 tsp red pepper flakes, if using, for about 30 seconds until fragrant.

Add 1/2 cup dry white wine or low-sodium chicken broth and simmer for 2 minutes until reduced by half.

Stir in 1 1/2 Tbsp lemon juice.

Return the shrimp and any juices to the skillet and toss to coat.

Remove from heat and stir in 1/4 cup chopped fresh parsley.

Serve with lemon wedges from 1 lemon.

Optional: Pair with angel hair pasta.`,
},

{
  id: "maryland-crab-cake",
  slug: "maryland-crab-cake",
  name: "Maryland Crab Cake",
  effort: "normal",
  photoUrl: "/images/maryland-crab-cake.jpg",
  tags: ["dinner", "seafood", "shellfish", "crab", "baked", "classic", "maryland"],
  notes: "Classic crab cakes with plenty of crab flavor and just enough binder to hold them together.",
  ingredients: `1 lb lump crab meat
1 large egg
1/4 cup mayonnaise
1 tsp dijon mustard
1 tsp worcestershire sauce
1 tsp fresh lemon juice
1 1/2 tsp Old Bay seasoning
1 tsp fresh parsley, chopped
2/3 cup cracker crumbs
1 lemon, cut into wedges`,
  instructions: `In a small bowl, whisk together 1/4 cup mayonnaise, 1 large egg, 1 tsp dijon mustard, 1 tsp worcestershire sauce, 1 1/2 tsp Old Bay seasoning, 1 tsp fresh lemon juice, and 1 tsp chopped fresh parsley.

Add 1 lb lump crab meat and gently fold it into the sauce.

Add 2/3 cup cracker crumbs and continue mixing gently. Be careful not to break up the crab meat too much.

Cover and refrigerate for at least 30 minutes.

Preheat oven to 400°F.

Divide the mixture into 6 portions and form into slightly flattened crab cakes.

Place on a parchment-lined baking sheet.

Bake for 15 to 18 minutes, until lightly browned.

Serve with lemon wedges from 1 lemon and your choice of cocktail sauce or tartar sauce.`,
},

{
  id: "crock-pot-roast-beef",
  slug: "crock-pot-roast-beef",
  name: "Crock Pot Roast Beef",
  effort: "big",
  photoUrl: "/images/crock-pot-roast-beef.jpg",
  tags: ["dinner", "beef", "roast", "slow-cooker", "comfort", "family-friendly", "leftovers-friendly"],
  notes: "A hearty slow-cooker classic with tender beef, vegetables, and an optional homemade gravy.",
  ingredients: `1 1/2 Tbsp olive oil, divided
1 (3 lb) chuck roast
1 tsp salt
1 tsp pepper
1 medium yellow onion, cut into thick slices
5 garlic cloves, minced
2 cups beef broth
2 tsp worcestershire sauce
1 Tbsp fresh thyme, minced
1 Tbsp fresh rosemary, minced
2 1/2 lbs small Yukon gold potatoes, left whole
2 cups baby carrots
2 cups celery, cut into 1-inch pieces
1 (8 oz) package baby bella mushrooms
2 1/2 Tbsp cornstarch mixed with 3 Tbsp beef broth (optional)
2 Tbsp fresh parsley, chopped`,
  instructions: `Heat 1 Tbsp olive oil in a large pot over medium-high heat.

Pat the 3 lb chuck roast dry and season generously with 1 tsp salt and 1 tsp pepper.

Sear roast until browned on both sides, about 4 to 5 minutes per side. Transfer to the slow cooker.

Add the remaining 1/2 Tbsp olive oil to the pot. Add 1 medium yellow onion cut into thick slices and cook for 2 minutes.

Add the 8 oz package of baby bella mushrooms and cook until they begin to brown. Add 5 minced garlic cloves and cook for 30 seconds more.

Pour the onion and mushroom mixture over the roast in the slow cooker.

Return the pot to heat. Add 2 cups beef broth, 2 tsp worcestershire sauce, 1 Tbsp minced fresh thyme, and 1 Tbsp minced fresh rosemary. Scrape up any browned bits from the bottom of the pot, then remove from heat.

Layer 2 1/2 lbs small Yukon gold potatoes, 2 cups baby carrots, and 2 cups celery cut into 1-inch pieces over and around the roast. Pour the broth mixture over the top and season lightly with additional salt and pepper.

Cover and cook on low for 8 to 9 hours, until the roast and vegetables are tender.

Remove the roast and vegetables. Shred the roast and discard excess fat.

Optional gravy: Strain the broth into a saucepan. Heat over medium-high. Whisk the 2 1/2 Tbsp cornstarch with 3 Tbsp beef broth, then stir into the simmering broth. Simmer for 30 to 60 seconds until thickened.

Serve the roast and vegetables topped with gravy and sprinkled with 2 Tbsp fresh chopped parsley.`,
},

{
  id: "big-crockpot-potato-soup",
  slug: "big-crockpot-potato-soup",
  name: "Crock Pot Potato Soup",
  effort: "big",
  photoUrl: "/images/big-crockpot-potato-soup.jpg",
  tags: ["dinner", "soup", "comfort", "slow-cooker", "potatoes", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Creamy, hearty potato soup made easy in the slow cooker. Mashing some of the potatoes creates a thicker, more comforting texture without extra effort.",
  ingredients: `1 (30 oz) bag frozen diced hash brown potatoes
1 (32 oz) chicken broth
1 (10.75 oz) can cream of chicken soup
1/2 cup yellow onion, finely chopped
2 cloves garlic, minced
1/2 tsp pepper
1/2 tsp salt (plus more to taste)
1 tsp dried parsley (optional)
1/2 tsp smoked paprika (optional, for depth)
1 (8 oz) cream cheese, softened and cubed
1/2 cup sour cream (optional, for extra creaminess)

Toppings (optional):
green onions, sliced
cheddar cheese, shredded
bacon bits`,
  instructions: `Add 1 bag frozen diced hash brown potatoes, 1 carton chicken broth, 1 can cream of chicken soup, 1/2 cup finely chopped yellow onion, 2 minced garlic cloves, 1/2 tsp pepper, 1/2 tsp salt, 1 tsp dried parsley, and 1/2 tsp smoked paprika if using to a slow cooker. Stir to combine.

Cover and cook on low for 5 to 6 hours or on high for 3 to 4 hours, until the potatoes are tender and the flavors are well blended.

Use a potato masher to lightly mash some of the potatoes directly in the slow cooker to thicken the soup while still leaving some chunks for texture.

Add 8 oz softened and cubed cream cheese and stir until fully melted and smooth.

Stir in 1/2 cup sour cream if using, and cook for an additional 20 to 30 minutes on low until creamy and heated through.

Taste and adjust seasoning as needed.

Serve hot and top with shredded cheddar cheese, bacon bits, and sliced green onions if desired.`,
},

{
  id: "quick-blueberry-cheesecake-crescent-rolls",
  slug: "quick-blueberry-cheesecake-crescent-rolls",
  name: "Blueberry Cheesecake Crescent Rolls",
  photoUrl: "/images/quick-blueberry-cheesecake-crescent-rolls.jpg",
  effort: "quick",
  tags: ["dessert", "quick", "sweet", "bake", "blueberry", "easy"],
  notes: "Simple dessert that feels fancy. Great for breakfast treats too.",
  ingredients: `3 oz cream cheese, softened
1/2 tsp vanilla extract
2 1/2 Tbsp powdered sugar
1 tube crescent roll dough
2/3 cup fresh blueberries`,
  instructions: `Preheat oven to 375°F.

In a bowl, mix 3 oz softened cream cheese, 1/2 tsp vanilla extract, and 2 1/2 Tbsp powdered sugar until smooth.

Separate 1 tube of crescent dough into triangles.

Spread the cream cheese mixture on the bottom third of each triangle and top with 2/3 cup fresh blueberries distributed evenly among triangles.

Roll from the wide end to the tip.

Place on a baking sheet and bake for 10 minutes or until golden brown.`,
},

{
  id: "big-crispy-chicken-wings",
  slug: "big-crispy-chicken-wings",
  name: "Crispy Chicken Wings",
  effort: "big",
  photoUrl: "/images/big-crispy-chicken-wings.jpg",
  tags: ["dinner", "chicken", "wings", "fried", "game-day", "crispy", "comfort", "crowd-pleaser"],
  isVegetarian: false,
  notes: "Ultra crispy, restaurant-style wings made at home. Drying the wings thoroughly and frying at the correct temperature are the keys to achieving that perfect crunch.",
  ingredients: `2 to 3 lbs chicken wings (flats and drums, separated)
vegetable oil (for frying)
1 Tbsp beef tallow (optional, for extra flavor)
1/2 cup cornstarch
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder
1/2 tsp paprika (optional)

Buffalo Sauce:
1/2 cup Frank’s RedHot
1/3 cup unsalted butter, melted

Optional for serving:
celery sticks
carrot sticks
ranch or blue cheese dressing`,
  instructions: `If using whole wings, separate 2 to 3 lbs of chicken wings into flats and drums and remove wing tips.

Pat the wings completely dry with paper towels. For best results, place wings on a rack and refrigerate uncovered for several hours or overnight to dry out the skin.

In a large bowl, toss the wings with 1/2 cup cornstarch, 1 tsp salt, 1/2 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp paprika until evenly coated.

Heat vegetable oil and 1 Tbsp beef tallow if using in a deep pot or fryer to 375°F.

Fry wings in batches for 10 to 12 minutes, until golden brown, crispy, and the internal temperature reaches at least 165°F. Do not overcrowd the pot.

Remove wings to a wire rack, not paper towels, to keep them crispy.

In a separate bowl, whisk together 1/2 cup Frank’s RedHot and 1/3 cup melted unsalted butter.

Toss the wings in the sauce until evenly coated, or serve sauce on the side for dipping.

Serve immediately with celery sticks, carrot sticks, and ranch or blue cheese dressing if desired.`,
},

{
  id: "normal-grilled-bbq-chicken-thighs",
  slug: "normal-grilled-bbq-chicken-thighs",
  name: "Grilled BBQ Chicken Thighs",
  effort: "normal",
  photoUrl: "/images/normal-grilled-bbq-chicken-thighs.jpg",
  tags: ["dinner", "chicken", "grilling", "bbq", "summer", "juicy", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Juicy, smoky grilled chicken thighs with a sticky BBQ glaze. Cooking over indirect heat prevents burning while keeping the inside tender and flavorful.",
  ingredients: `6 bone-in, skin-on chicken thighs
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder
1/2 tsp paprika (or smoked paprika for extra flavor)
1 cup BBQ sauce (plus extra for serving)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F. Set up for indirect heat if possible.

Pat 6 bone-in, skin-on chicken thighs dry with paper towels. Rub with 1 Tbsp olive oil, then season evenly with 1 tsp salt, 1/2 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp paprika.

Place chicken skin-side down over direct heat. Grill for 5 to 7 minutes, until the skin is crispy and has nice grill marks.

Flip and move to indirect heat. Close the lid and cook for 15 to 20 minutes, turning occasionally, until the internal temperature reaches about 155°F to 160°F.

Brush 1 cup BBQ sauce on both sides of the chicken and return briefly to direct heat. Grill for 2 to 3 minutes, turning once, until the sauce is caramelized and slightly charred.

Remove from grill when internal temperature reaches 165°F.

Let rest for 5 minutes before serving.`,
},

{
  id: "quick-grilled-steak",
  slug: "quick-grilled-steak",
  name: "Grilled Steak",
  effort: "quick",
  photoUrl: "/images/quick-grilled-steak.jpg",
  tags: ["dinner", "beef", "grilling", "classic", "quick", "high-protein", "low-carb"],
  isVegetarian: false,
  notes: "Simple, classic grilled steak with a flavorful crust and juicy center. Letting the steak rest before slicing is key to keeping it tender and juicy.",
  ingredients: `2 ribeye or sirloin steaks (about 1 to 1 1/2 inches thick)
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder (optional)
1 Tbsp butter (optional, for finishing)`,
  instructions: `Preheat grill to high heat, about 450°F to 500°F.

Pat 2 ribeye or sirloin steaks completely dry with paper towels. Rub with 1 Tbsp olive oil and season generously with 1 tsp salt, 1/2 tsp pepper, and 1/2 tsp garlic powder if using.

Place steaks on the hot grill and cook undisturbed for 4 to 5 minutes, until a deep golden-brown crust forms.

Flip and cook another 3 to 5 minutes, depending on thickness and desired doneness.

For more even cooking, move steaks to a slightly cooler part of the grill and close the lid if needed.

Remove from grill when internal temperature reaches about 130°F for medium-rare. It will rise as it rests.

Top with a small pat of butter if desired and let rest for 5 to 10 minutes before slicing.

Slice against the grain and serve.`,
},

{
  id: "quick-grilled-chicken-breasts",
  slug: "quick-grilled-chicken-breasts",
  name: "Grilled Chicken Breasts",
  effort: "quick",
  photoUrl: "/images/quick-grilled-chicken-breasts.jpg",
  tags: ["dinner", "chicken", "grilling", "healthy", "high-protein", "meal-prep", "quick", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Juicy, versatile grilled chicken breasts that pair with almost anything. Pounding to even thickness and not overcooking are key to keeping them tender.",
  ingredients: `4 boneless, skinless chicken breasts
2 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1 tsp garlic powder
1/2 tsp paprika (optional, for color and flavor)
1 Tbsp lemon juice (optional, for brightness)`,
  instructions: `Preheat grill to medium-high heat, about 400°F to 425°F.

If 4 boneless, skinless chicken breasts are thick, pound them to an even thickness for more even cooking.

Pat chicken dry with paper towels. Brush with 2 Tbsp olive oil, then season evenly with 1 tsp salt, 1/2 tsp pepper, 1 tsp garlic powder, and 1/2 tsp paprika if using.

Place chicken on the grill and cook for 5 to 6 minutes without moving, until grill marks form and the chicken releases easily.

Flip and cook another 5 to 7 minutes, or until internal temperature reaches 160°F to 165°F.

If needed, move to a slightly cooler part of the grill and close the lid to finish cooking without burning.

Remove from grill and drizzle with 1 Tbsp lemon juice if using.

Let rest for 5 minutes before slicing to keep juices locked in.`,
},

{
  id: "quick-grilled-shrimp-skewers",
  slug: "quick-grilled-shrimp-skewers",
  name: "Grilled Shrimp Skewers",
  effort: "quick",
  photoUrl: "/images/quick-grilled-shrimp-skewers.jpg",
  tags: ["dinner", "seafood", "shellfish", "shrimp", "grilling", "quick", "healthy", "high-protein", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Quick and flavorful grilled shrimp with bright lemon and garlic. Watch closely while cooking—shrimp cook fast and can become rubbery if overdone.",
  ingredients: `1 lb large shrimp, peeled and deveined (tails on or off)
2 Tbsp olive oil
2 cloves garlic, minced
juice of 1 lemon
1 tsp lemon zest (optional, for extra brightness)
1/2 tsp salt
1/2 tsp pepper
1/2 tsp paprika (optional, for color and mild flavor)
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Preheat grill to medium-high heat, about 400°F to 425°F.

If using wooden skewers, soak them in water for at least 20 minutes to prevent burning.

Pat 1 lb large shrimp dry with paper towels. Thread onto skewers, keeping them close together but not overcrowded.

In a small bowl, whisk together 2 Tbsp olive oil, 2 minced cloves garlic, the juice of 1 lemon, 1 tsp lemon zest if using, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp paprika.

Brush the mixture evenly over the shrimp.

Place skewers on the grill and cook for 2 to 3 minutes per side, until the shrimp turn pink, opaque, and slightly firm.

Avoid overcooking—shrimp should form a loose “C” shape, not a tight “O”.

Remove from grill and sprinkle with 1 Tbsp fresh chopped parsley if desired. Serve immediately.`,
},

{
  id: "quick-grilled-sausage-peppers",
  slug: "quick-grilled-sausage-peppers",
  name: "Grilled Sausage and Peppers",
  effort: "quick",
  photoUrl: "/images/quick-grilled-sausage-peppers.jpg",
  tags: ["dinner", "sausage", "grilling", "quick", "summer", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "A quick, flavorful grilling classic with smoky sausage and tender peppers. Adding a splash of balsamic at the end brings a subtle sweetness that elevates the dish.",
  ingredients: `1 (12 to 14 oz) package smoked sausage or Italian sausage
2 bell peppers (any color), sliced
1 large yellow onion, sliced
1 Tbsp olive oil
1/2 tsp salt
1/2 tsp pepper
1/2 tsp Italian seasoning (optional)
1/2 tsp garlic powder
1 Tbsp balsamic vinegar (optional, for finishing)
hoagie rolls or buns (optional, for serving)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F.

Toss 2 sliced bell peppers and 1 large sliced yellow onion with 1 Tbsp olive oil, 1/2 tsp salt, 1/2 tsp pepper, 1/2 tsp Italian seasoning, and 1/2 tsp garlic powder.

Place the sausage directly on the grill and cook for 10 to 12 minutes, turning occasionally, until heated through and lightly charred.

Meanwhile, place the seasoned vegetables in a grill basket or foil pan. Grill for 8 to 10 minutes, stirring occasionally, until tender and slightly charred at the edges.

For extra flavor, drizzle the vegetables with 1 Tbsp balsamic vinegar during the last minute of cooking.

Remove everything from the grill and let rest for a few minutes.

Serve the sausage with the peppers and onions, either on a plate or in toasted hoagie rolls.`,
},

{
  id: "normal-grilled-pork-chops",
  slug: "normal-grilled-pork-chops",
  name: "Grilled Pork Chops",
  effort: "normal",
  photoUrl: "/images/normal-grilled-pork-chops.jpg",
  tags: ["dinner", "pork", "grilling", "juicy", "high-protein", "summer", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Juicy grilled pork chops with a flavorful crust. Avoid overcooking—pulling at 140°F to 145°F and resting ensures tender, not dry, pork.",
  ingredients: `4 bone-in pork chops (about 1 inch thick)
2 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1 tsp paprika (or smoked paprika for extra depth)
1/2 tsp garlic powder
1/2 tsp onion powder
1 Tbsp brown sugar (optional, for light caramelization)`,
  instructions: `Preheat grill to medium-high heat, about 400°F to 425°F. Set up a two-zone fire if possible.

Pat 4 bone-in pork chops dry with paper towels. Rub with 2 Tbsp olive oil, then season evenly with 1 tsp salt, 1/2 tsp pepper, 1 tsp paprika, 1/2 tsp garlic powder, 1/2 tsp onion powder, and 1 Tbsp brown sugar if using.

Place pork chops over direct heat and grill for 3 to 4 minutes without moving, until grill marks form.

Flip and cook another 3 to 4 minutes.

Move pork chops to indirect heat, close the lid, and cook for an additional 4 to 6 minutes, until internal temperature reaches 140°F to 145°F.

Remove from grill and let rest for 5 minutes. The temperature will rise slightly as it rests.

Serve warm.`,
},

{
  id: "quick-grilled-burgers",
  slug: "quick-grilled-burgers",
  name: "Grilled Burgers",
  effort: "quick",
  photoUrl: "/images/quick-grilled-burgers.jpg",
  tags: ["dinner", "beef", "grilling", "cookout", "quick", "summer", "family-friendly"],
  notes: "A classic backyard burger with juicy patties, melted cheese, and all your favorite toppings.",
  ingredients: `2 lbs ground beef (80/20)
1 1/2 tsp salt
1 tsp pepper
1/2 tsp garlic powder
1/2 Tbsp olive oil
4 to 6 hamburger buns
sliced cheddar cheese
lettuce
tomato, sliced
onion, sliced
pickles`,
  instructions: `Divide 2 lbs ground beef into equal portions, about 1/3 to 1/2 lb each.
Gently shape into patties about 1 inch thick.
Press a small dimple into the center of each patty to prevent puffing.

Preheat grill to medium-high heat.

Lightly brush patties with 1/2 Tbsp olive oil, then season generously with 1 1/2 tsp salt, 1 tsp pepper, and 1/2 tsp garlic powder just before grilling.

Place patties on the grill and close the lid.
Grill for 4 to 5 minutes on the first side until a nice char develops.

Flip once and do not press down on the patties.
Cook another 4 to 5 minutes, or until desired doneness.

During the last minute, add cheddar cheese slices and close the lid to melt.

Remove from grill and let rest for 2 to 3 minutes.

While burgers rest, toast 4 to 6 hamburger buns and sliced onions on the grill for 30 to 45 seconds.

Assemble burgers with lettuce, sliced tomato, and pickles, and serve with chips or potato wedges.`,
},

{
  id: "grilled-cheese-sandwich",
  slug: "grilled-cheese-sandwich",
  name: "Grilled Cheese Sandwich",
  effort: "quick",
  photoUrl: "/images/grilled-cheese-sandwich.jpg",
  tags: ["lunch", "sandwich", "quick", "comfort", "cheese", "kid-friendly"],
  notes: "Simple, classic, and always a winner. Even better with a bowl of warm tomato soup.",
  ingredients: `sourdough bread
butter
mild cheddar cheese slices`,
  instructions: `Spread 1/2 Tbsp butter on one side of each slice of sourdough bread.

Heat a non-stick pan over medium-low heat.

Place 2 slices of bread in the pan, buttered side down.

Stack mild cheddar cheese slices on one piece of bread, then top with the other piece of bread, buttered side facing up.

Cook, flipping once, until both sides are golden brown and the cheese is melted, about 6 minutes total.

Cut in half diagonally and serve.

Optional: Serve with warm tomato soup.`,
},

{
  id: "quick-chicken-parmesan-melts",
  slug: "quick-chicken-parmesan-melts",
  name: "Chicken Parmesan Melts",
  effort: "quick",
  photoUrl: "/images/quick-chicken-parmesan-melts.jpg",
  tags: ["dinner", "chicken", "quick", "italian", "sandwich", "cheesy", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Crispy chicken parmesan sandwiches with melty cheese and warm marinara. Toasting the bread first keeps the rolls from getting soggy and adds great texture.",
  ingredients: `4 cooked chicken cutlets or breaded chicken patties
1 cup marinara sauce (plus extra for dipping)
1 cup mozzarella cheese, shredded
1/4 cup Parmesan cheese, grated
4 sandwich rolls (hoagie or sub rolls)
1 Tbsp olive oil or butter
1/2 tsp garlic powder
1/2 tsp Italian seasoning
fresh basil or parsley (optional)`,
  instructions: `Preheat oven to 400°F or set broiler to high.

Slice 4 sandwich rolls and lightly brush the cut sides with 1 Tbsp olive oil or butter. Place on a baking sheet and toast for 3 to 4 minutes until lightly golden.

Heat 4 cooked chicken cutlets or breaded chicken patties according to package directions or warm leftover cutlets until hot and crispy.

Warm 1 cup marinara sauce in a small saucepan or microwave.

Place the chicken on the toasted rolls. Spoon the marinara over each piece, then top with 1 cup shredded mozzarella and a sprinkle of 1/4 cup grated Parmesan.

Sprinkle lightly with 1/2 tsp garlic powder and 1/2 tsp Italian seasoning.

Bake for 5 to 7 minutes, or broil for 2 to 3 minutes, until the cheese is melted, bubbly, and slightly golden.

Remove from the oven, garnish with fresh basil or parsley if desired, and serve immediately with extra marinara for dipping.`,
},

{
  id: "quick-taco-mac-skillet",
  slug: "quick-taco-mac-skillet",
  name: "Taco Mac Skillet",
  effort: "quick",
  photoUrl: "/images/quick-taco-mac-skillet.jpg",
  tags: ["dinner", "beef", "pasta", "quick", "tex-mex", "one-pan", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  notes: "A quick, cheesy taco-inspired pasta made in one pan. Adding cream cheese creates a smoother, richer sauce and helps everything come together perfectly.",
  ingredients: `1 lb ground beef
2 cups cooked macaroni (elbow pasta)
1 Tbsp olive oil
1/2 small yellow onion, diced
2 cloves garlic, minced
1 packet taco seasoning (or 2 Tbsp homemade taco seasoning)
1/2 cup water
1 cup salsa
1 cup cheddar cheese, shredded
1/2 cup Monterey Jack cheese (optional, for extra melt)
1/4 cup cream cheese (optional, for extra creaminess)
1/2 tsp pepper

Optional toppings:
sour cream
green onions, sliced
jalapeños`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1/2 diced small yellow onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook until browned, breaking it apart as it cooks. Drain excess grease if needed.

Stir in 1 packet taco seasoning or 2 Tbsp homemade seasoning and cook for 1 minute to toast the spices.

Add 1/2 cup water and 1 cup salsa, stirring to combine. Bring to a simmer and cook for 3 to 5 minutes until slightly thickened.

Reduce heat to low. Stir in 1/4 cup cream cheese if using until melted and smooth.

Add 2 cups cooked macaroni and toss until evenly coated.

Stir in 1 cup shredded cheddar and 1/2 cup Monterey Jack if using until melted and creamy.

Season with 1/2 tsp pepper, or more to taste. Remove from heat.

Serve immediately with optional toppings like sour cream, sliced green onions, or jalapeños if desired.`,
},

{
  id: "quick-lemon-pepper-tilapia",
  slug: "quick-lemon-pepper-tilapia",
  name: "Lemon Pepper Tilapia",
  effort: "quick",
  photoUrl: "/images/quick-lemon-pepper-tilapia.jpg",
  tags: ["dinner", "seafood", "fish", "tilapia", "quick", "light", "healthy", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Light, quick tilapia with bright lemon flavor and simple seasoning. Patting the fish dry and not overcooking are key to a tender, flaky result.",
  ingredients: `4 tilapia fillets
1 Tbsp olive oil
1 tsp lemon pepper seasoning
1/2 tsp garlic powder
1/2 tsp paprika (optional, for color)
1/2 tsp salt (adjust based on seasoning)
1 Tbsp fresh lemon juice
1 lemon, sliced
1 Tbsp butter (optional, for finishing)
1 Tbsp fresh parsley, chopped (optional)`,
  instructions: `Pat 4 tilapia fillets dry with paper towels to help achieve a light sear.

Season both sides with 1 tsp lemon pepper seasoning, 1/2 tsp garlic powder, 1/2 tsp paprika if using, and 1/2 tsp salt.

Heat 1 Tbsp olive oil in a large skillet over medium heat.

Once the oil is hot, add the tilapia and cook for 3 to 4 minutes without moving, until the edges turn opaque and the bottom develops a light golden color.

Flip carefully and cook another 2 to 3 minutes, until the fish flakes easily with a fork.

Add 1 Tbsp butter and squeeze 1 Tbsp fresh lemon juice into the pan. Spoon the lemon butter over the fish for about 30 seconds.

Remove from heat and garnish with sliced lemon and fresh parsley if desired. Serve immediately.`,
},

{
  id: "quick-bbq-chicken",
  slug: "quick-bbq-chicken",
  name: "Oven BBQ Chicken",
  effort: "quick",
  photoUrl: "/images/quick-bbq-chicken.jpg",
  tags: ["dinner", "chicken", "quick", "bbq", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Juicy oven-baked BBQ chicken with a sticky, caramelized finish. Adding the sauce near the end prevents burning while keeping the chicken tender and flavorful.",
  ingredients: `4 boneless, skinless chicken breasts
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1/2 tsp garlic powder
1/2 tsp paprika (or smoked paprika for extra flavor)
1/2 cup BBQ sauce (plus extra for serving)`,
  instructions: `Preheat oven to 425°F. Line a baking sheet with foil or parchment paper.

If 4 boneless, skinless chicken breasts are thick, pound them to an even thickness for more even cooking.

Pat chicken dry with paper towels. Drizzle with 1 Tbsp olive oil and season evenly with 1 tsp salt, 1/2 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp paprika.

Place chicken on the prepared baking sheet and bake for 15 minutes.

Remove from the oven and brush 1/2 cup BBQ sauce evenly over the top of each piece.

Return to the oven and bake for another 5 to 8 minutes, until the internal temperature reaches 160°F.

For extra caramelization, broil on high for 1 to 2 minutes, watching closely to prevent burning.

Remove from oven and let rest for 5 minutes. The temperature will rise to 165°F as it rests.

Serve warm with additional BBQ sauce if desired.`,
},

{
  id: "normal-simple-tacos",
  slug: "normal-simple-tacos",
  name: "Simple Tacos",
  effort: "normal",
  photoUrl: "/images/normal-simple-tacos.jpg",
  tags: ["dinner", "beef", "tacos", "tex-mex", "family-friendly", "build-your-own", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Classic, easy taco night with seasoned ground beef and fresh toppings. Letting the meat simmer with seasoning helps build deeper flavor and prevents it from being dry.",
  ingredients: `1 lb ground beef
2/3 cup water
1/2 small white onion, diced
4 roma tomatoes, diced
1 cup cheddar cheese, shredded
2 cups lettuce, chopped
8 to 10 taco shells (hard or soft)

Optional toppings:
sour cream
hot sauce

Taco Seasoning:
1/2 Tbsp chili powder
1 tsp cumin
1 tsp salt
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp paprika
1/8 tsp dried oregano
1/4 tsp pepper
1/8 tsp crushed red pepper or jalapeño flakes`,
  instructions: `Preheat oven to 350°F if using hard taco shells.

In a small bowl, mix all taco seasoning ingredients until well combined. Set aside.

Heat a large skillet over medium heat. Add 1 lb ground beef and cook for 5 to 7 minutes, breaking it apart as it cooks, until no longer pink. Drain excess grease if needed.

Add 2/3 cup water and the prepared taco seasoning to the skillet. Stir well and bring to a simmer.

Cook for 3 to 5 minutes, stirring occasionally, until the sauce thickens and coats the meat.

Warm 8 to 10 taco shells according to package directions.

Set out the diced onion, diced roma tomatoes, shredded cheddar cheese, chopped lettuce, and any optional toppings to create a taco bar.

Fill shells with seasoned beef and desired toppings. Serve immediately.`,
},

{
  id: "quick-sloppy-joes-sandwich",
  slug: "quick-sloppy-joes-sandwich",
  name: "Sloppy Joes Sandwich",
  effort: "quick",
  photoUrl: "/images/quick-sloppy-joes-sandwich.jpg",
  tags: ["dinner", "beef", "sandwich", "quick", "family-friendly", "comfort", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Classic sloppy joes with a rich, slightly sweet and tangy sauce. Simmering the sauce helps deepen the flavor and gives it that signature thick, saucy texture.",
  ingredients: `1 lb ground beef
1 Tbsp olive oil
1/2 small yellow onion, finely diced
2 cloves garlic, minced
8 oz tomato sauce
1/2 cup ketchup
2 Tbsp brown sugar
2 Tbsp worcestershire sauce
1 tsp yellow mustard
1/2 tsp garlic powder
1/4 tsp onion powder
1/4 tsp pepper
1/2 tsp salt (adjust to taste)

For serving:
hamburger buns
sliced pickles`,
  instructions: `Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1/2 small finely diced yellow onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook over medium to medium-high heat for 5 to 7 minutes, breaking it apart as it cooks, until browned with no pink remaining. Drain excess grease if needed.

In a small bowl, whisk together 8 oz tomato sauce, 1/2 cup ketchup, 2 Tbsp brown sugar, 2 Tbsp worcestershire sauce, 1 tsp yellow mustard, 1/2 tsp garlic powder, 1/4 tsp onion powder, 1/2 tsp salt, and 1/4 tsp pepper.

Pour the sauce into the skillet with the beef and stir to combine.

Reduce heat to low and simmer for 10 to 15 minutes, stirring occasionally, until the sauce thickens and becomes rich and slightly glossy.

Lightly toast the hamburger buns if desired.

Spoon the sloppy joe mixture onto the buns and top with sliced pickles. Serve warm.`,
},

{
  id: "big-beef-lasagna",
  slug: "big-beef-lasagna",
  name: "Classic Lasagna",
  photoUrl: "/images/big-beef-lasagna.jpg",
  effort: "big",
  tags: ["dinner", "pasta", "beef", "bake", "italian", "comfort", "crowd-pleaser", "leftovers-friendly"],
  notes: "A crowd-pleasing layered pasta bake with beef, sausage, ricotta, and plenty of cheese.",
  ingredients: `12 lasagna noodles, uncooked
2 1/2 cups shredded mozzarella cheese
1/4 cup shredded Parmesan cheese
1/2 lb lean ground beef
1/2 lb Italian sausage
1 yellow onion, diced
2 cloves garlic, minced
36 oz pasta sauce
2 Tbsp tomato paste
1 tsp Italian seasoning
1/2 tsp salt, plus more to taste
2 cups ricotta cheese or cottage cheese
1/4 cup chopped fresh parsley
1 large egg, beaten
1 1/2 cups shredded mozzarella cheese
1/4 cup shredded Parmesan cheese
1/4 tsp salt
1/4 tsp pepper`,
  instructions: `Preheat the oven to 350°F.

Bring a large pot of salted water to a boil. Add 12 uncooked lasagna noodles and cook until al dente. Drain, rinse under cold water, and set aside.

In a large skillet, brown 1/2 lb lean ground beef, 1/2 lb Italian sausage, 1 diced yellow onion, and 2 minced garlic cloves over medium-high heat until no pink remains. Drain any fat.

Stir in 36 oz pasta sauce, 2 Tbsp tomato paste, 1 tsp Italian seasoning, 1/2 tsp salt, and 1/4 tsp pepper. Simmer uncovered over medium heat for 5 minutes or until slightly thickened. Taste and season with additional salt if desired.

In a separate medium bowl, combine 1 1/2 cups shredded mozzarella cheese, 1/4 cup shredded Parmesan cheese, 2 cups ricotta cheese or cottage cheese, 1/4 cup chopped fresh parsley, 1 beaten large egg, and 1/4 tsp salt.

Spread 1 cup of the meat sauce in a 9x13 pan or casserole dish. Top with 3 lasagna noodles. Layer with 1 cup of the ricotta cheese mixture and 1 cup of meat sauce. Repeat twice more. Finish with 3 noodles topped with the remaining sauce.

Cover with foil and bake for 45 minutes.

Remove the foil and sprinkle the top of the lasagna with the remaining 2 1/2 cups shredded mozzarella cheese and 1/4 cup shredded Parmesan cheese.

Bake uncovered for an additional 15 minutes or until browned and bubbly. Broil for 2 to 3 minutes if desired.

Rest for at least 15 minutes before cutting.`,
},

  {
  id: "normal-chili-cheese-dogs",
  slug: "normal-chili-cheese-dogs",
  name: "Chili Cheese Dogs",
  effort: "normal",
  photoUrl: "/images/normal-chili-cheese-dogs.jpg",
  tags: ["dinner", "hot-dogs", "comfort", "family-friendly", "one-pan", "crowd-pleaser"],
  isVegetarian: false,
  notes: "Loaded chili cheese dogs with a rich, flavorful beef chili. Letting the chili simmer helps it thicken so it stays on the dog instead of running off.",
  ingredients: `8 hot dogs
8 hot dog buns
1 cup cheddar cheese, shredded
1/2 small white onion, finely diced (optional)

Quick Chili Topping:
1 lb ground beef
1 (8 oz) can tomato sauce
1/2 cup water
1 Tbsp chili powder
1 tsp cumin
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1 tsp worcestershire sauce (optional, for depth)`,
  instructions: `Heat a large skillet over medium heat. Add 1 lb ground beef and cook for 5 to 7 minutes, breaking it apart until browned. Drain excess grease if needed.

Add 8 oz tomato sauce, 1/2 cup water, 1 Tbsp chili powder, 1 tsp cumin, 1/2 tsp garlic powder, 1/2 tsp onion powder, 1/2 tsp salt, 1/4 tsp pepper, and 1 tsp worcestershire sauce if using. Stir well.

Bring to a simmer and cook for 10 to 15 minutes, stirring occasionally, until the chili thickens and becomes rich and scoopable.

Meanwhile, cook 8 hot dogs using your preferred method, grill, stovetop, or air fryer, until heated through and lightly browned.

Lightly toast 8 hot dog buns if desired.

Place hot dogs in the buns and top generously with the prepared chili, 1 cup shredded cheddar cheese, and 1/2 finely diced small onion if using.

Serve immediately while hot.`,
},

{
  id: "big-white-chicken-chili",
  slug: "big-white-chicken-chili",
  name: "White Chicken Chili",
  effort: "big",
  photoUrl: "/images/big-white-chicken-chili.jpg",
  tags: ["dinner", "chili", "chicken", "one-pot", "comfort", "creamy", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Creamy, cozy white chicken chili with bold flavor and a smooth texture. Mashing some of the beans and adding cream cheese creates a rich, hearty consistency without needing heavy cream.",
  ingredients: `2 cups cooked shredded chicken (rotisserie works great)
1 Tbsp olive oil
1 small yellow onion, chopped
2 cloves garlic, minced
2 (15 oz) cans white beans, drained and rinsed
1 (4 oz) can green chiles
4 cups chicken broth
4 oz cream cheese, softened and cubed
1/2 cup sour cream (optional, for extra creaminess)
1 Tbsp lime juice

White Chili Seasoning:
1 tsp cumin
1 tsp chili powder
1/2 tsp dried oregano
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1/4 tsp cayenne pepper (optional)

Optional toppings:
shredded cheese
cilantro
green onions
tortilla chips`,
  instructions: `Heat 1 Tbsp olive oil in a large pot or Dutch oven over medium heat. Add 1 chopped small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Stir in 2 cups cooked shredded chicken, 2 cans drained and rinsed white beans, 1 can green chiles, and 4 cups chicken broth.

In a small bowl, mix all White Chili Seasoning ingredients. Add to the pot and stir well.

Bring to a gentle simmer and cook for 20 to 25 minutes, allowing flavors to develop.

Use a spoon or potato masher to lightly mash some of the beans to naturally thicken the chili while leaving some whole for texture.

Reduce heat to low. Stir in 4 oz softened and cubed cream cheese until fully melted and smooth.

Stir in 1/2 cup sour cream if using, and add 1 Tbsp lime juice to brighten the flavor.

Taste and adjust seasoning as needed.

Serve hot with desired toppings like shredded cheese, cilantro, green onions, and tortilla chips.`,
},

{
  id: "normal-taco-soup",
  slug: "normal-taco-soup",
  name: "Taco Soup",
  effort: "normal",
  photoUrl: "/images/normal-taco-soup.jpg",
  tags: ["dinner", "soup", "tex-mex", "one-pot", "beef", "family-friendly", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Hearty taco-inspired soup with bold flavor and a rich broth. Letting it simmer helps everything come together, and it tastes even better the next day.",
  ingredients: `1 lb ground beef
1 Tbsp olive oil
1 small yellow onion, chopped
2 cloves garlic, minced
1 (15 oz) can corn, drained
1 (15 oz) can black beans, drained and rinsed
1 (14.5 oz) can diced tomatoes (with juices)
1 (10 oz) can Rotel
2 cups beef broth
1 Tbsp tomato paste (optional, for deeper flavor)

Taco Seasoning:
1 Tbsp chili powder
1 tsp cumin
1/2 tsp paprika (or smoked paprika for extra depth)
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper

Optional toppings:
shredded cheese
sour cream
tortilla chips
green onions`,
  instructions: `Heat 1 Tbsp olive oil in a large pot or Dutch oven over medium heat. Add 1 chopped small yellow onion and cook for 4 to 5 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 1 lb ground beef and cook for 5 to 7 minutes, breaking it apart as it cooks, until browned. Drain excess grease if needed.

Stir in the taco seasoning and cook for 1 minute to toast the spices.

Add 1 can drained corn, 1 can drained and rinsed black beans, 1 can diced tomatoes with juices, 1 can Rotel, 2 cups beef broth, and 1 Tbsp tomato paste if using. Stir well.

Bring to a simmer and cook for 20 to 25 minutes, stirring occasionally, until flavors are well combined.

Taste and adjust seasoning if needed.

Serve hot with desired toppings such as shredded cheese, sour cream, tortilla chips, and green onions.`,
},

{
  id: "big-sheet-pan-fajitas",
  slug: "big-sheet-pan-fajitas",
  name: "Sheet Pan Fajitas",
  effort: "big",
  photoUrl: "/images/big-sheet-pan-fajitas.jpg",
  tags: ["dinner", "chicken", "sheet-pan", "tex-mex", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Easy, colorful sheet pan fajitas with bold seasoning and roasted flavor. Spreading everything in a single layer and using high heat helps achieve those slightly charred, restaurant-style edges.",
  ingredients: `1 1/2 lbs chicken breast, sliced into strips
2 bell peppers (any color), sliced
1 large yellow onion, sliced
2 Tbsp olive oil
1 Tbsp lime juice

Fajita Seasoning:
1 Tbsp chili powder
1 tsp paprika (or smoked paprika for extra depth)
1 tsp cumin
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1/4 tsp cayenne pepper (optional)

For serving:
tortillas
sour cream
shredded cheese
guacamole (optional)`,
  instructions: `Preheat oven to 425°F. Line a large sheet pan with parchment paper or foil.

Spread 1 1/2 lbs sliced chicken breast, 2 sliced bell peppers, and 1 large sliced yellow onion evenly across the sheet pan in a single layer. Avoid overcrowding to ensure proper roasting.

In a small bowl, mix all fajita seasoning ingredients.

Drizzle 2 Tbsp olive oil and 1 Tbsp lime juice over the chicken and vegetables. Sprinkle the prepared seasoning evenly over everything.

Toss well to coat, then spread back out into a single layer.

Bake for 20 to 25 minutes, stirring once halfway through, until the chicken is cooked through and the vegetables are tender with slightly charred edges.

For extra char, broil on high for 2 to 3 minutes at the end, watching closely.

Remove from oven and serve immediately in warm tortillas with sour cream, shredded cheese, and guacamole if desired.`,
},

{
  id: "normal-air-fryer-chicken-tenders",
  slug: "normal-air-fryer-chicken-tenders",
  name: "Air Fryer Chicken Tenders",
  effort: "normal",
  photoUrl: "/images/normal-air-fryer-chicken-tenders.jpg",
  tags: ["dinner", "chicken", "air-fryer", "crispy", "family-friendly", "kid-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Crispy, golden chicken tenders made in the air fryer. Using panko breadcrumbs and spraying lightly with oil helps achieve that extra crunch without deep frying.",
  ingredients: `1 1/2 lbs chicken tenders
1/2 cup all-purpose flour
2 large eggs, beaten
1 cup breadcrumbs (panko preferred for extra crunch)

Chicken Seasoning:
1 tsp paprika (or smoked paprika for extra flavor)
1/2 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/4 tsp pepper

Cooking spray`,
  instructions: `Preheat air fryer to 400°F.

Pat 1 1/2 lbs chicken tenders dry with paper towels.

In three shallow bowls, set up a breading station: one with 1/2 cup all-purpose flour, one with 2 large beaten eggs, and one with 1 cup breadcrumbs mixed with the Chicken Seasoning.

Dredge each chicken tender in the flour, shaking off excess. Dip into the egg, then coat thoroughly in the seasoned breadcrumbs, pressing lightly so the coating sticks.

Place tenders in the air fryer basket in a single layer, leaving space between each piece. Spray lightly with cooking spray.

Cook for 10 to 12 minutes, flipping halfway through, until golden brown and the internal temperature reaches 165°F.

For extra crispiness, spray lightly again with cooking spray after flipping.

Serve hot with your favorite dipping sauces.`,
},

{
  id: "big-baked-chicken-thighs",
  slug: "big-baked-chicken-thighs",
  name: "Baked Chicken Thighs",
  effort: "big",
  photoUrl: "/images/big-baked-chicken-thighs.jpg",
  tags: ["dinner", "chicken", "bake", "crispy", "comfort", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Crispy, flavorful baked chicken thighs with juicy meat and golden skin. Patting the chicken dry and using high heat are key to achieving that perfect crisp.",
  ingredients: `6 bone-in, skin-on chicken thighs
1 Tbsp olive oil

Chicken Rub:
1 tsp smoked paprika
1 tsp garlic powder
1 tsp onion powder
1/2 tsp salt
1/2 tsp pepper
1/2 tsp dried thyme
1/2 tsp baking powder (optional, for extra crispy skin)`,
  instructions: `Preheat oven to 425°F. Line a baking sheet with foil and place a wire rack on top if available.

Pat 6 bone-in, skin-on chicken thighs very dry with paper towels. This is key for crispy skin.

Rub the chicken with 1 Tbsp olive oil.

In a small bowl, mix all Chicken Rub ingredients. Sprinkle evenly over the chicken, rubbing to coat all sides and under the skin where possible.

Place chicken thighs skin-side up on the rack or baking sheet, leaving space between each piece.

Bake for 35 to 40 minutes, until the skin is crispy and the internal temperature reaches 165°F.

For extra crispiness, broil on high for 2 to 3 minutes at the end, watching closely.

Remove from the oven and let rest for 5 minutes before serving.`,
},

{
  id: "big-bbq-chicken-drumsticks",
  slug: "big-bbq-chicken-drumsticks",
  name: "BBQ Chicken Drumsticks",
  effort: "big",
  photoUrl: "/images/big-bbq-chicken-drumsticks.jpg",
  tags: ["dinner", "chicken", "bbq", "bake", "comfort", "family-friendly", "one-pan", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Sticky, flavorful BBQ drumsticks with a seasoned crust and caramelized sauce. Drying the chicken and baking at higher heat helps achieve crispy skin before adding the sauce.",
  ingredients: `8 chicken drumsticks
1 Tbsp olive oil
1/2 cup barbecue sauce (plus extra for serving)

BBQ Rub:
1 tsp smoked paprika
1 tsp garlic powder
1/2 tsp onion powder
1/2 tsp salt
1/2 tsp pepper
1/2 tsp brown sugar
1/2 tsp baking powder (optional, for crispier skin)`,
  instructions: `Preheat oven to 425°F. Line a baking sheet with foil and place a wire rack on top if available.

Pat 8 chicken drumsticks very dry with paper towels. This helps the skin crisp up.

Rub the drumsticks with 1 Tbsp olive oil.

In a small bowl, mix all BBQ Rub ingredients. Sprinkle evenly over the drumsticks, coating all sides.

Place drumsticks on the rack or baking sheet with space between each piece.

Bake for 30 to 35 minutes, until the skin is crispy and the internal temperature reaches about 155°F to 160°F.

Remove from the oven and brush generously with 1/2 cup barbecue sauce.

Return to the oven and bake for another 10 to 15 minutes, until the sauce is sticky, caramelized, and the internal temperature reaches 165°F.

For extra caramelization, broil on high for 2 to 3 minutes at the end, watching closely.

Let rest for 5 minutes before serving with extra barbecue sauce if desired.`,
},

{
  id: "smoked-pulled-pork",
  slug: "smoked-pulled-pork",
  name: "Smoked Pulled Pork",
  ingredients: `8 lb pork shoulder
1/4 cup yellow mustard
1/4 cup Kinder's Woodfire Garlic seasoning (or similar BBQ rub)
1 cup barbecue sauce (plus extra for serving)`,
  instructions: `Remove the 8 lb pork shoulder from packaging and pat it completely dry with paper towels.

Rub the pork shoulder all over with 1/4 cup yellow mustard as a binder.

Season generously on all sides with 1/4 cup Kinder's Woodfire Garlic, pressing it into the meat.

Preheat smoker to 250°F and add pellets.

Place the pork shoulder directly on the smoker grates and cook for about 7 hours, or until the internal temperature reaches 200°F.

Remove from smoker, wrap tightly in aluminum foil, and let rest for 1 hour.

Unwrap and shred the pork using your hands or forks.

Toss the shredded pork with 1 cup barbecue sauce until well coated.

Serve warm or use in recipes like Pork Street Tacos.`,
  photoUrl: "/images/smoked-pulled-pork.jpg",
  effort: "big",
  tags: ["dinner", "pork", "smoker", "bbq", "meal-prep", "protein", "base-recipe"],
  isVegetarian: false,
  notes: "Tender, smoky pulled pork that works as a base for multiple meals like tacos, sandwiches, and bowls."
},

{
  id: "big-smoked-mac-and-cheese",
  slug: "big-smoked-mac-and-cheese",
  name: "Smoked Mac and Cheese",
  ingredients: `2 cups uncooked macaroni noodles
1 cup milk, divided
1 cup shredded cheddar cheese, divided
4 oz cream cheese, cubed
12 oz Velveeta cheese, cubed
1/2 tsp salt
1/2 tsp black pepper
1/4 tsp garlic powder
1/8 tsp ground cumin`,
  instructions: `Bring a pot of water to a boil and cook 2 cups macaroni noodles according to package directions. Drain and place in a large bowl.

Add 1/2 tsp salt, 1/2 tsp black pepper, 1/4 tsp garlic powder, and 1/8 tsp cumin to the noodles. Stir to combine.

Mix in 3/4 cup shredded cheddar cheese, 4 oz cubed cream cheese, and 12 oz cubed Velveeta.

Transfer everything to a baking dish and pour 1/2 cup milk over the top.

Preheat smoker or grill to 250°F.

Place the dish in the smoker and cook for 15 minutes.

Stir the mac and cheese, then continue cooking another 15 minutes. Stir again.

Pour in the remaining 1/2 cup milk and sprinkle the remaining 1/4 cup cheddar cheese over the top.

Increase temperature to 400°F and cook for 5 to 10 minutes until melted, bubbly, and lightly browned.

Remove and let rest for a few minutes before serving.`,
  photoUrl: "/images/big-smoked-mac-and-cheese.jpg",
  effort: "big",
  tags: ["side", "bbq", "smoker", "comfort", "cheesy", "family", "cookout"],
  isVegetarian: true,
  notes: "Ultra-creamy smoked mac and cheese made without a traditional sauce. The cheese melts directly into the noodles while smoking, creating rich flavor with minimal effort."
},

{
  id: "big-smoked-meatloaf",
  slug: "big-smoked-meatloaf",
  name: "Smoked Meatloaf",
  ingredients: `1/2 cup breadcrumbs
1/3 cup milk
1 lb ground beef
1 lb ground pork
1/2 cup Parmesan cheese, grated
1/2 cup white onion, minced
1 Tbsp dried parsley
4 cloves garlic, minced
2 Tbsp ketchup
1 Tbsp Worcestershire sauce
2 tsp salt
1 tsp pepper
1/2 tsp red pepper flakes
2 Tbsp BBQ rub (your favorite)
1 cup BBQ sauce (plus extra for serving)`,
  instructions: `In a large bowl, combine 1/2 cup breadcrumbs and 1/3 cup milk. Let soak for 5 minutes to form a panade.

Add 1 lb ground beef, 1 lb ground pork, 1/2 cup grated Parmesan, 1/2 cup minced onion, 1 Tbsp dried parsley, 4 cloves minced garlic, 2 Tbsp ketchup, 1 Tbsp Worcestershire sauce, 2 tsp salt, 1 tsp pepper, and 1/2 tsp red pepper flakes. Mix gently by hand until just combined. Do not overmix.

Shape the mixture into a loaf using a loaf pan, then refrigerate for 30 minutes to help it hold its shape.

Preheat smoker to 250°F.

Remove meatloaf from pan and place directly on a smoker rack or basket. Season all sides evenly with about 2 Tbsp BBQ rub.

Smoke for 90 minutes.

Brush 1 cup BBQ sauce generously over the meatloaf and continue smoking for another 30 minutes, until the internal temperature reaches 160°F.

Remove from smoker and let rest for 10 minutes before slicing.

Serve warm with extra BBQ sauce if desired.`,
  photoUrl: "/images/big-smoked-meatloaf.jpg",
  effort: "big",
  tags: ["dinner", "beef", "pork", "smoker", "bbq", "comfort", "family", "leftovers-friendly"],
  isVegetarian: false,
  notes: "Smoky, juicy meatloaf with a rich BBQ glaze. Including measurements in each step makes it easier to follow in Cook Mode without jumping back and forth."
},

{
  id: "pork-street-tacos",
  slug: "pork-street-tacos",
  name: "Pork Street Tacos",
  ingredients: `Pulled pork (see "Smoked Pulled Pork" recipe)
8 small corn or flour tortillas
1/2 cup white onion, finely chopped
1/2 cup fresh cilantro, chopped
2 avocados, sliced
2 fresh jalapeños, sliced
lime wedges (optional)`,
  instructions: `Warm 8 tortillas in a skillet over medium heat or directly over a flame until soft and slightly charred.

Fill each tortilla with a generous portion of prepared pulled pork (see Smoked Pulled Pork recipe).

Top with chopped white onion, fresh cilantro, sliced avocado, and jalapeños.

Squeeze fresh lime juice over the tacos if desired.

Serve immediately.`,
  photoUrl: "/images/pork-street-tacos.jpg",
  effort: "normal",
  tags: ["dinner", "tacos", "pork", "mexican", "assembly", "family", "street-food"],
  isVegetarian: false,
  notes: "Simple street-style tacos built around flavorful smoked pulled pork. Use the Smoked Pulled Pork recipe for the base protein."
},

{
  id: "roasted-tomato-basil-soup",
  slug: "roasted-tomato-basil-soup",
  name: "Roasted Tomato Basil Soup",
  ingredients: `3 lbs tomatoes, halved
1 sweet onion, cut into thick wedges
3 Tbsp olive oil
1 tsp salt
1/2 tsp black pepper
1 Tbsp butter
1 Tbsp garlic, minced
2 1/2 cups chicken broth
1/2 cup fresh basil leaves, chopped
1 sprig fresh thyme
1/4 cup heavy cream`,
  instructions: `Preheat oven to 425°F. Line a large baking sheet with parchment paper.

Arrange 3 lbs halved tomatoes (cut-side up) and 1 sliced sweet onion on the baking sheet.

Drizzle with 3 Tbsp olive oil and sprinkle with 1 tsp salt and 1/2 tsp black pepper.

Roast for 40 to 45 minutes, until the tomatoes are softened and beginning to caramelize.

In a large pot, melt 1 Tbsp butter over medium heat. Add 1 Tbsp minced garlic and cook for 30 seconds until fragrant.

Carefully transfer the roasted tomatoes and onion, along with their juices, into the pot.

Add 2 1/2 cups chicken broth and 1/2 cup chopped fresh basil. Stir well.

Use an immersion blender (or carefully transfer to a blender) and blend until smooth.

Add 1 sprig fresh thyme and 1/4 cup heavy cream. Stir to combine.

Simmer over low heat for at least 30 minutes, stirring occasionally, until flavors deepen.

Remove the thyme sprig. Taste and adjust seasoning with additional salt and pepper if needed.

Serve warm.`,
  photoUrl: "/images/roasted-tomato-basil-soup.jpg",
  effort: "normal",
  tags: ["dinner", "soup", "comfort", "vegetarian", "roasted", "cozy"],
  isVegetarian: false,
  notes: "Roasting the tomatoes and onion brings out natural sweetness and depth of flavor. Pairs perfectly with a grilled cheese sandwich."
},

{
  id: "slow-cooker-beef-stew",
  slug: "slow-cooker-beef-stew",
  name: "Slow Cooker Beef Stew",
  ingredients: `2 lbs beef stew meat
2 Tbsp olive oil
1 yellow onion, chopped
1 lb baby potatoes, cubed
1/2 lb carrots, diced
4 cups beef broth
3 tsp garlic, minced
2 Tbsp tomato paste
2 Tbsp Worcestershire sauce
1 tsp dried thyme
1 bay leaf
3 Tbsp cornstarch
3 Tbsp water
1 1/2 cups frozen peas
2 Tbsp fresh parsley, chopped
salt and black pepper, to taste`,
  instructions: `Heat 2 Tbsp olive oil in a skillet over medium heat.

Season 2 lbs beef stew meat with salt and black pepper. Add to the skillet and sear for about 3 minutes, turning to brown all sides.

Transfer the seared beef to a slow cooker along with 1 chopped onion, 1 lb cubed baby potatoes, and 1/2 lb diced carrots.

In a bowl, whisk together 4 cups beef broth, 3 tsp minced garlic, 2 Tbsp tomato paste, 2 Tbsp Worcestershire sauce, and 1 tsp thyme.

Pour the broth mixture over the beef and vegetables. Add 1 bay leaf.

Cover and cook on low for 6 to 7 hours or on high for 3 to 4 hours, until the beef is tender.

About 20 minutes before serving, remove the bay leaf.

In a small bowl, mix 3 Tbsp cornstarch with 3 Tbsp water to create a slurry. Stir into the stew.

Add 1 1/2 cups frozen peas and cover again. Cook until the stew thickens and peas are heated through.

Stir in 2 Tbsp chopped fresh parsley. Taste and adjust salt and pepper as needed.

Serve warm.`,
  photoUrl: "/images/slow-cooker-beef-stew.jpg",
  effort: "big",
  tags: ["dinner", "beef", "slow-cooker", "comfort", "one-pot", "family", "hearty", "leftovers-friendly"],
  isVegetarian: false,
  notes: "A classic, hearty beef stew with tender meat and rich broth. Searing the beef first adds deeper flavor, and the cornstarch slurry gives it a perfectly thick finish."
},

{
  id: "loaded-taco-party-ring",
  slug: "loaded-taco-party-ring",
  name: "Loaded Taco Party Ring with Cilantro Lime Rice",
  ingredients: `Taco Ring:
1 lb ground beef
1/2 lb onion, diced
1/2 cup water
3 Tbsp taco seasoning
16 oz refrigerated crescent rolls
1 cup cheddar cheese, shredded
2 Tbsp olive oil
1 Tbsp red pepper flakes (optional)

Cilantro Lime Rice:
10 oz cooked rice
2 Tbsp cilantro lime seasoning (or lime juice + chopped cilantro + pinch of salt)`,
  instructions: `Preheat oven to 375°F.

In a skillet over medium heat, cook 1 lb ground beef and 1/2 lb diced onion until beef is browned. Drain excess grease.

Add 1/2 cup water and 3 Tbsp taco seasoning. Stir and simmer for 10 minutes until slightly thickened.

Arrange 16 oz crescent roll dough in a sunburst pattern on a baking sheet, with the wide ends overlapping in the center and the points facing outward.

Spoon the beef mixture into the center ring.

Sprinkle 1 cup shredded cheddar cheese evenly over the beef.

Fold the pointed ends of the dough over the filling and tuck underneath to form a ring.

Bake for about 18 minutes, until golden brown.

Brush the top with 2 Tbsp olive oil and sprinkle with 1 Tbsp red pepper flakes if using.

Slice and serve.

For the rice: In a bowl, combine 10 oz cooked rice with 2 Tbsp cilantro lime seasoning (or mix in lime juice, chopped cilantro, and salt to taste). Serve alongside.`,
  photoUrl: "/images/loaded-taco-party-ring.jpg",
  effort: "normal",
  tags: ["dinner", "beef", "bake", "party", "family", "tex-mex", "fun", "shareable"],
  isVegetarian: false,
  notes: "A fun, shareable taco-inspired bake wrapped in flaky crescent dough. Great for parties or family dinners and pairs perfectly with fresh cilantro lime rice."
},
{
  id: "barbecue-chicken-pizza",
  slug: "barbecue-chicken-pizza",
  name: "Barbecue Chicken Pizza",
  ingredients: `Chicken:
1 lb boneless skinless chicken breast or thighs
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper
1/2 tsp smoked paprika (optional, for extra depth)

Pizza Base:
1 lb pizza dough (store-bought or homemade)
1/2 cup barbecue sauce (plus 2 Tbsp for chicken)
1 1/2 cups mozzarella cheese, shredded
1/2 cup red onion, thinly sliced
1/4 cup fresh cilantro, chopped

Optional:
1/4 cup cheddar cheese, shredded
1/2 jalapeño, thinly sliced`,
  instructions: `Preheat oven to 475°F. If using a pizza stone or steel, place it in the oven while preheating.

Heat 1 Tbsp olive oil in a skillet over medium-high heat.

Season 1 lb chicken with 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp smoked paprika if using.

Cook chicken for 5 to 6 minutes per side, until a deep golden-brown crust forms and the internal temperature reaches 165°F.

Remove from heat, let rest for 5 minutes, then slice or shred. Toss with 2 Tbsp barbecue sauce.

On a lightly floured surface, stretch 1 lb pizza dough into a 12 to 14-inch round.

Spread 1/2 cup barbecue sauce evenly over the dough, leaving a small border around the edges.

Top with 1 1/2 cups mozzarella cheese, followed by the barbecue chicken, 1/2 cup sliced red onion, and optional cheddar or jalapeños.

Transfer to a pizza peel or baking sheet and bake for 10 to 14 minutes, until the crust is golden and the cheese is melted and bubbly with light browning.

Remove from oven and sprinkle with 1/4 cup fresh cilantro.

Let rest for 2 to 3 minutes before slicing and serving.`,
  photoUrl: "/images/barbecue-chicken-pizza.jpg",
  effort: "normal",
  tags: ["dinner", "pizza", "chicken", "bbq", "oven", "family", "comfort"],
  isVegetarian: false,
  notes: "A bold, smoky-sweet pizza with tender barbecue chicken and melty cheese. Cooking the chicken separately ensures great texture and prevents excess moisture on the pizza."
},

{
  id: "homemade-fried-chicken",
  slug: "homemade-fried-chicken",
  name: "Homemade Fried Chicken",
  ingredients: `Chicken:
3 lbs bone-in chicken pieces (legs, thighs, breasts, wings)
2 cups buttermilk
1 Tbsp hot sauce (optional)
1 tsp salt
1/2 tsp black pepper

Flour Coating:
2 cups all-purpose flour
1 Tbsp paprika (or smoked paprika for extra depth)
1 tsp garlic powder
1 tsp onion powder
1 tsp salt
1/2 tsp black pepper
1/2 tsp cayenne pepper (optional)

For Frying:
vegetable oil (enough for 2 to 3 inches in a skillet or pot)`,
  instructions: `In a large bowl, combine 2 cups buttermilk, 1 Tbsp hot sauce if using, 1 tsp salt, and 1/2 tsp black pepper.

Add 3 lbs chicken pieces, making sure they are fully coated. Cover and refrigerate for at least 2 hours, or overnight for best flavor and tenderness.

In a separate bowl, mix 2 cups flour, 1 Tbsp paprika, 1 tsp garlic powder, 1 tsp onion powder, 1 tsp salt, 1/2 tsp black pepper, and 1/2 tsp cayenne if using.

Remove chicken from the buttermilk, letting excess drip off.

Dredge each piece in the seasoned flour, pressing firmly so a thick coating adheres. Set coated chicken on a rack and let rest for 10 to 15 minutes to help the crust stick.

Heat vegetable oil in a large cast iron skillet or heavy pot over medium heat until it reaches 325°F to 350°F.

Carefully place chicken in the hot oil, skin-side down. Do not overcrowd the pan.

Fry for 12 to 15 minutes, turning occasionally, until the crust is deep golden-brown and crispy and the internal temperature reaches 165°F.

Transfer chicken to a wire rack (not paper towels) to drain and stay crispy.

Let rest for 5 minutes before serving.`,
  photoUrl: "/images/homemade-fried-chicken.jpg",
  effort: "big",
  tags: ["dinner", "chicken", "fried", "comfort", "crispy", "family", "southern"],
  isVegetarian: false,
  notes: "Classic crispy fried chicken with a flavorful, well-seasoned crust. Marinating in buttermilk keeps the chicken juicy while creating a tender interior."
},


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
    photoUrl: "/images/quick-airfryer-baked-potato.jpg",
    tags: ["side", "air-fryer", "comfort", "quick", "vegetarian"],
    notes: "An easy side dish that goes with almost anything and needs very little hands-on work.",
    ingredients: `1 large russet potato
1/2 tsp salt
1 Tbsp olive oil (or cooking spray)
1 to 2 Tbsp butter (depending on potato size)
shredded cheese (optional)
sour cream (optional)`,
    instructions: `Rinse 1 large russet potato and dry completely.
Pierce the potato with a fork in 4 to 6 spots.
Coat the potato evenly with 1 Tbsp olive oil or cooking spray.
Sprinkle with 1/2 tsp salt and rotate to coat all sides.
Preheat air fryer to 400°F.
Air fry for 60 minutes, shaking the basket once or twice.
Slice down the middle, fluff with a fork, and add 1 to 2 Tbsp butter along with optional shredded cheese and sour cream.`,
  },

  {
    id: "quick-garlic-roasted-potatoes",
    slug: "quick-garlic-roasted-potatoes",
    name: "Garlic Roasted Potatoes",
    effort: "quick",
    photoUrl: "/images/quick-garlic-roasted-potatoes.jpg",
    tags: ["side", "roasted", "vegetarian", "comfort", "oven"],
    notes: "Crispy, simple potatoes that work with almost any main dish.",
    ingredients: `3 lbs small red or white potatoes
1/4 cup olive oil
1 1/2 tsp salt
1 tsp pepper
2 Tbsp garlic, minced
2 Tbsp fresh parsley, minced`,
    instructions: `Preheat oven to 400°F.

Cut 3 lbs small red or white potatoes in halves or quarters and place in a bowl with 1/4 cup olive oil, 1 1/2 tsp salt, 1 tsp pepper, and 2 Tbsp minced garlic. Toss until coated.

Transfer to a sheet pan and spread into a single layer.

Roast 45 minutes to 1 hour until browned and crisp, flipping twice during cooking for even browning.

Remove from oven, toss with 2 Tbsp minced fresh parsley, season to taste, and serve hot.`,
  },

  {
  id: "buffalo-chicken-tots",
  slug: "buffalo-chicken-tots",
  name: "Buffalo Chicken Tots",
  ingredients: `1 (32 oz) bag frozen tater tots
1 Tbsp olive oil

2 cups cooked chicken, shredded
1/2 cup buffalo sauce (plus more for drizzle)

1 cup cheddar cheese, shredded
1/2 cup mozzarella cheese, shredded (optional)

1/2 cup blue cheese crumbles (optional)
1/2 cup ranch or blue cheese dressing

2 green onions, sliced
1 jalapeño or chili pepper, thinly sliced (optional)`,
  instructions: `Preheat oven to 400°F.

Toss 1 (32 oz) bag tater tots with 1 Tbsp olive oil and spread in a single layer on a baking sheet.

Bake according to package directions, about 20 to 25 minutes, until crispy and golden.

While the tots bake, combine 2 cups shredded chicken with 1/2 cup buffalo sauce in a bowl. Toss until evenly coated.

Remove tots from the oven and transfer to an oven-safe skillet or baking dish.

Top with buffalo chicken, then sprinkle 1 cup cheddar cheese and 1/2 cup mozzarella if using.

Add 1/2 cup blue cheese crumbles and sliced jalapeños if desired.

Return to oven and bake 5 to 10 minutes, until cheese is melted and everything is hot.

Remove from oven and drizzle with ranch or blue cheese dressing.

Garnish with sliced green onions and serve immediately.`,
  photoUrl: "/images/buffalo-chicken-tots.jpg",
  effort: "quick",
  tags: ["appetizer", "snack", "chicken", "buffalo", "game-day", "comfort", "party", "loaded"],
  isVegetarian: false,
  notes: "Crispy tater tots loaded with buffalo chicken, melty cheese, and cool ranch. Inspired by restaurant-style totchos but simplified for easy home cooking."
},

{
  id: "classic-potato-salad",
  slug: "classic-potato-salad",
  name: "Classic Potato Salad",
  ingredients: `2 lbs Yukon Gold or red potatoes, cut into 1-inch chunks
1 tsp salt (for boiling water)
3 large eggs

1/2 cup celery, finely diced
1/3 cup red onion, finely diced
1/4 cup dill pickles or relish, chopped
2 Tbsp fresh parsley, chopped

3/4 cup mayonnaise
1 Tbsp Dijon mustard
1 Tbsp apple cider vinegar
1 tsp sugar
1/2 tsp salt (plus more to taste)
1/4 tsp black pepper
1/2 tsp paprika`,
  instructions: `Place 2 lbs chopped potatoes in a large pot and cover with cold water. Add 1 tsp salt and bring to a boil over high heat.

Reduce to a gentle boil and cook for 10 to 12 minutes, until potatoes are fork-tender but still hold their shape. Drain and let cool slightly.

While potatoes cook, place 3 eggs in a saucepan and cover with water. Bring to a boil, then turn off heat, cover, and let sit for 10 to 12 minutes. Transfer to ice water, peel, and chop.

In a large bowl, whisk together 3/4 cup mayonnaise, 1 Tbsp Dijon mustard, 1 Tbsp apple cider vinegar, 1 tsp sugar, 1/2 tsp salt, 1/4 tsp black pepper, and 1/2 tsp paprika until smooth.

Add the slightly warm potatoes to the dressing and gently toss to coat.

Add chopped eggs, 1/2 cup celery, 1/3 cup red onion, 1/4 cup pickles, and 2 Tbsp parsley. Fold everything together until evenly combined.

Cover and refrigerate for at least 1 to 2 hours to allow flavors to develop.

Before serving, taste and adjust salt and pepper if needed. Sprinkle with additional paprika if desired.`,
  photoUrl: "/images/classic-potato-salad.jpg",
  effort: "normal",
  tags: ["side", "potatoes", "salad", "bbq", "summer", "comfort", "family", "cookout"],
  isVegetarian: true,
  notes: "A creamy, classic potato salad with balanced tang and texture. Dressing the potatoes while slightly warm helps them absorb more flavor."
},


];

export const DESSERTS: Meal[] = [
  {
    id: "quick-dark-chocolate-dipped-strawberries",
    slug: "quick-dark-chocolate-dipped-strawberries",
    name: "Dark Chocolate Dipped Strawberries",
    effort: "quick",
    photoUrl: "/images/quick-dark-chocolate-dipped-strawberries.jpg",
    tags: ["dessert", "snack", "no-bake", "quick", "vegetarian"],
    notes: "A simple dessert that feels special without a lot of work.",
    ingredients: `12 large ripe strawberries
1/2 cup dark chocolate baking chips
1 tsp coconut oil`,
    instructions: `Wash 12 large ripe strawberries and dry completely. Chocolate will not stick if wet.
Bring a small pot with a few inches of water to a gentle simmer.
Add 1/2 cup dark chocolate baking chips and 1 tsp coconut oil to a heat-safe glass bowl.
Set the bowl over the pot like a double boiler, making sure the bowl does not touch the water.
Stir until the chocolate is fully melted and smooth.
Line a sheet pan with parchment paper.
Dip the strawberries one at a time and place on the parchment.
Refrigerate for 20 to 30 minutes until the chocolate sets.
Store leftovers in an airtight container in the refrigerator.`,
  },

  {
  id: "chocolate-peanut-butter-no-bake-bars",
  slug: "chocolate-peanut-butter-no-bake-bars",
  name: "Chocolate Peanut Butter No-Bake Bars",
  ingredients: `1 cup natural peanut butter
1/2 cup maple syrup
1 tsp vanilla extract
2 cups gluten-free oats (quick or rolled)
1 cup dairy-free chocolate chips
1 Tbsp coconut oil`,
  instructions: `In a large bowl, mix 1 cup peanut butter, 1/2 cup maple syrup, and 1 tsp vanilla extract until smooth and fully combined.

Stir in 2 cups oats until everything is evenly coated and forms a thick mixture.

Line an 8x8 pan with parchment paper and press the mixture firmly into an even layer.

In a microwave-safe bowl, combine 1 cup chocolate chips and 1 Tbsp coconut oil. Microwave in 30-second intervals, stirring between each, until smooth and melted.

Pour the melted chocolate over the oat mixture and spread evenly across the top.

Refrigerate for 1 to 2 hours, or until firm.

Slice into bars and serve.`,
  photoUrl: "/images/chocolate-peanut-butter-no-bake-bars.jpg",
  effort: "quick",
  tags: ["dessert", "snack", "no-bake", "gluten-free", "dairy-free", "sweet", "meal-prep"],
  isVegetarian: true,
  notes: "An easy no-bake treat with peanut butter and chocolate. Perfect for meal prep, snacks, or a quick dessert without turning on the oven."
}

];

export const EXTRA_RECIPES: Meal[] = [
  {
    id: "quick-classic-guacamole",
    slug: "quick-classic-guacamole",
    name: "Guacamole",
    effort: "quick",
    photoUrl: "/images/quick-classic-guacamole.jpg",
    tags: ["dip", "side", "mexican", "no-cook", "quick", "vegetarian"],
    notes: "Fresh and simple guacamole that works as a snack, side, or taco-night add-on.",
    ingredients: `3 ripe avocados, peeled and pitted
1 lime, juiced
1 tsp salt
1/2 cup diced white onion
3 Tbsp chopped fresh cilantro
2 Roma tomatoes, diced
1 tsp garlic, minced
pinch of cayenne pepper (optional)`,
    instructions: `In a medium bowl, mash 3 peeled and pitted ripe avocados with the juice of 1 lime and 1 tsp salt until your desired consistency, slightly chunky is usually best.
Stir in 1/2 cup diced white onion, 3 Tbsp chopped fresh cilantro, 2 diced Roma tomatoes, and 1 tsp minced garlic.
Add a pinch of cayenne pepper if desired and mix well.
Taste and adjust salt or lime as needed.
Refrigerate for 1 hour for the best flavor, or serve immediately with tortilla chips.`,
  },

  {
    id: "quick-homemade-chili-seasoning",
    slug: "quick-homemade-chili-seasoning",
    name: "Homemade Chili Seasoning",
    effort: "quick",
    photoUrl: "/images/quick-homemade-chili-seasoning.jpg",
    tags: ["seasoning", "pantry", "spice-mix", "quick", "vegetarian"],
    notes: "A pantry staple that is great to keep on hand for chili nights.",
    ingredients: `1 Tbsp chili powder
1 tsp ground cumin
1/4 tsp cayenne pepper
1/4 tsp garlic powder
1/2 tsp onion powder
1 tsp salt
1/4 tsp pepper
small pinch ground cinnamon`,
    instructions: `Add all ingredients to a small bowl.
Stir very well until evenly combined.
Transfer to an airtight container or spice shaker.
Store in a cool, dry place.
Use in place of one store-bought chili seasoning packet.`,
  },

  {
    id: "quick-captains-wing-rub",
    slug: "quick-captains-wing-rub",
    name: "Captain's Wing Rub",
    photoUrl: "/images/quick-captains-wing-rub.jpg",
    effort: "quick",
    tags: ["seasoning", "pantry", "spice-mix", "quick", "vegetarian"],
    notes: "Bold, spicy, and tangy. Great for wings or grilled meats.",
    ingredients: `2 Tbsp smoked paprika
1 1/2 Tbsp cayenne pepper
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
  },

  {
    id: "quick-sausage-muffins",
    slug: "quick-sausage-muffins",
    name: "Sausage Muffins",
    effort: "quick",
    photoUrl: "/images/quick-sausage-muffins.jpg",
    tags: ["breakfast", "quick", "kid-friendly", "meal-prep", "pork"],
    notes: "Easy grab-and-go breakfast muffins that also work for busy mornings or snacks.",
    ingredients: `1 cup Bisquick
1 lb breakfast sausage, cooked
4 eggs, beaten
1 cup cheddar cheese, shredded`,
    instructions: `Preheat oven to 350°F.

Cook 1 lb breakfast sausage in a skillet until browned and set aside to cool slightly.

In a medium bowl, combine 4 beaten eggs, 1 cup Bisquick, the cooked sausage, and 1 cup shredded cheddar cheese. Mix well until thoroughly combined.

Spray muffin tins with cooking spray.

Fill each muffin cup 1/2 to 3/4 full with the mixture.

Bake for 20 minutes or until the muffins are set and lightly browned on top.`,
  },

  {
    id: "big-french-toast-casserole",
    slug: "big-french-toast-casserole",
    name: "French Toast Casserole",
    photoUrl: "/images/big-french-toast-casserole.jpg",
    effort: "big",
    tags: ["breakfast", "brunch", "bake", "sweet", "family-friendly", "make-ahead"],
    notes: "Perfect make-ahead breakfast for holidays or weekends.",
    ingredients: `1 loaf sourdough bread
8 large eggs
2 cups milk
1/2 cup heavy cream
1 Tbsp vanilla extract
3/4 cup sugar
1/2 cup all-purpose flour
1/2 cup light brown sugar
1 tsp ground cinnamon
1/4 tsp salt
1 stick unsalted butter, cut into pieces
fresh blueberries (optional)
fresh strawberries (optional)`,
    instructions: `Preheat oven to 350°F.

Cut 1 loaf sourdough bread into cubes and place in a greased 9x13 baking dish.

In a large bowl, whisk together 8 large eggs, 2 cups milk, 1/2 cup heavy cream, 1 Tbsp vanilla extract, and 3/4 cup sugar. Pour the mixture evenly over the bread cubes.

Cover and refrigerate for at least 4 hours, or overnight.

In a separate bowl, mix 1/2 cup all-purpose flour, 1/2 cup light brown sugar, 1 tsp ground cinnamon, and 1/4 tsp salt. Cut in 1 stick of unsalted butter using a pastry cutter or fork until the mixture is crumbly. Refrigerate the topping until ready to bake.

Remove the dish from the fridge and sprinkle the chilled crumble topping evenly over the soaked bread.

Bake uncovered for 50 minutes until the top is golden and the center is set.

Top with fresh blueberries and strawberries if desired before serving.`,
  },

  {
  id: "chicken-salad-croissant",
  slug: "chicken-salad-croissant",
  name: "Chicken Salad Croissant",
  ingredients: `Chicken:
1 lb boneless skinless chicken breasts
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp black pepper

Chicken Salad:
1/2 cup mayonnaise
1 Tbsp Dijon mustard
1 Tbsp lemon juice
1/2 tsp garlic powder
1/4 tsp salt (plus more to taste)
1/4 tsp black pepper
1/2 cup celery, finely diced
1/3 cup red grapes, halved (optional)
1/4 cup sliced almonds or pecans (optional)
2 Tbsp fresh parsley, chopped

Assembly:
4 croissants, sliced
lettuce leaves (optional)
tomato slices (optional)`,
  instructions: `Preheat a skillet over medium heat. Add 1 Tbsp olive oil.

Season 1 lb chicken breasts with 1/2 tsp salt and 1/4 tsp black pepper.

Cook chicken for 5 to 6 minutes per side, until a golden-brown crust forms and the internal temperature reaches 165°F.

Remove from heat and let rest for 5 to 10 minutes, then dice or shred into bite-sized pieces.

In a large bowl, whisk together 1/2 cup mayonnaise, 1 Tbsp Dijon mustard, 1 Tbsp lemon juice, 1/2 tsp garlic powder, 1/4 tsp salt, and 1/4 tsp black pepper until smooth.

Add the chopped chicken, 1/2 cup celery, 1/3 cup grapes if using, 1/4 cup nuts if using, and 2 Tbsp parsley. Fold gently until everything is evenly coated.

Taste and adjust seasoning with additional salt, pepper, or lemon juice as needed.

Slice 4 croissants and layer with lettuce if desired.

Spoon chicken salad generously onto each croissant and top with tomato slices if using.

Serve immediately.`,
  photoUrl: "/images/chicken-salad-croissant.jpg",
  effort: "normal",
  tags: ["lunch", "chicken", "sandwich", "quick", "meal-prep", "family", "fresh"],
  isVegetarian: false,
  notes: "A creamy, balanced chicken salad served on flaky croissants. Letting the chicken rest before chopping keeps it juicy, and a splash of lemon brightens the entire dish."
},

{
  id: "plantation-tea",
  slug: "plantation-tea",
  name: "Plantation Tea",
  ingredients: `1 quart hot water
6 black tea bags
1 quart cold water
16 oz pineapple juice
1 fresh pineapple, peeled, cored, and cut into spears`,
  instructions: `Bring 1 quart water to just below boiling and pour into a large pitcher.

Add 6 black tea bags and steep for 5 minutes.

Remove the tea bags and pour in 1 quart cold water.

Add 16 oz pineapple juice and stir well to combine.

Refrigerate overnight for best flavor.

Serve over ice and garnish with fresh pineapple spears.`,
  photoUrl: "/images/plantation-tea.jpg",
  effort: "quick",
  tags: ["drink", "beverage", "tea", "summer", "batch", "refreshing", "non-alcoholic"],
  isVegetarian: true,
  notes: "A refreshing iced tea with a tropical pineapple twist. Letting it chill overnight helps the flavors fully blend and mellow."
},


  {
  id: "blueberry-lemonade",
  slug: "blueberry-lemonade",
  name: "Blueberry Lemonade",
  ingredients: `2 1/8 cups fresh blueberries (divided)
3/4 cup granulated sugar
2/3 cup freshly squeezed lemon juice
4 cups cold water (divided)
1 lemon, sliced`,
  instructions: `Add 2 cups blueberries, 3/4 cup sugar, and 1 cup water to a blender. Blend on medium-high speed for about 1 minute, until completely smooth.

Strain the blueberry puree through a fine mesh sieve into a pitcher to remove skins.

Add 2/3 cup freshly squeezed lemon juice and the remaining 3 cups cold water to the pitcher. Stir well to combine.

Taste and add more water if a lighter flavor is desired.

Refrigerate until well chilled.

Before serving, add sliced lemon and the remaining 1/8 cup blueberries as garnish.

Serve over ice.`,
  photoUrl: "/images/blueberry-lemonade.jpg",
  effort: "quick",
  tags: ["drink", "beverage", "summer", "refreshing", "batch", "non-alcoholic"],
  isVegetarian: true,
  notes: "Bright and refreshing homemade lemonade with a natural blueberry twist. Straining the puree gives it a smooth texture while keeping all the fresh flavor."
},

{
  id: "nojito",
  slug: "nojito",
  name: "Nojito (Mint Lime Mocktail)",
  ingredients: `crushed ice
8 mint leaves
3 oz lime juice
1 1/2 oz simple syrup
2 oz club soda
mint sprig, for garnish`,
  instructions: `Fill a pint glass about 1/3 full with crushed ice.

Add 8 mint leaves to the glass.

Pour in 3 oz lime juice and 1 1/2 oz simple syrup.

Gently muddle the mint leaves into the liquid using a muddler or wooden spoon, pressing lightly to release flavor without tearing the leaves.

Fill the glass with more crushed ice.

Top with 2 oz club soda.

Garnish with a fresh mint sprig and serve immediately.`,
  photoUrl: "/images/nojito.jpg",
  effort: "quick",
  tags: ["drink", "beverage", "mocktail", "refreshing", "summer", "non-alcoholic"],
  isVegetarian: true,
  notes: "A refreshing non-alcoholic mojito-style drink with bright lime and fresh mint. Gently muddling the mint keeps the flavor clean without bitterness."
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
    photoUrl: "/images/quick-vegetable-stir-fry.jpg",
    tags: ["vegetarian", "dinner", "quick", "healthy", "skillet", "one-pan", "asian"],
    notes: "A flexible, colorful dinner that is easy to adjust with whatever vegetables you have on hand.",
    ingredients: `2 Tbsp olive oil
1 red bell pepper, sliced
1 yellow bell pepper, sliced
8 oz baby bella mushrooms, sliced
3 cups small broccoli florets
1 cup sugar snap peas
1 cup carrots, thinly sliced
3 green onions, thinly sliced
sesame seeds, for garnish

STIR FRY SAUCE
1/2 cup water
1/3 cup low-sodium soy sauce
1 Tbsp honey or brown sugar
1 Tbsp rice vinegar
2 tsp toasted sesame oil
2 garlic cloves, grated
2 tsp grated fresh ginger
1 Tbsp cornstarch
1/2 tsp red pepper flakes, optional
salt and pepper, to taste`,
    instructions: `In a medium bowl, whisk together the STIR FRY SAUCE: 1/2 cup water, 1/3 cup low-sodium soy sauce, 1 Tbsp honey or brown sugar, 1 Tbsp rice vinegar, 2 tsp toasted sesame oil, 2 grated garlic cloves, 2 tsp grated fresh ginger, 1 Tbsp cornstarch, and 1/2 tsp red pepper flakes if using. Set aside.

Heat 2 Tbsp olive oil in a large skillet or wok over high heat. Add the sliced red and yellow bell peppers, 8 oz sliced baby bella mushrooms, 3 cups small broccoli florets, 1 cup sugar snap peas, 1 cup thinly sliced carrots, and most of the 3 thinly sliced green onions. Toss and cook, stirring occasionally, for 3 to 4 minutes, or until vegetables soften slightly.

Reduce heat to medium and pour in the whisked sauce. Stir and cook for 1 to 2 minutes, or until the sauce thickens and vegetables are crisp-tender. Season with salt and pepper to taste.

Top with the remaining green onions and sesame seeds and serve immediately.`,
  },

  {
    id: "normal-vegan-jambalaya",
    slug: "normal-vegan-jambalaya",
    name: "Vegan Jambalaya",
    effort: "normal",
    photoUrl: "/images/normal-vegan-jambalaya.jpg",
    tags: ["vegetarian", "vegan", "dinner", "one-pot", "healthy", "spicy", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Hearty, plant-based jambalaya with bold spices and a rich tomato base. Letting it rest before serving helps the rice finish absorbing flavor and improves texture.",
    ingredients: `2 Tbsp olive oil
1/2 large yellow onion, chopped
2 cloves garlic, minced
1/2 red bell pepper, chopped
1/2 green bell pepper, chopped
1 carrot, peeled and chopped
1 (14 oz) can crushed tomatoes
2 Tbsp soy sauce (or tamari)
1 tsp smoked paprika (or regular paprika)
1 tsp ground cumin
1 tsp dried oregano
1 tsp dried thyme
1 tsp garlic powder
1 tsp onion powder
1/2 tsp salt
1/4 tsp pepper
1/8 tsp cayenne pepper (optional)
1 cup uncooked white rice
3 cups vegetable stock
1 (15 oz) can chickpeas, drained and rinsed
1 (15 oz) can kidney beans, drained and rinsed
1 Tbsp tomato paste (optional, for deeper flavor)
1 Tbsp lemon juice (optional, for brightness)

Optional garnish:
fresh parsley, chopped`,
    instructions: `Heat 2 Tbsp olive oil in a large pot or Dutch oven over medium heat. Add 1/2 chopped large yellow onion, 1/2 chopped red bell pepper, 1/2 chopped green bell pepper, and 1 chopped carrot. Cook for 5 to 6 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Stir in 1 Tbsp tomato paste if using and cook for 1 minute to deepen flavor.

Add 1 can crushed tomatoes and cook for 4 to 5 minutes, stirring occasionally, until slightly thickened.

Stir in 2 Tbsp soy sauce, 1 tsp smoked paprika, 1 tsp ground cumin, 1 tsp dried oregano, 1 tsp dried thyme, 1 tsp garlic powder, 1 tsp onion powder, 1/2 tsp salt, 1/4 tsp pepper, and 1/8 tsp cayenne pepper if using. Cook for 1 minute to bloom the spices.

Add 1 cup uncooked white rice and 3 cups vegetable stock. Stir well and bring to a boil.

Reduce heat to low, cover, and simmer for 15 to 18 minutes, stirring once or twice, until the rice is tender and most of the liquid is absorbed.

Stir in 1 can drained and rinsed chickpeas and 1 can drained and rinsed kidney beans. Cook for 2 to 3 minutes until heated through.

Remove from heat and stir in 1 Tbsp lemon juice if using. Let sit for 5 minutes before serving.

Garnish with fresh chopped parsley if desired and serve warm.`,
  },

  {
    id: "quick-black-bean-quesadillas",
    slug: "quick-black-bean-quesadillas",
    name: "Black Bean Quesadillas",
    effort: "quick",
    photoUrl: "/images/quick-black-bean-quesadillas.jpg",
    tags: ["vegetarian", "dinner", "quick", "mexican", "kid-friendly", "skillet", "one-pan", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Quick and satisfying quesadillas with creamy black beans and melted cheese. Mashing some of the beans helps everything hold together and creates a better texture.",
    ingredients: `4 small flour tortillas
1 cup cheddar cheese, shredded
1 (15 oz) can black beans, drained and rinsed
1/2 cup salsa (plus extra for serving)
1 Tbsp olive oil or butter
1/2 tsp cumin (optional, for extra flavor)
1/2 tsp garlic powder
1/4 tsp salt
1/4 tsp pepper`,
    instructions: `Heat a large skillet over medium heat.

In a small bowl, lightly mash about half of 1 can of drained and rinsed black beans with a fork to help them hold together. Stir in 1/2 tsp cumin if using, 1/2 tsp garlic powder, 1/4 tsp salt, and 1/4 tsp pepper.

Place one of the 4 small flour tortillas in the skillet and sprinkle a layer of shredded cheddar cheese over half of it.

Add a layer of the seasoned black beans, then a spoonful of salsa, followed by a little more of the cheese.

Fold the tortilla over and cook for 2 to 3 minutes, until the bottom is golden and crispy.

Flip and cook another 2 to 3 minutes, until the cheese is fully melted and the tortilla is crisp.

Repeat with the remaining tortillas, adding 1 Tbsp olive oil or butter to the pan as needed.

Slice and serve warm with extra salsa.`,
  },

  {
    id: "quick-pesto-naan-pizzas",
    slug: "quick-pesto-naan-pizzas",
    name: "Pesto Naan Pizzas",
    effort: "quick",
    photoUrl: "/images/quick-pesto-naan-pizzas.jpg",
    tags: ["vegetarian", "dinner", "quick", "pizza", "kid-friendly", "one-pan", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Quick and flavorful naan pizzas with bright pesto and melty cheese. Brushing the edges with olive oil helps create a crisp, golden crust.",
    ingredients: `2 naan breads
1/4 cup basil pesto
1 cup mozzarella cheese, shredded
1/2 cup cherry tomatoes, halved
1 Tbsp olive oil
1/4 cup Parmesan cheese, grated (optional)
1/2 tsp garlic powder
1 Tbsp fresh basil, chopped (optional)`,
    instructions: `Preheat oven to 400°F. Place 2 naan breads on a baking sheet.

Lightly brush the edges of the naan with 1 Tbsp olive oil for a crispier crust.

Spread 1/4 cup basil pesto evenly over each naan, leaving a small border around the edges.

Sprinkle 1 cup shredded mozzarella evenly over the top, followed by 1/2 cup halved cherry tomatoes and 1/4 cup grated Parmesan if using.

Sprinkle lightly with 1/2 tsp garlic powder.

Bake for 8 to 10 minutes, until the cheese is melted, bubbly, and the edges are lightly crisp.

For extra browning, broil on high for 1 to 2 minutes, watching closely.

Remove from oven and top with 1 Tbsp fresh chopped basil if desired. Slice and serve immediately.`,
  },

  {
    id: "quick-jamaican-jerk-tofu",
    slug: "quick-jamaican-jerk-tofu",
    name: "Jamaican Jerk Tofu",
    effort: "quick",
    photoUrl: "/images/quick-jamaican-jerk-tofu.jpg",
    tags: ["vegetarian", "vegan", "dinner", "quick", "spicy", "skillet", "healthy", "one-pan", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Bold, spicy jerk tofu with crisp edges and tender vegetables. Pressing the tofu and letting it sear undisturbed are key to getting a great texture.",
    ingredients: `1 (14 oz) block extra-firm tofu, pressed
2 Tbsp Jamaican jerk seasoning
1 Tbsp olive oil
1 Tbsp soy sauce (or tamari)
1 tsp brown sugar (optional, to balance heat)
1 cup bell peppers, sliced
1/2 small red onion, sliced
1 Tbsp lime juice (optional, for brightness)
1 Tbsp cornstarch (optional, for extra crispiness)`,
    instructions: `Press 1 block extra-firm tofu for at least 10 to 15 minutes to remove excess moisture, then cut into bite-sized cubes.

In a bowl, toss the tofu with 2 Tbsp Jamaican jerk seasoning, 1 Tbsp soy sauce or tamari, and 1 tsp brown sugar if using. For extra crispiness, lightly coat with 1 Tbsp cornstarch.

Heat 1 Tbsp olive oil in a large skillet over medium-high heat.

Add the tofu in a single layer and cook for 4 to 5 minutes without moving, until golden and crisp on one side.

Flip and cook another 3 to 4 minutes until crisp on multiple sides.

Add 1 cup sliced bell peppers and 1/2 sliced small red onion to the skillet. Cook for 4 to 5 minutes, stirring occasionally, until tender but still slightly crisp.

Drizzle with 1 Tbsp lime juice if using and toss everything together.

Serve hot.`,
  },

  {
    id: "big-vegetarian-shepherds-pie",
    slug: "big-vegetarian-shepherds-pie",
    name: "Vegetarian Shepherd’s Pie",
    effort: "big",
    photoUrl: "/images/big-vegetarian-shepherds-pie.jpg",
    tags: ["vegetarian", "dinner", "bake", "comfort", "casserole", "family-friendly", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Hearty vegetarian shepherd’s pie with a rich lentil filling and creamy mashed potato topping. Letting it rest before serving helps the layers hold together and improves texture.",
    ingredients: `1 1/2 cups cooked lentils
4 large potatoes, peeled and chopped
2 cups mixed vegetables (carrots, peas, corn)
1 cup vegetable broth
1/4 cup milk
2 Tbsp butter
1 Tbsp olive oil
1 small yellow onion, diced
2 cloves garlic, minced
1 Tbsp tomato paste (optional, for depth)
1 tsp dried thyme (optional)
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1/2 cup shredded cheddar cheese (optional, for topping)`,
    instructions: `Preheat oven to 400°F. Lightly grease a baking dish.

Bring a large pot of salted water to a boil. Add 4 large peeled and chopped potatoes and cook for 12 to 15 minutes until fork-tender. Drain and mash with 2 Tbsp butter and 1/4 cup milk until smooth. Season with salt and 1/2 tsp pepper and set aside.

Heat 1 Tbsp olive oil in a large skillet over medium heat. Add 1 small diced yellow onion and cook for 4 to 5 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Stir in 2 cups mixed vegetables and cook for 5 to 7 minutes until tender.

Add 1 1/2 cups cooked lentils, 1 cup vegetable broth, 1 Tbsp tomato paste, and 1 tsp dried thyme if using. Stir well and simmer for 5 to 7 minutes until the mixture thickens slightly.

Season to taste with additional salt and pepper.

Transfer the lentil mixture to the prepared baking dish and spread evenly.

Top with the mashed potatoes, spreading to the edges. Use a fork to create texture on top for better browning.

Sprinkle with 1/2 cup shredded cheddar cheese if using.

Bake for 20 to 25 minutes, until heated through and the top is lightly golden.

For extra browning, broil on high for 2 to 3 minutes at the end, watching closely.

Let rest for 5 to 10 minutes before serving.`,
  },

  {
    id: "quick-creamy-tortellini",
    slug: "quick-creamy-tortellini",
    name: "Creamy Spinach Tortellini",
    effort: "quick",
    photoUrl: "/images/quick-creamy-tortellini.jpg",
    tags: ["vegetarian", "dinner", "pasta", "quick", "comfort", "one-pan", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Creamy, comforting tortellini with a smooth Parmesan sauce. Adding pasta water helps create a silky texture that clings perfectly to the pasta.",
    ingredients: `1 (20 oz) package cheese tortellini
1 Tbsp olive oil or butter
2 cloves garlic, minced
1 cup heavy cream
1/2 cup Parmesan cheese, freshly grated
2 cups fresh spinach
1/2 cup reserved pasta water
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1/4 tsp red pepper flakes (optional)
1 Tbsp lemon juice (optional, for brightness)`,
    instructions: `Bring a large pot of salted water to a boil. Cook 1 package cheese tortellini according to package directions. Reserve 1/2 cup pasta water, then drain.

Heat 1 Tbsp olive oil or butter in a large skillet over medium heat. Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Pour in 1 cup heavy cream and bring to a gentle simmer. Cook for 3 to 4 minutes, stirring occasionally, until slightly thickened.

Stir in 1/2 cup freshly grated Parmesan cheese gradually, whisking until smooth.

Add 2 cups fresh spinach and cook for 1 to 2 minutes until wilted.

Add the cooked tortellini to the skillet and toss to coat. Add a splash of the reserved pasta water as needed to loosen the sauce and make it silky.

Season with 1/2 tsp salt, 1/4 tsp pepper, and 1/4 tsp red pepper flakes if using.

Remove from heat and stir in 1 Tbsp lemon juice if desired. Serve immediately.`,
  },

  {
    id: "big-spinach-ricotta-stuffed-shells",
    slug: "big-spinach-ricotta-stuffed-shells",
    name: "Spinach and Ricotta Stuffed Shells",
    effort: "big",
    photoUrl: "/images/big-spinach-ricotta-stuffed-shells.jpg",
    tags: ["vegetarian", "dinner", "pasta", "bake", "comfort", "italian", "family-friendly", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Classic stuffed shells with a creamy ricotta and spinach filling. Adding an egg helps bind the filling, and baking covered first keeps everything moist before finishing uncovered for a golden top.",
    ingredients: `1 box jumbo pasta shells
1 (15 oz) ricotta cheese
2 cups fresh spinach, chopped
1 (24 oz) marinara sauce
1 cup mozzarella cheese, shredded
1/2 cup Parmesan cheese, grated
1 large egg
2 cloves garlic, minced
1/2 tsp salt
1/2 tsp pepper
1/2 tsp dried Italian seasoning (optional)`,
    instructions: `Preheat oven to 375°F. Lightly grease a 9x13 baking dish.

Bring a large pot of salted water to a boil. Cook 1 box jumbo pasta shells until al dente, about 1 to 2 minutes less than package directions. Drain and set aside to cool slightly.

In a large bowl, combine 15 oz ricotta cheese, 2 cups chopped fresh spinach, 1/2 cup shredded mozzarella, 1/2 cup grated Parmesan, 1 large egg, 2 minced cloves garlic, 1/2 tsp salt, 1/2 tsp pepper, and 1/2 tsp dried Italian seasoning if using. Mix until smooth and well combined.

Spread a thin layer of 1 jar marinara sauce on the bottom of the baking dish.

Stuff each cooked shell with the ricotta mixture and arrange them in the dish.

Pour the remaining marinara sauce evenly over the shells, then sprinkle with the remaining 1/2 cup mozzarella.

Cover loosely with foil and bake for 20 minutes.

Remove foil and bake an additional 10 to 15 minutes, until the cheese is melted and bubbly with lightly golden edges.

Let rest for 5 to 10 minutes before serving.`,
  },

  {
    id: "normal-chickpea-curry",
    slug: "normal-chickpea-curry",
    name: "Chickpea Curry",
    effort: "normal",
    photoUrl: "/images/normal-chickpea-curry.jpg",
    tags: ["vegetarian", "vegan", "dinner", "curry", "chickpeas", "one-pot", "comfort", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Creamy, warmly spiced chickpea curry with a tomato-coconut sauce. Great with basmati rice, naan, or a simple cucumber yogurt salad.",
    ingredients: `2 (15 oz) cans chickpeas, drained and rinsed
1 Tbsp olive oil
1 small yellow onion, finely diced
3 cloves garlic, minced
1 medium red bell pepper, diced
1 Tbsp fresh ginger, grated
1 tsp ground cumin
1 tsp ground coriander
1 tsp turmeric
1/2 tsp smoked paprika
1/2 tsp chili powder
1 tsp salt, to taste
1 (14 oz) can crushed tomatoes
1 (13.5 oz) can full-fat coconut milk
1/2 cup vegetable broth
1 tsp sugar (optional)
juice of 1/2 lemon
1/4 cup fresh cilantro, chopped
cooked basmati rice`,
    instructions: `Heat 1 Tbsp olive oil in a large skillet or Dutch oven over medium heat. Add 1 finely diced small yellow onion and 1 diced medium red bell pepper and cook for 5 to 7 minutes, stirring occasionally, until softened and lightly golden.

Add 3 minced cloves garlic and 1 Tbsp grated fresh ginger. Cook for 1 to 2 minutes, stirring often, until fragrant.

Add 1 tsp ground cumin, 1 tsp ground coriander, 1 tsp turmeric, 1/2 tsp smoked paprika, 1/2 tsp chili powder, and 1 tsp salt. Stir constantly for 30 to 60 seconds over medium-low heat to bloom the spices.

Pour in 1 can crushed tomatoes and stir well. Cook for 5 minutes, stirring occasionally, until the mixture thickens slightly and deepens in color.

Add 2 cans drained and rinsed chickpeas, 1 can full-fat coconut milk, 1/2 cup vegetable broth, and 1 tsp sugar if using. Stir to combine, then bring to a gentle simmer over medium heat.

Reduce the heat to low and simmer uncovered for 15 to 20 minutes, stirring occasionally, until the sauce thickens and coats the back of a spoon.

Stir in the juice of 1/2 lemon and 1/4 cup chopped fresh cilantro. Taste and adjust salt if needed.

Serve hot over cooked basmati rice or with warm naan.`,
  },

  {
    id: "normal-spicy-tofu-mushroom-hash",
    slug: "normal-spicy-tofu-mushroom-hash",
    name: "Vegetarian Spicy Skillet Hash",
    effort: "normal",
    photoUrl: "/images/normal-spicy-tofu-mushroom-hash.jpg",
    tags: ["vegetarian", "vegan", "dinner", "skillet", "spicy", "healthy", "one-pan", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Crispy, hearty skillet hash with bold Cajun flavor. Letting the tofu and potatoes cook undisturbed helps develop a golden crust and great texture.",
    ingredients: `1 (14 oz) block firm tofu, pressed and cubed
2 cups king oyster mushrooms, sliced
2 cups potatoes, diced (small cubes for even cooking)
1 cup bell peppers, diced
2 Tbsp Cajun spice blend
2 Tbsp olive oil
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1 Tbsp soy sauce (optional, for depth)
1/2 tsp smoked paprika (optional)
1 Tbsp fresh parsley, chopped (optional)`,
    instructions: `Heat 1 Tbsp olive oil in a large skillet over medium-high heat.

Add 2 cups diced potatoes in a single layer and cook for 10 to 12 minutes, stirring occasionally, until golden, crispy on the edges, and tender inside. Season lightly with 1/2 tsp salt and 1/2 tsp pepper.

While potatoes cook, pat 1 block cubed firm tofu dry with paper towels for better browning.

Push potatoes to one side of the skillet. Add the remaining 1 Tbsp olive oil to the empty side, then add the tofu and 2 cups sliced king oyster mushrooms.

Cook undisturbed for 3 to 4 minutes to develop a golden crust, then stir and continue cooking for another 3 to 4 minutes until browned.

Add 1 cup diced bell peppers and sprinkle 2 Tbsp Cajun seasoning and 1/2 tsp smoked paprika if using over everything. Stir to combine.

Cook for 5 to 7 minutes, stirring occasionally, until peppers are tender and everything is well coated in seasoning.

Drizzle with 1 Tbsp soy sauce if using and toss to combine. Taste and adjust seasoning as needed.

Remove from heat, garnish with 1 Tbsp fresh chopped parsley if desired, and serve hot.`,
  },

  {
  id: "quick-caprese-pasta",
  slug: "quick-caprese-pasta",
  name: "Caprese Pasta",
  effort: "quick",
  photoUrl: "/images/quick-caprese-pasta.jpg",
  tags: ["vegetarian", "dinner", "pasta", "quick", "italian", "healthy", "one-pan", "light"],
  isVegetarian: true,
  notes: "Fresh and light pasta with juicy tomatoes and creamy mozzarella. Adding pasta water helps create a light sauce that brings everything together without heaviness.",
  ingredients: `1/2 lb penne pasta
1 cup cherry tomatoes, halved
1/2 cup mozzarella pearls
1/4 cup fresh basil, torn
2 Tbsp olive oil
1 clove garlic, minced (optional)
1 Tbsp balsamic glaze (optional, for finishing)
1/4 cup reserved pasta water
1/2 tsp salt (plus more to taste)
1/4 tsp pepper`,
  instructions: `Bring a large pot of salted water to a boil. Cook 1/2 lb penne pasta according to package directions until al dente. Reserve 1/4 cup pasta water, then drain.

Heat 2 Tbsp olive oil in the same pot or a large skillet over medium heat. Add 1 minced clove garlic if using and cook for 30 seconds until fragrant.

Add 1 cup halved cherry tomatoes and cook for 2 to 3 minutes, just until they begin to soften and release some juices.

Return the cooked pasta to the pot and toss with the tomatoes.

Add 1/2 cup mozzarella pearls and a splash of the reserved pasta water. Toss gently until everything is combined and slightly glossy.

Remove from heat and fold in 1/4 cup torn fresh basil.

Season with 1/2 tsp salt and 1/4 tsp pepper to taste. Drizzle with 1 Tbsp balsamic glaze if desired.

Serve immediately.`,
},

{
  id: "big-mediterranean-stuffed-peppers",
  slug: "big-mediterranean-stuffed-peppers",
  name: "Mediterranean Stuffed Bell Peppers",
  effort: "big",
  photoUrl: "/images/big-mediterranean-stuffed-peppers.jpg",
  tags: ["vegetarian", "dinner", "bake", "healthy", "mediterranean", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  notes: "Bright and flavorful stuffed peppers with a Mediterranean twist. Adding lemon juice and fresh herbs helps balance the richness of the feta and brings everything together.",
  ingredients: `4 large bell peppers, tops removed and seeds discarded
2 cups cooked quinoa
1/2 cup feta cheese, crumbled
1/4 cup Kalamata olives, chopped
1/2 cup cherry tomatoes, chopped
2 Tbsp olive oil
2 cloves garlic, minced
1/2 small red onion, finely diced
1 tsp dried oregano
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1 Tbsp lemon juice
1/4 cup fresh parsley, chopped (optional)`,
  instructions: `Preheat oven to 375°F. Lightly grease a baking dish.

Place 4 prepared bell peppers upright in the dish. Add a small amount of water to the bottom of the dish to help steam the peppers.

Heat 2 Tbsp olive oil in a skillet over medium heat. Add 1/2 finely diced small red onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

In a large bowl, combine 2 cups cooked quinoa, the sautéed onion and garlic, 1/2 cup crumbled feta, 1/4 cup chopped Kalamata olives, 1/2 cup chopped cherry tomatoes, 1 tsp dried oregano, 1/2 tsp salt, and 1/4 tsp pepper. Stir well.

Add 1 Tbsp lemon juice and mix to combine.

Spoon the filling evenly into the bell peppers, packing lightly.

Cover the dish with foil and bake for 30 minutes, until the peppers are tender.

Remove foil and bake an additional 5 to 10 minutes for slight browning on top.

Garnish with 1/4 cup fresh chopped parsley if desired and serve warm.`,
},

{
  id: "quick-vegetable-pad-thai",
  slug: "quick-vegetable-pad-thai",
  name: "Vegetable Pad Thai",
  effort: "quick",
  photoUrl: "/images/quick-vegetable-pad-thai.jpg",
  tags: ["vegetarian", "dinner", "quick", "asian", "skillet", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  notes: "Quick, takeout-style pad Thai with balanced sweet, savory, and tangy flavors. Cooking tofu undisturbed helps create a crispy texture, and adding lime at the end brightens the dish.",
  ingredients: `8 oz rice noodles
8 oz firm tofu, pressed and cubed
1 cup bean sprouts
1/3 cup pad Thai sauce
1 Tbsp olive oil (or neutral oil)
1 egg (optional, for traditional style)
2 green onions, sliced
2 cloves garlic, minced
2 tsp crushed peanuts (plus more for serving)
1 Tbsp soy sauce (optional, for depth)
1 Tbsp lime juice
1 tsp brown sugar (optional, to balance flavors)

Optional toppings:
extra peanuts
lime wedges
cilantro`,
  instructions: `Soak 8 oz rice noodles in warm water according to package directions until just tender, then drain well.

Heat 1 Tbsp olive oil in a wok or large skillet over medium-high heat.

Add 8 oz pressed and cubed firm tofu in a single layer and cook for 4 to 5 minutes without moving, until golden and crisp on one side. Flip and cook another 3 to 4 minutes. Remove and set aside.

In the same pan, add 2 minced cloves garlic and cook for 30 seconds until fragrant.

If using 1 egg, push ingredients to one side and scramble the egg until just set.

Add the drained noodles and 1/3 cup pad Thai sauce. Toss quickly to coat and heat through.

Return the tofu to the pan. Add 1 cup bean sprouts, 2 sliced green onions, 1 Tbsp soy sauce if using, 1 Tbsp lime juice, and 1 tsp brown sugar if using.

Toss everything together for 1 to 2 minutes until heated through and evenly coated.

Remove from heat and top with 2 tsp crushed peanuts.

Serve immediately with lime wedges and optional extra peanuts or cilantro.`,
},

{
  id: "big-roasted-vegetable-wellington",
  slug: "big-roasted-vegetable-wellington",
  name: "Roasted Vegetable Wellington",
  effort: "big",
  photoUrl: "/images/big-roasted-vegetable-wellington.jpg",
  tags: ["vegetarian", "dinner", "bake", "comfort", "holiday", "showstopper", "leftovers-friendly"],
  isVegetarian: true,
  notes: "An elegant vegetarian main with layers of roasted vegetables and flaky pastry. Removing excess moisture from the filling and using breadcrumbs helps keep the pastry crisp.",
  ingredients: `1 sheet puff pastry, thawed
1 large sweet potato, peeled and sliced into rounds
4 cups fresh spinach
2 large portobello mushrooms, stems removed
4 oz goat cheese
1 egg, beaten (for egg wash)
1 Tbsp olive oil
1/2 small yellow onion, finely diced
2 cloves garlic, minced
1/2 tsp salt (plus more to taste)
1/2 tsp pepper
1/2 tsp dried thyme (optional)
1 Tbsp balsamic vinegar (optional, for depth)
1 Tbsp breadcrumbs (optional, to prevent sogginess)`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper.

Toss 1 large sweet potato with a little olive oil, 1/2 tsp salt, and 1/2 tsp pepper. Roast on a baking sheet for 15 to 20 minutes until tender. Set aside.

Heat 1 Tbsp olive oil in a skillet over medium heat. Add 1/2 finely diced small onion and cook for 3 to 4 minutes until softened.

Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 4 cups fresh spinach and cook until wilted. Remove from heat and let cool slightly, then squeeze out excess moisture thoroughly.

In the same skillet, cook 2 large portobello mushrooms for 5 to 7 minutes until tender and most of their moisture has released. Drizzle with 1 Tbsp balsamic vinegar if using and cook 1 minute more. Let cool.

Roll out 1 sheet of thawed puff pastry slightly if needed. Sprinkle 1 Tbsp breadcrumbs in the center area to help absorb moisture and prevent a soggy bottom.

Layer the roasted sweet potato, the spinach mixture, and the mushrooms, then crumble 4 oz goat cheese over the top. Sprinkle with 1/2 tsp dried thyme if using.

Fold the pastry over the filling, sealing edges tightly. Place seam-side down on the prepared baking sheet.

Brush the pastry with 1 beaten egg and score the top lightly with a knife for decoration and steam release.

Bake for 25 to 30 minutes, until the pastry is golden brown and puffed.

Let rest for 5 to 10 minutes before slicing and serving.`,
},

{
  id: "big-black-bean-burgers-sweet-potato-fries",
  slug: "big-black-bean-burgers-sweet-potato-fries",
  name: "Black Bean Burgers with Sweet Potato Fries",
  effort: "big",
  photoUrl: "/images/big-black-bean-burgers-sweet-potato-fries.jpg",
  tags: ["vegetarian", "dinner", "comfort", "kid-friendly", "american", "crispy", "family-friendly", "leftovers-friendly"],
  isVegetarian: true,
  notes: "A hearty homemade black bean burger dinner with crispy sweet potato fries. Letting the patties rest before cooking helps them hold together better, while high heat gives them a nicely browned crust.",
  ingredients: `2 (15 oz) cans black beans, drained and rinsed
2 large sweet potatoes, cut into wedges
1/2 cup breadcrumbs
1/2 small red onion, finely diced
3 cloves garlic, minced
1 Tbsp ground cumin
1/2 tsp smoked paprika (optional, for extra depth)
3 Tbsp olive oil, divided
1 large egg
1/2 tsp salt, plus more to taste
1/2 tsp pepper
4 burger buns

Optional for serving:
lettuce
tomato
sliced avocado
burger sauce`,
  instructions: `Preheat oven to 425°F. Line a large baking sheet with parchment paper.

Toss 2 large sweet potatoes with 1 1/2 Tbsp olive oil, a pinch of salt, and a pinch of pepper. Spread in a single layer on the baking sheet.

Roast for 25 to 30 minutes, flipping halfway through, until tender inside and browned on the edges.

While the fries roast, place 2 cans of drained and rinsed black beans in a large bowl and mash until mostly broken down but still slightly chunky.

Add 1/2 finely diced small red onion, 3 minced cloves garlic, 1/2 cup breadcrumbs, 1 Tbsp ground cumin, 1/2 tsp smoked paprika if using, 1 large egg, 1/2 tsp salt, and 1/2 tsp pepper. Mix until well combined.

Form the mixture into 4 firm patties. If the mixture feels too soft, let it rest for 5 to 10 minutes so the breadcrumbs can absorb moisture.

Heat the remaining 1 1/2 Tbsp olive oil in a large skillet over medium heat.

Cook the 4 patties for 4 to 5 minutes per side, until deeply browned and crisp on the outside. Flip carefully.

Toast 4 burger buns if desired.

Serve patties on buns with your favorite toppings like lettuce, tomato, sliced avocado, or burger sauce, alongside the hot sweet potato fries.`,
},

{
  id: "big-sweet-potato-black-bean-enchiladas",
  slug: "big-sweet-potato-black-bean-enchiladas",
  name: "Sweet Potato and Black Bean Enchiladas",
  effort: "big",
  photoUrl: "/images/big-sweet-potato-black-bean-enchiladas.jpg",
  tags: ["vegetarian", "dinner", "bake", "mexican", "comfort", "family-friendly", "leftovers-friendly"],
  isVegetarian: true,
  notes: "Hearty vegetarian enchiladas with a perfect balance of sweet and savory flavors. Roasting the sweet potatoes instead of boiling adds depth and prevents the filling from becoming watery.",
  ingredients: `2 large sweet potatoes, peeled and cubed
1 (15 oz) can black beans, drained and rinsed
8 corn tortillas
2 cups enchilada sauce
1 1/2 cups Monterey Jack cheese, shredded
1/4 cup fresh cilantro, chopped
1 Tbsp olive oil
1/2 small red onion, finely diced
2 cloves garlic, minced
1 tsp cumin
1/2 tsp chili powder
1/2 tsp salt
1/4 tsp pepper
1 Tbsp lime juice`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper.

Toss 2 large peeled and cubed sweet potatoes with 1 Tbsp olive oil, 1/2 tsp salt, and 1/4 tsp pepper. Roast for 20 to 25 minutes until tender and lightly caramelized.

In a skillet over medium heat, cook 1/2 finely diced small red onion for 3 to 4 minutes until softened. Add 2 minced cloves garlic and cook for 30 seconds.

In a large bowl, mash the roasted sweet potatoes slightly, leaving some texture. Stir in 1 can drained and rinsed black beans, the sautéed onion and garlic, 1 tsp cumin, 1/2 tsp chili powder, and 1 Tbsp lime juice. Mix well.

Reduce oven temperature to 375°F.

Spread a thin layer of 2 cups enchilada sauce in a baking dish.

Warm 8 corn tortillas slightly to make them pliable. Spoon the filling into each tortilla, roll tightly, and place seam-side down in the dish.

Pour the remaining enchilada sauce over the top and sprinkle evenly with 1 1/2 cups shredded Monterey Jack cheese.

Bake for 20 to 25 minutes, until the cheese is melted and bubbly.

Garnish with 1/4 cup chopped fresh cilantro before serving.`,
},

{
  id: "vegetarian-fri-chik-noodle-casserole",
  slug: "vegetarian-fri-chik-noodle-casserole",
  name: "Vegetarian Fri-Chik Noodle Casserole",
  effort: "normal",
  photoUrl: "/images/vegetarian-fri-chik-noodle-casserole.jpg",
  tags: ["vegetarian", "dinner", "casserole", "pasta", "comfort", "bake", "leftovers-friendly"],
  isVegetarian: true,
  notes: "A hearty, comforting casserole that even non-vegetarians will love. Perfect for make-ahead dinners since it tastes even better the next day.",
  ingredients: `12 oz egg noodles
1 medium yellow onion, chopped
1 medium white onion, chopped
1 can Loma Linda Fri-Chik & Gravy
2 eggs, beaten
2 1/2 Tbsp McKay's Chicken Seasoning
1 (10.5 oz) can cream of mushroom soup
1 cup milk
1 (8 oz) block sharp cheddar cheese, shredded
1 (8 oz) baby bella mushrooms, sliced
2 Tbsp butter
1 Tbsp olive oil
1 Tbsp garlic, minced
1 (4 to 7 oz) can green chilies (optional)
salt
pepper`,
  instructions: `Preheat oven to 350°F.

Cook 12 oz egg noodles according to package directions, omitting salt. Drain and set aside.

In a skillet, heat 2 Tbsp butter and 1 Tbsp olive oil over medium heat. Cook 1 chopped medium yellow onion and 1 chopped medium white onion until translucent.

Add 8 oz sliced baby bella mushrooms and cook until they begin to brown. Stir in 1 Tbsp minced garlic and cook for 2 more minutes.

Chop the contents of 1 can Loma Linda Fri-Chik into small pieces.

In a large bowl, combine the cooked noodles, 2 beaten eggs, 1 cup milk, the cooked onions and mushrooms, 1 can cream of mushroom soup, most of the shredded sharp cheddar cheese, reserving some for the topping, the chopped Fri-Chik with its gravy, 2 1/2 Tbsp McKay's Chicken Seasoning, salt, pepper, and 1 can green chilies if using. Mix well.

Transfer the mixture to a baking dish and cover tightly with foil. Bake for 1 hour.

Remove the foil, top with the remaining shredded cheese, and bake uncovered for 5 to 10 minutes until the cheese is fully melted and bubbly.`,
},

{
  id: "normal-caprese-stuffed-portobello-mushrooms",
  slug: "normal-caprese-stuffed-portobello-mushrooms",
  name: "Caprese Stuffed Portobello Mushrooms",
  effort: "normal",
  photoUrl: "/images/normal-caprese-stuffed-portobello-mushrooms.jpg",
  tags: ["vegetarian", "dinner", "bake", "italian", "healthy", "low-carb", "one-pan", "light"],
  isVegetarian: true,
  notes: "A lighter caprese-inspired dinner with juicy tomatoes and melted mozzarella. Roasting the mushrooms first helps remove excess moisture and prevents a soggy final dish.",
  ingredients: `5 to 6 large portobello mushrooms, stems removed and gills scraped
2 Tbsp butter
2 cloves garlic, minced
1 Tbsp fresh parsley, chopped
5 to 6 fresh mozzarella balls, sliced
1 cup cherry tomatoes, halved
1 Tbsp olive oil
1/2 tsp salt
1/4 tsp pepper
1/4 cup balsamic vinegar
2 tsp brown sugar
fresh basil, shredded`,
  instructions: `Preheat oven to 400°F. Line a baking sheet with parchment paper.

Brush 5 to 6 large portobello mushrooms lightly with 1 Tbsp olive oil and season with 1/2 tsp salt and 1/4 tsp pepper. Place gill-side down and roast for 8 to 10 minutes to release excess moisture.

Meanwhile, melt 2 Tbsp butter in a small pan over medium heat. Add 2 minced cloves garlic and 1 Tbsp chopped fresh parsley; cook for 30 seconds until fragrant. Remove from heat.

Remove mushrooms from oven and carefully drain any liquid. Flip so they are gill-side up.

Brush the insides with the garlic butter mixture.

Fill each mushroom with the sliced fresh mozzarella and 1 cup halved cherry tomatoes.

Return to the oven and bake for 8 to 10 minutes, until cheese is melted and bubbly.

For extra browning, broil on high for 1 to 2 minutes, watching closely.

In a small saucepan, combine 1/4 cup balsamic vinegar and 2 tsp brown sugar. Bring to a simmer and cook for 5 to 8 minutes until reduced and syrupy.

Drizzle the balsamic glaze over the mushrooms, top with shredded fresh basil, and serve immediately.`,
},

{
  id: "normal-spinach-mushroom-feta-crustless-quiche",
  slug: "normal-spinach-mushroom-feta-crustless-quiche",
  name: "Spinach Mushroom Feta Crustless Quiche",
  effort: "normal",
  photoUrl: "/images/normal-spinach-mushroom-feta-crustless-quiche.jpg",
  tags: ["vegetarian", "breakfast", "brunch", "dinner", "bake", "meal-prep", "healthy"],
  isVegetarian: true,
  notes: "A good breakfast-for-dinner or meal-prep option with lots of savory flavor.",
  ingredients: `1 (10 oz) bag spinach
8 oz baby bella mushrooms, sliced
1 clove garlic, minced
1/8 tsp salt
1 Tbsp cooking oil, divided
2 oz feta cheese, crumbled
4 large eggs
1/4 cup grated Parmesan cheese
1/4 tsp pepper
1 cup milk
1/2 cup shredded mozzarella`,
  instructions: `Preheat oven to 350°F.

Rinse 8 oz baby bella mushrooms and slice thinly. Mince 1 clove garlic.

In a skillet over medium heat, add the sliced mushrooms, minced garlic, 1/8 tsp salt, and 1/2 Tbsp cooking oil. Sauté until mushrooms release their moisture and it fully evaporates. No liquid should remain in the pan.

Brush the remaining 1/2 Tbsp oil inside a 9-inch pie plate.

Layer the cooked mushrooms, 1 bag fresh spinach, and 2 oz crumbled feta cheese into the pie plate.

In a large bowl, whisk together 4 large eggs, 1/4 cup grated Parmesan cheese, 1/4 tsp pepper, and 1 cup milk until well combined.

Pour the egg mixture evenly over the vegetables and cheese. Top with 1/2 cup shredded mozzarella.

Bake for about 50 minutes, or until the quiche is golden on top and the internal temperature reaches 160°F.

Let the quiche rest slightly to set before slicing and serving.`,
},

{
  id: "quick-cream-cheese-spinach-pasta",
  slug: "quick-cream-cheese-spinach-pasta",
  name: "Cream Cheese Spinach Pasta",
  effort: "quick",
  photoUrl: "/images/quick-cream-cheese-spinach-pasta.jpg",
  tags: ["vegetarian", "dinner", "pasta", "quick", "comfort", "creamy", "one-pan", "leftovers-friendly"],
  isVegetarian: true,
  notes: "Creamy, comforting pasta made with simple ingredients. Adding pasta water gradually helps create a smooth, silky sauce that clings perfectly to the noodles.",
  ingredients: `12 oz pasta (penne or rotini)
4 oz cream cheese, softened and cubed
1/2 cup Parmesan cheese, freshly grated
2 cups fresh spinach
2 cloves garlic, minced
1 Tbsp butter
1/2 cup reserved pasta water
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1/4 tsp red pepper flakes (optional)
1 tsp lemon juice (optional, for brightness)`,
  instructions: `Bring a large pot of salted water to a boil. Cook 12 oz pasta according to package directions until al dente. Reserve 1/2 cup pasta water, then drain.

In the same pot or a large skillet, melt 1 Tbsp butter over medium heat. Add 2 minced cloves garlic and cook for 30 seconds until fragrant.

Add 4 oz softened and cubed cream cheese and a splash of the reserved pasta water. Stir until the cream cheese begins to melt and form a smooth sauce.

Gradually add 1/2 cup freshly grated Parmesan cheese, stirring continuously until fully melted and combined.

Add more of the reserved pasta water as needed to create a smooth, creamy consistency.

Stir in 2 cups fresh spinach and cook for 1 to 2 minutes until wilted.

Add the cooked pasta and toss well to coat evenly.

Season with 1/2 tsp salt, 1/4 tsp pepper, and 1/4 tsp red pepper flakes if using.

Remove from heat and stir in 1 tsp lemon juice if desired for brightness. Serve immediately.`,
},

{
  id: "quick-caprese-sandwich",
  slug: "quick-caprese-sandwich",
  name: "Caprese Grilled Cheese",
  effort: "quick",
  photoUrl: "/images/quick-caprese-sandwich.jpg",
  tags: ["vegetarian", "dinner", "sandwich", "quick", "skillet", "comfort", "italian", "one-pan"],
  isVegetarian: true,
  notes: "A fresh twist on grilled cheese with melty mozzarella, juicy tomato, and basil. Letting the sandwich rest briefly helps the cheese set slightly for cleaner slices.",
  ingredients: `4 slices sourdough bread
4 oz fresh mozzarella, sliced
1 tomato, thinly sliced
1/4 cup fresh basil leaves
1 Tbsp butter
1 Tbsp olive oil (optional, for extra crisp)
1/4 tsp salt
1/4 tsp pepper
1 Tbsp balsamic glaze (optional, for finishing)`,
  instructions: `Heat a skillet over medium heat.

Lightly season 1 thinly sliced tomato with 1/4 tsp salt and 1/4 tsp pepper to enhance flavor.

Layer 4 oz sliced fresh mozzarella, the seasoned tomato slices, and 1/4 cup fresh basil leaves between 4 slices of sourdough bread to make two sandwiches.

Spread 1 Tbsp butter evenly on the outside of each sandwich. For extra crispiness, you can also add a light drizzle of 1 Tbsp olive oil to the pan.

Place sandwiches in the skillet and cook for 3 to 4 minutes, pressing gently, until the bread is golden brown and crisp.

Flip and cook another 3 to 4 minutes, until the cheese is fully melted.

Remove from skillet and let rest for 1 to 2 minutes before slicing.

Drizzle with 1 Tbsp balsamic glaze if desired and serve warm.`,
},

{
  id: "creamy-mushroom-stroganoff",
  slug: "creamy-mushroom-stroganoff",
  name: "Creamy Mushroom Stroganoff",
  ingredients: `8 oz egg noodles
2 tbsp butter
1 tbsp olive oil
16 oz mushrooms, sliced
1/2 onion, diced
2 cloves garlic, minced
1 tbsp flour
1 1/2 cups vegetable broth
1/2 cup sour cream
1 tsp paprika
1/2 tsp salt
1/4 tsp black pepper`,
  instructions: `Cook 8 oz egg noodles according to package directions and set aside.

Heat 2 tbsp butter and 1 tbsp olive oil in a skillet over medium-high heat.

Add 16 oz mushrooms and cook 6 to 8 minutes until deeply browned.

Add 1/2 diced onion and cook 3 to 4 minutes until softened. Add 2 cloves garlic and cook 30 seconds.

Stir in 1 tbsp flour and cook 1 minute.

Add 1 1/2 cups vegetable broth and simmer until slightly thickened.

Reduce heat to low and stir in 1/2 cup sour cream, 1 tsp paprika, 1/2 tsp salt, and 1/4 tsp pepper.

Add noodles and toss to coat. Serve warm.`,
  photoUrl: "/images/creamy-mushroom-stroganoff.webp",
  effort: "normal",
  tags: ["vegetarian", "dinner", "comfort", "pasta", "creamy", "one-pan"],
  isVegetarian: true,
  notes: "A rich, creamy vegetarian twist on a comfort classic with deep mushroom flavor."
},

{
  id: "black-bean-sweet-potato-tacos",
  slug: "black-bean-sweet-potato-tacos",
  name: "Black Bean and Sweet Potato Tacos",
  ingredients: `2 cups sweet potatoes, diced
1 tbsp olive oil
1/2 tsp salt
1/4 tsp pepper
1 tsp chili powder
1/2 tsp cumin
1 (15 oz) can black beans, drained
8 tortillas
1/2 cup avocado, sliced
1/4 cup cilantro, chopped`,
  instructions: `Preheat oven to 425°F.

Toss 2 cups diced sweet potatoes with 1 tbsp olive oil, 1/2 tsp salt, 1/4 tsp pepper, 1 tsp chili powder, and 1/2 tsp cumin.

Roast for 20 to 25 minutes until tender and slightly caramelized.

Warm 8 tortillas.

Fill tortillas with roasted sweet potatoes and black beans.

Top with avocado and cilantro. Serve warm.`,
  photoUrl: "/images/black-bean-sweet-potato-tacos.webp",
  effort: "normal",
  tags: ["vegetarian", "dinner", "tacos", "tex-mex", "healthy"],
  isVegetarian: true,
  notes: "Sweet, smoky, and filling tacos perfect for a meatless night."
},

{
  id: "chickpea-salad-sandwich",
  slug: "chickpea-salad-sandwich",
  name: "Chickpea Salad Sandwich",
  ingredients: `1 (15 oz) can chickpeas, drained
1/3 cup mayonnaise
1 tbsp Dijon mustard
1 tbsp lemon juice
1/4 cup celery, diced
2 tbsp red onion, diced
4 slices bread`,
  instructions: `In a bowl, mash 1 can chickpeas until slightly chunky.

Add 1/3 cup mayonnaise, 1 tbsp Dijon mustard, and 1 tbsp lemon juice. Stir to combine.

Mix in 1/4 cup celery and 2 tbsp red onion.

Spread onto 4 slices of bread and assemble sandwiches. Serve immediately.`,
  photoUrl: "/images/chickpea-salad-sandwich.webp",
  effort: "quick",
  tags: ["vegetarian", "lunch", "sandwich", "quick", "meal-prep"],
  isVegetarian: true,
  notes: "A simple, protein-packed vegetarian alternative to chicken or tuna salad."
},

{
  id: "mediterranean-chickpea-bowl",
  slug: "mediterranean-chickpea-bowl",
  name: "Mediterranean Chickpea Bowl",
  ingredients: `2 cups cooked rice or quinoa
1 (15 oz) can chickpeas, drained
1 cup cucumber, diced
1 cup cherry tomatoes, halved
1/2 cup feta cheese
2 tbsp olive oil
1 tbsp lemon juice
1/2 tsp salt`,
  instructions: `In a bowl, combine 2 cups cooked rice or quinoa with 1 can chickpeas.

Add 1 cup cucumber, 1 cup tomatoes, and 1/2 cup feta.

Drizzle with 2 tbsp olive oil and 1 tbsp lemon juice.

Season with 1/2 tsp salt and toss. Serve.`,
  photoUrl: "/images/mediterranean-chickpea-bowl.webp",
  effort: "quick",
  tags: ["vegetarian", "dinner", "bowl", "healthy", "meal-prep"],
  isVegetarian: true,
  notes: "Fresh, filling, and perfect for quick healthy meals."
},

{
  id: "cheese-enchiladas",
  slug: "cheese-enchiladas",
  name: "Cheese Enchiladas",
  ingredients: `8 tortillas
2 cups enchilada sauce
2 cups cheddar cheese, shredded`,
  instructions: `Preheat oven to 375°F.

Spread 1/2 cup enchilada sauce in a baking dish.

Fill each tortilla with cheese, roll, and place seam-side down.

Pour remaining sauce over the top and sprinkle with remaining cheese.

Bake for 20 minutes until bubbly. Serve warm.`,
  photoUrl: "/images/cheese-enchiladas.webp",
  effort: "normal",
  tags: ["vegetarian", "dinner", "comfort", "mexican", "bake"],
  isVegetarian: true,
  notes: "Simple, cheesy comfort food perfect for busy nights."
},

{
  id: "quick-grilled-corn",
  slug: "quick-grilled-corn",
  name: "Grilled Corn on the Cob",
  effort: "quick",
  photoUrl: "/images/quick-grilled-corn.jpg",
  tags: ["side", "grilling", "summer", "vegetarian", "bbq", "easy"],
  isVegetarian: true,
  notes: "Sweet, juicy grilled corn with a light char and buttery finish. Brushing with oil before grilling helps achieve even color and prevents sticking.",
  ingredients: `4 ears corn, husked
2 Tbsp butter, melted
1 Tbsp olive oil
1/2 tsp salt (plus more to taste)
1/4 tsp pepper (optional)
1/2 tsp garlic powder (optional)
1 Tbsp fresh parsley or cilantro, chopped (optional)
lime wedges (optional)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F.

Brush 4 husked ears of corn lightly with 1 Tbsp olive oil to help prevent sticking and promote even charring.

Place the corn directly on the grill grates.

Grill for 8 to 10 minutes, turning every 2 to 3 minutes, until kernels are tender and lightly charred on all sides.

Remove from the grill and brush generously with 2 Tbsp melted butter.

Sprinkle with 1/2 tsp salt, 1/4 tsp pepper, and 1/2 tsp garlic powder if using.

Garnish with 1 Tbsp fresh chopped parsley or cilantro and serve with lime wedges if desired.`,
},

{
  id: "quick-grilled-veggie-kabobs",
  slug: "quick-grilled-veggie-kabobs",
  name: "Grilled Veggie Kabobs",
  effort: "quick",
  photoUrl: "/images/quick-grilled-veggie-kabobs.jpg",
  tags: ["vegetarian", "dinner", "grilling", "healthy", "side", "summer", "one-pan"],
  isVegetarian: true,
  notes: "Simple, colorful grilled vegetables with a light char. Cutting vegetables to similar sizes helps them cook evenly, and a quick finish with acid brightens the flavor.",
  ingredients: `1 zucchini, sliced into thick rounds
1 bell pepper (any color), chopped into chunks
1/2 red onion, cut into chunks
8 oz mushrooms (whole or halved)
2 Tbsp olive oil
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
1/2 tsp garlic powder
1/2 tsp dried Italian seasoning (optional)
1 Tbsp balsamic vinegar or lemon juice (optional, for finishing)`,
  instructions: `Preheat grill to medium heat, about 375°F to 400°F.

If using wooden skewers, soak them in water for at least 20 minutes to prevent burning.

In a large bowl, toss 1 zucchini, 1 chopped bell pepper, 1/2 red onion, and 8 oz mushrooms with 2 Tbsp olive oil, 1/2 tsp salt, 1/4 tsp pepper, 1/2 tsp garlic powder, and 1/2 tsp dried Italian seasoning if using.

Thread the seasoned vegetables onto skewers, alternating pieces for even cooking and a colorful presentation.

Place kabobs on the grill and cook for 8 to 10 minutes, turning every few minutes, until vegetables are tender and lightly charred.

Remove from grill and drizzle with 1 Tbsp balsamic vinegar or lemon juice if using for a bright finish.

Serve warm.`,
},

];

// Optional non-dinner vegetarian meals
export const VEGETARIAN_EXTRAS: Meal[] = [
  {
    id: "quick-avocado-white-bean-wraps",
    slug: "quick-avocado-white-bean-wraps",
    name: "Avocado and White Bean Wraps",
    effort: "quick",
    photoUrl: "/images/quick-avocado-white-bean-wraps.jpg",
    tags: ["vegetarian", "vegan", "lunch", "quick", "no-cook", "healthy", "meal-prep"],
    isVegetarian: true,
    notes: "A quick, fresh wrap with creamy avocado and protein-packed beans. Lightly mashing the beans helps everything hold together while keeping a good texture.",
    ingredients: `1 cup cannellini beans, drained and rinsed
1 ripe avocado
1 Tbsp lime juice
2 Tbsp fresh cilantro, chopped
1/4 tsp salt (plus more to taste)
1/4 tsp pepper
1/4 tsp garlic powder (optional)
2 large whole wheat tortillas
1/4 cup shredded carrots
1/2 cup fresh spinach leaves
1 Tbsp olive oil (optional, for richness)`,
    instructions: `In a medium bowl, mash 1 ripe avocado with 1 Tbsp lime juice, 1/4 tsp salt, 1/4 tsp pepper, and 1/4 tsp garlic powder if using until mostly smooth.

Add 1 cup drained and rinsed cannellini beans and lightly mash about half of them into the avocado mixture, leaving some whole for texture.

Stir in 2 Tbsp chopped fresh cilantro and 1 Tbsp olive oil if using. Taste and adjust seasoning as needed.

Lay 2 large whole wheat tortillas flat and spread the bean and avocado mixture evenly down the center of each.

Top the mixture with 1/4 cup shredded carrots and 1/2 cup fresh spinach leaves.

Roll the tortillas tightly, folding in the sides as you go to secure the filling.

Slice in half and serve immediately.`,
  },

  {
    id: "normal-spicy-mushroom-potato-hash",
    slug: "normal-spicy-mushroom-potato-hash",
    name: "Spicy Skillet Mushroom and Potato Hash",
    effort: "normal",
    photoUrl: "/images/normal-spicy-mushroom-potato-hash.jpg",
    tags: ["vegetarian", "breakfast", "brunch", "skillet", "spicy", "comfort", "one-pan", "leftovers-friendly"],
    isVegetarian: true,
    notes: "Crispy, hearty skillet hash with bold flavor and tender vegetables. Letting the potatoes cook undisturbed at first helps build a golden crust for the best texture.",
    ingredients: `2 large russet potatoes, diced (small cubes)
8 oz baby bella mushrooms, sliced
1 jalapeño, minced
1/2 red onion, diced
2 Tbsp olive oil
1 tsp smoked paprika
1/2 tsp garlic powder
1/2 tsp salt (plus more to taste)
1/4 tsp pepper
2 eggs
1 Tbsp fresh parsley or green onions, chopped (optional)`,
    instructions: `Bring a pot of salted water to a boil. Add 2 large diced russet potatoes and parboil for 5 minutes, then drain and let them dry slightly.

Heat 2 Tbsp olive oil in a large, heavy skillet over medium-high heat.

Add the potatoes in a single layer and cook for 8 to 10 minutes, stirring occasionally, until golden and crispy on the outside.

Add 8 oz sliced baby bella mushrooms, 1/2 diced red onion, and 1 minced jalapeño. Let cook undisturbed for 2 to 3 minutes, then stir and continue cooking for another 4 to 5 minutes until vegetables are tender and lightly browned.

Sprinkle 1 tsp smoked paprika, 1/2 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp pepper over the hash and toss to combine.

Reduce heat to medium. Create two small wells in the hash and crack 2 eggs, one into each well.

Cover the skillet and cook until the eggs are set to your preference, about 3 to 5 minutes.

Garnish with 1 Tbsp fresh chopped parsley or green onions if desired and serve hot.`,
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
    photoUrl: "/images/quick-classic-garden-salad.jpg",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "side", "fresh", "healthy"],
    ingredients: `1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cucumber, sliced
1/2 red onion, thinly sliced
1/2 cup shredded carrots
1/2 cup croutons
1/4 cup ranch or Italian dressing`,
    instructions: `Wash and chop 1 head of romaine lettuce.

In a large bowl, combine the chopped lettuce, 1 cup halved cherry tomatoes, 1 sliced cucumber, 1/2 thinly sliced red onion, and 1/2 cup shredded carrots.

Top the vegetable mixture with 1/2 cup croutons.

Drizzle with 1/4 cup ranch or Italian dressing just before serving and toss well to coat.`,
    notes: "A crisp everyday salad that works as a side or a light lunch.",
  },

  {
    id: "quick-greek-salad",
    slug: "quick-greek-salad",
    name: "Greek Salad",
    photoUrl: "/images/quick-greek-salad.jpg",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "mediterranean", "fresh", "healthy"],
    ingredients: `1 cucumber, chopped
1 pint cherry tomatoes, halved
1/2 red onion, sliced
1 green bell pepper, chopped
1/2 cup Kalamata olives
1/2 cup feta cheese, crumbled
2 Tbsp olive oil
1 Tbsp red wine vinegar
1 tsp dried oregano
salt and pepper to taste`,
    instructions: `In a large bowl, combine 1 chopped cucumber, 1 pint halved cherry tomatoes, 1/2 sliced red onion, 1 chopped green bell pepper, 1/2 cup Kalamata olives, and 1/2 cup crumbled feta cheese.

In a small bowl, whisk together 2 Tbsp olive oil, 1 Tbsp red wine vinegar, 1 tsp dried oregano, and salt and pepper to taste.

Pour the dressing over the salad and toss gently to ensure everything is evenly coated.

Serve immediately or chill in the refrigerator until ready to serve.`,
    notes: "Bright, salty, and refreshing with a classic Mediterranean flavor.",
  },

  {
    id: "quick-caprese-salad",
    slug: "quick-caprese-salad",
    name: "Caprese Salad",
    photoUrl: "/images/quick-caprese-salad.jpg",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "italian", "fresh", "no-cook"],
    ingredients: `3 large tomatoes, sliced
8 oz fresh mozzarella, sliced
1/4 cup fresh basil leaves
2 Tbsp olive oil
1 Tbsp balsamic glaze
salt and pepper to taste`,
    instructions: `Arrange 3 large sliced tomatoes and 8 oz sliced fresh mozzarella on a platter, alternating the slices.

Tuck 1/4 cup fresh basil leaves between the tomato and mozzarella layers.

Drizzle the entire platter with 2 Tbsp olive oil and 1 Tbsp balsamic glaze.

Season lightly with salt and pepper to taste just before serving.`,
    notes: "Simple, fresh, and perfect for warm-weather meals.",
  },

  {
    id: "quick-southwest-chicken-salad",
    slug: "quick-southwest-chicken-salad",
    name: "Southwest Chicken Salad",
    photoUrl: "/images/quick-southwest-chicken-salad.jpg",
    effort: "quick",
    tags: ["salad", "quick", "chicken", "dinner", "protein", "tex-mex"],
    ingredients: `2 cups cooked chicken, chopped
1 head romaine lettuce, chopped
1 cup corn
1 cup black beans, drained and rinsed
1 cup cherry tomatoes, halved
1/2 cup cheddar cheese, shredded
1 avocado, diced
1/4 cup tortilla strips
1/3 cup southwest ranch dressing`,
    instructions: `In a large bowl, combine 1 head chopped romaine lettuce, 2 cups chopped cooked chicken, 1 cup corn, 1 cup drained and rinsed black beans, 1 cup halved cherry tomatoes, 1/2 cup shredded cheddar cheese, and 1 diced avocado.

Top the mixture with 1/4 cup tortilla strips for crunch.

Drizzle with 1/3 cup southwest ranch dressing and toss well just before serving to keep the lettuce and strips crisp.`,
    notes: "A hearty salad that feels like a full dinner, not just a side.",
  },

  {
    id: "quick-cucumber-tomato-salad",
    slug: "quick-cucumber-tomato-salad",
    name: "Cucumber Tomato Salad",
    photoUrl: "/images/quick-cucumber-tomato-salad.jpg",
    effort: "quick",
    tags: ["salad", "quick", "vegetarian", "side", "fresh", "summer"],
    ingredients: `2 cucumbers, sliced
3 tomatoes, chopped
1/4 red onion, thinly sliced
2 Tbsp olive oil
1 Tbsp red wine vinegar
1 tsp sugar
salt and pepper to taste`,
    instructions: `Add 2 sliced cucumbers, 3 chopped tomatoes, and 1/4 thinly sliced red onion to a large bowl.

In a small separate bowl, whisk together 2 Tbsp olive oil, 1 Tbsp red wine vinegar, 1 tsp sugar, and salt and pepper to taste until the sugar is mostly dissolved.

Pour the dressing over the vegetables and toss well to ensure everything is evenly coated.

For the best flavor, chill in the refrigerator for 15 minutes before serving to let the juices meld.`,
    notes: "Cool, crisp, and great with grilled dinners.",
  },

  // =====================================================
  // NORMAL
  // =====================================================
  {
    id: "normal-grilled-chicken-caesar-salad",
    slug: "normal-grilled-chicken-caesar-salad",
    name: "Grilled Chicken Caesar Salad",
    photoUrl: "/images/normal-grilled-chicken-caesar-salad.jpg",
    effort: "normal",
    tags: ["salad", "normal", "chicken", "dinner", "protein", "classic"],
    ingredients: `2 chicken breasts
1 Tbsp olive oil
1 tsp garlic powder
1/2 tsp salt
1/4 tsp pepper
1 head romaine lettuce, chopped
1/2 cup Caesar dressing
1/3 cup Parmesan cheese
1 cup croutons`,
    instructions: `Season 2 chicken breasts with 1 Tbsp olive oil, 1 tsp garlic powder, 1/2 tsp salt, and 1/4 tsp pepper.

Cook the chicken in a skillet or grill pan over medium-high heat until fully cooked, reaching an internal temperature of 165°F, then slice into strips.

In a large bowl, add 1 head chopped romaine lettuce, 1/2 cup Caesar dressing, 1/3 cup Parmesan cheese, and 1 cup croutons. Toss well to coat the leaves evenly.

Top the salad with the warm sliced chicken and serve immediately.`,
    notes: "A restaurant-style classic that works perfectly as a dinner salad.",
  },

  {
    id: "normal-cobb-salad",
    slug: "normal-cobb-salad",
    name: "Cobb Salad",
    photoUrl: "/images/normal-cobb-salad.jpg",
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
    instructions: `Arrange 1 head chopped romaine lettuce in a large serving bowl or on a wide platter as the base.

Top the lettuce in neat, parallel rows with 2 cups chopped cooked chicken, 4 strips cooked and crumbled bacon, 2 chopped hard-boiled eggs, 1 diced avocado, 1 cup halved cherry tomatoes, and 1/2 cup blue cheese crumbles.

Drizzle 1/3 cup ranch dressing over the top just before serving, or serve the dressing on the side to keep the ingredients fresh.`,
    notes: "Loaded with protein and toppings, this one eats like a full meal.",
  },

  {
    id: "normal-steakhouse-salad",
    slug: "normal-steakhouse-salad",
    name: "Steakhouse Salad",
    photoUrl: "/images/normal-steakhouse-salad.jpg",
    effort: "normal",
    tags: ["salad", "normal", "beef", "dinner", "protein", "hearty"],
    ingredients: `1 lb sirloin steak
1 Tbsp olive oil
1 tsp salt
1/2 tsp pepper
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1/2 red onion, sliced
1/2 cup crumbled blue cheese
1/4 cup French's fried onions
1/3 cup balsamic vinaigrette`,
    instructions: `Season 1 lb sirloin steak with 1 Tbsp olive oil, 1 tsp salt, and 1/2 tsp pepper.

Cook the steak in a skillet over medium-high heat until it reaches your desired doneness. Let the steak rest for at least 5 minutes, then slice it thinly against the grain.

In a large bowl, combine 1 head chopped romaine lettuce, 1 cup halved cherry tomatoes, 1/2 sliced red onion, 1/2 cup crumbled blue cheese, and 1/4 cup crispy fried onions.

Top the vegetable mixture with the sliced steak and drizzle with 1/3 cup balsamic vinaigrette just before serving.`,
    notes: "Bold steakhouse flavor in a lighter, salad-style dinner.",
  },

  {
    id: "normal-broccoli-bacon-salad",
    slug: "normal-broccoli-bacon-salad",
    name: "Broccoli Bacon Salad",
    photoUrl: "/images/normal-broccoli-bacon-salad.jpg",
    effort: "normal",
    tags: ["salad", "normal", "side", "broccoli", "bacon", "potluck"],
    ingredients: `4 cups broccoli florets
6 strips bacon, cooked and crumbled
1/2 red onion, diced
1/2 cup cheddar cheese, shredded
1/4 cup sunflower seeds
1/3 cup mayonnaise
1 Tbsp apple cider vinegar
1 Tbsp sugar`,
    instructions: `In a large bowl, combine 4 cups broccoli florets, 6 strips cooked and crumbled bacon, 1/2 diced red onion, 1/2 cup shredded cheddar cheese, and 1/4 cup sunflower seeds.

In a separate small bowl, whisk together 1/3 cup mayonnaise, 1 Tbsp apple cider vinegar, and 1 Tbsp sugar until the dressing is smooth and the sugar has dissolved.

Pour the dressing over the broccoli mixture and mix well to ensure everything is thoroughly coated.

Chill in the refrigerator for at least 30 minutes before serving for the best flavor and texture.`,
    notes: "Crunchy, creamy, and one of those salads people always go back for.",
  },

  {
    id: "normal-avocado-ranch-chicken-salad",
    slug: "normal-avocado-ranch-chicken-salad",
    name: "Avocado Ranch Chicken Salad",
    photoUrl: "/images/normal-avocado-ranch-chicken-salad.jpg",
    effort: "normal",
    tags: ["salad", "normal", "chicken", "avocado", "dinner", "protein"],
    ingredients: `2 cups cooked chicken, chopped
1 head romaine lettuce, chopped
1 avocado, diced
1 cup cherry tomatoes, halved
1/2 cucumber, sliced
1/4 red onion, sliced
1/2 cup cheddar cheese, shredded
1/3 cup ranch dressing`,
    instructions: `In a large bowl, combine 1 head chopped romaine lettuce, 2 cups chopped cooked chicken, 1 diced avocado, 1 cup halved cherry tomatoes, 1/2 sliced cucumber, 1/4 sliced red onion, and 1/2 cup shredded cheddar cheese.

Drizzle 1/3 cup ranch dressing over the ingredients.

Toss gently to coat everything in the dressing without mashing the avocado, and serve right away.`,
    notes: "Creamy, filling, and easy enough for a weeknight dinner.",
  },

  // =====================================================
  // BIG
  // =====================================================
  {
    id: "big-buffalo-chicken-salad",
    slug: "big-buffalo-chicken-salad",
    name: "Buffalo Chicken Salad",
    photoUrl: "/images/big-buffalo-chicken-salad.jpg",
    effort: "big",
    tags: ["salad", "big", "chicken", "buffalo", "dinner", "spicy"],
    ingredients: `2 chicken breasts, breaded or grilled
1/3 cup buffalo sauce
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1/2 cucumber, sliced
1/4 red onion, sliced
1/2 cup cheddar cheese, shredded
1/4 cup blue cheese crumbles
1/3 cup ranch or blue cheese dressing`,
    instructions: `Cook 2 chicken breasts, breaded or grilled, until fully done and they reach an internal temperature of 165°F, then slice into strips or bite-sized pieces.

In a small bowl, toss the cooked chicken with 1/3 cup buffalo sauce until every piece is well coated.

In a large serving bowl, combine 1 head chopped romaine lettuce, 1 cup halved cherry tomatoes, 1/2 sliced cucumber, 1/4 sliced red onion, 1/2 cup shredded cheddar cheese, and 1/4 cup blue cheese crumbles.

Top the vegetable mixture with the buffalo chicken and drizzle with 1/3 cup ranch or blue cheese dressing before serving.`,
    notes: "Big flavor and just enough heat to make salad night exciting.",
  },

  {
    id: "big-asian-chicken-salad",
    slug: "big-asian-chicken-salad",
    name: "Asian Chicken Salad",
    photoUrl: "/images/big-asian-chicken-salad.jpg",
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
    instructions: `In a large bowl, combine 1 bag coleslaw mix, 1 cup chopped romaine lettuce, 1/2 cup shredded carrots, 1/2 cup sliced almonds, 1/4 cup crispy chow mein noodles, and 2 sliced green onions.

Top the vegetable and nut mixture with 2 cups shredded cooked chicken.

Drizzle with 1/4 cup sesame ginger dressing and toss thoroughly just before serving to ensure the noodles and almonds stay perfectly crunchy.`,
    notes: "Crunchy, colorful, and a great break from the usual salad routine.",
  },

  {
    id: "big-strawberry-spinach-salad",
    slug: "big-strawberry-spinach-salad",
    name: "Strawberry Spinach Salad",
    photoUrl: "/images/big-strawberry-spinach-salad.jpg",
    effort: "big",
    tags: ["salad", "big", "vegetarian", "spinach", "fruit", "fresh"],
    ingredients: `1 bag baby spinach
1 cup strawberries, sliced
1/2 cup blueberries
1/4 red onion, thinly sliced
1/2 cup feta cheese
1/4 cup candied pecans
1/3 cup poppy seed dressing`,
    instructions: `In a large serving bowl, combine 1 bag baby spinach, 1 cup sliced strawberries, 1/2 cup blueberries, 1/4 thinly sliced red onion, 1/2 cup feta cheese, and 1/4 cup candied pecans.

Drizzle 1/3 cup poppy seed dressing over the salad.

Toss gently to ensure the delicate spinach and berries are evenly coated, and serve immediately to keep the pecans crunchy.`,
    notes: "Sweet, tangy, and pretty enough to steal the show on the table.",
  },

  {
    id: "big-taco-salad",
    slug: "big-taco-salad",
    name: "Taco Salad",
    photoUrl: "/images/big-taco-salad.jpg",
    effort: "big",
    tags: ["salad", "big", "beef", "tex-mex", "dinner", "family-friendly"],
    ingredients: `1 lb ground beef
1 packet taco seasoning
1 head romaine lettuce, chopped
1 cup cherry tomatoes, halved
1 cup corn
1 cup black beans, drained and rinsed
1 cup cheddar cheese, shredded
1/2 cup salsa
1/2 cup sour cream
1 cup tortilla chips, crushed`,
    instructions: `In a skillet over medium-high heat, cook 1 lb ground beef until fully browned. Drain any excess fat, then stir in 1 packet taco seasoning, following packet directions for water if needed.

In a large serving bowl, combine 1 head chopped romaine lettuce, 1 cup halved cherry tomatoes, 1 cup corn, 1 cup drained and rinsed black beans, and 1 cup shredded cheddar cheese.

Top the vegetable mixture with the warm seasoned taco meat.

Finish by adding 1/2 cup salsa, 1/2 cup sour cream, and 1 cup crushed tortilla chips. Toss gently or serve as-is for a layered look.`,
    notes: "A fun dinner salad that still feels hearty and family-friendly.",
  },

  {
    id: "big-mediterranean-chickpea-salad",
    slug: "big-mediterranean-chickpea-salad",
    name: "Mediterranean Chickpea Salad",
    photoUrl: "/images/big-mediterranean-chickpea-salad.jpg",
    effort: "big",
    tags: ["salad", "big", "vegetarian", "chickpeas", "healthy", "meal-prep"],
    ingredients: `2 cans chickpeas, drained and rinsed
1 cucumber, chopped
1 pint cherry tomatoes, halved
1/2 red onion, diced
1/2 cup feta cheese
1/4 cup parsley, chopped
2 Tbsp olive oil
1 Tbsp lemon juice
1 tsp dried oregano
salt and pepper to taste`,
    instructions: `In a large bowl, combine 2 cans drained and rinsed chickpeas, 1 chopped cucumber, 1 pint halved cherry tomatoes, 1/2 diced red onion, 1/2 cup feta cheese, and 1/4 cup chopped parsley.

In a small bowl, whisk together 2 Tbsp olive oil, 1 Tbsp lemon juice, 1 tsp dried oregano, and salt and pepper to taste.

Pour the dressing over the chickpea mixture and toss well to ensure everything is evenly coated.

Serve immediately or chill in the refrigerator to allow the flavors to meld.`,
    notes: "Protein-packed, fresh, and great for lunches the next day too.",
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
  ...SIDE_DISHES,
  ...DESSERTS,
  ...EXTRA_RECIPES,
  ...VEGETARIAN_EXTRAS,
  ...NEW_SALAD_RECIPES,
];