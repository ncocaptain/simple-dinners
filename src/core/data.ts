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
  { key: "tree_nuts", label: "Tree Nuts", keywords: ["almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "tree nut", "nuts"] },
  { key: "dairy", label: "Dairy", keywords: ["milk", "cheese", "butter", "cream", "yogurt", "parmesan", "mozzarella", "feta"] },
  { key: "eggs", label: "Eggs", keywords: ["egg", "eggs"] },
  { key: "soy", label: "Soy", keywords: ["soy", "soy sauce", "tofu", "tempeh", "edamame"] },
  { key: "gluten", label: "Wheat / Gluten", keywords: ["wheat", "gluten", "bread", "pasta", "tortilla", "buns", "flour"] },
  { key: "shellfish", label: "Shellfish", keywords: ["shrimp", "crab", "lobster", "shellfish"] },
  { key: "fish", label: "Fish", keywords: ["fish", "salmon", "tuna"] },
  { key: "sesame", label: "Sesame", keywords: ["sesame", "tahini"] },
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
];

     
 // Add these to your candidateLibrary: Meal[] (e.g. in src/core/planner.ts)
// Assumes Meal supports: id?: string; slug?: string; effort?: Effort; instructions?: string; photoUrl?: string;

export const NEW_BUILTIN_RECIPES: Meal[] = [
  {
    id: "quick-beef-chili",
    slug: "quick-beef-chili",
    name: "Chili",
    effort: "quick",
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
Serve hot on its own or with crackers/cornbread. Top as desired.`,
  },
  {
    id: "quick-airfryer-baked-potato",
    slug: "quick-airfryer-baked-potato",
    name: "Air Fryer Baked Potato",
    effort: "quick",
    ingredients: `1 large russet potato
1/2 tsp salt
1 Tbsp olive oil (or cooking spray)
1–2 Tbsp butter (depending on potato size)
Shredded cheese (optional)
Sour cream (optional)`,
    instructions: `Rinse the potato and dry completely.
Pierce the potato with a fork in 4–6 spots.
Coat the potato evenly with olive oil (or spray).
Sprinkle with salt and rotate to coat all sides.
Preheat air fryer to 400°F.
Air fry for 60 minutes, shaking the basket once or twice.
Slice down the middle, fluff with a fork, and add butter and toppings.`,
  },
  {
    id: "normal-chicken-greenbean-mushroom-bake",
    slug: "normal-chicken-greenbean-mushroom-bake",
    name: "Chicken Green Bean Mushroom Bake",
    effort: "normal",
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
Uncover dish, sprinkle mozzarella on top, and return to oven 5–10 minutes until melted.
Serve chicken and mushroom mixture over rice; season with salt/pepper to taste.`,
  },
  {
    id: "quick-dark-chocolate-dipped-strawberries",
    slug: "quick-dark-chocolate-dipped-strawberries",
    name: "Dark Chocolate Dipped Strawberries",
    effort: "quick",
    ingredients: `12 large ripe strawberries
1/2 cup dark chocolate baking chips
1 tsp coconut oil`,
    instructions: `Wash strawberries and dry completely (chocolate won't stick if wet).
Bring a small pot with a few inches of water to a gentle simmer.
Add chocolate chips and coconut oil to a heat-safe glass bowl.
Set bowl over the pot (double boiler), making sure the bowl doesn't touch the water.
Stir until chocolate is fully melted and smooth.
Line a sheet pan with parchment paper.
Dip strawberries one at a time and place on parchment.
Refrigerate 20–30 minutes until chocolate sets.
Store leftovers in an airtight container in the refrigerator.`,
  },
  {
    id: "quick-classic-guacamole",
    slug: "quick-classic-guacamole",
    name: "Guacamole",
    effort: "quick",
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
    id: "big-beef-salisbury-steak",
    slug: "big-beef-salisbury-steak",
    name: "Salisbury Steak with Mushroom Gravy",
    effort: "big",
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
Whisk in flour until smooth; cook 1–2 minutes.
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
Add chopped cherry peppers and about 1 1/2 Tbsp Old Bay seasoning.
Saute over low heat for 2–3 minutes.

Drizzle the butter sauce and peppers over fried shrimp.
Serve warm with ranch dressing.`,
},

{
  id: "big-mushroom-swiss-sliders",
  slug: "big-mushroom-swiss-sliders",
  name: "Mushroom Swiss Sliders",
  effort: "big",
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
Add onion and garlic and cook 1–2 minutes.
Add ground beef and break apart with a spoon.
Stir in Worcestershire and seasoning mixture.
Cook 8–10 minutes until no pink remains. Drain and set aside.

MUSHROOM SWISS SAUCE:
In a medium saucepan over medium heat, melt butter.
Add mushrooms and cook 5–10 minutes until softened.
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
Cook 7–8 minutes until browned and no longer pink.
Drain excess grease.

Bake crust alone for 7–8 minutes until it no longer looks wet and begins to lightly brown.
Remove from oven.

Spread pizza sauce evenly over crust, reaching the edges.
Sprinkle cooked sausage evenly over sauce.
Top with shredded mozzarella.

Return to oven and bake 8–10 minutes until cheese is melted and lightly golden.
Remove and slice into 8 rectangles.
Serve warm.`,
},

{
  id: "big-shotgun-shells",
  slug: "big-shotgun-shells",
  name: "Shotgun Shells",
  effort: "big",
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

Wrap each stuffed shell tightly with bacon, covering the ends completely. (You may need two pieces of bacon per shell.)

Brush additional barbecue sauce over both sides of each wrapped shell.

Place shells on prepared rack and bake for 60 minutes.

Flip shells over, brush with more barbecue sauce, and bake an additional 60–70 minutes until bacon is crispy and cooked through.

Serve hot.`,
},

{
  id: "normal-shrimp-and-sausage-bake",
  slug: "normal-shrimp-and-sausage-bake",
  name: "Shrimp and Sausage Bake",
  effort: "normal",
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

Bake for 60–75 minutes, or until the center reaches at least 160°F and is no longer pink.

Let rest 5–10 minutes before slicing and serving.`,
},

{
  id: "normal-tilapia-asparagus-foil-packets",
  slug: "normal-tilapia-asparagus-foil-packets",
  name: "Tilapia & Asparagus Foil Packets",
  effort: "normal",
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

Carefully open packets (steam will be hot) and remove from foil before serving.`,
},

{
  id: "normal-spinach-mushroom-feta-crustless-quiche",
  slug: "normal-spinach-mushroom-feta-crustless-quiche",
  name: "Spinach Mushroom Feta Crustless Quiche",
  effort: "normal",
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
  id: "normal-slow-cooker-beef-enchilada-casserole",
  slug: "normal-slow-cooker-beef-enchilada-casserole",
  name: "Slow Cooker Beef Enchilada Casserole",
  effort: "normal",
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

Cover and cook on Low for 3–4 hours.

Stir in half of the tortilla wedges and half of the shredded cheese.
Top with remaining tortilla wedges and remaining cheese.

Cover and cook on High for about 30 minutes, or until cheese is fully melted.

Garnish with cilantro, pico de gallo, and sour cream before serving.`,
},

{
  id: "normal-slow-cooker-roast-beef",
  slug: "normal-slow-cooker-roast-beef",
  name: "Slow Cooker Roast Beef",
  effort: "normal",
  ingredients: `1 (4–5 lb) chuck roast
5 tsp kosher salt, divided
2 1/2 tsp black pepper, divided
4 tbsp olive oil, divided
2 tbsp tomato paste
1 cup beef broth
2 tsp Worcestershire sauce
6 thyme sprigs
3 rosemary sprigs
6 garlic cloves
1 yellow onion, cut into 1-inch wedges
1 lb baby yellow potatoes, halved
3 large carrots, peeled and cut into 1-inch pieces`,
  instructions: `Sprinkle the chuck roast all over with 4 teaspoons of the salt and 2 teaspoons of the pepper.

Heat 2 tablespoons of olive oil in a large skillet over medium-high heat. Sear the roast on all sides until browned, about 12–16 minutes total. Transfer to a 6 1/2-quart slow cooker.

Reduce heat to medium-low. Add tomato paste and cook, stirring constantly, until slightly darkened, about 30–60 seconds.

Add beef broth and stir to loosen browned bits from the skillet. Pour the mixture over the roast in the slow cooker.

Add Worcestershire sauce, thyme, rosemary, and garlic.

In a bowl, toss onion, potatoes, carrots with remaining olive oil, salt, and pepper. Arrange around the roast.

Cover and cook on High 6–8 hours or Low 8–10 hours until fork tender.

Serve with vegetables and spoon sauce over top before serving.`,
},

{
  id: "easy-sausage-muffins",
  slug: "easy-sausage-muffins",
  name: "Sausage Muffins",
  effort: "quick",
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
  id: "normal-caprese-stuffed-portobello-mushrooms",
  slug: "normal-caprese-stuffed-portobello-mushrooms",
  name: "Caprese Stuffed Portobello Mushrooms",
  effort: "normal",
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

In a small saucepan, combine balsamic vinegar and brown sugar. Bring to a boil, reduce heat, and simmer 5–8 minutes until thickened.

Drizzle glaze over mushrooms, top with basil, season to taste, and serve.`,
},

{
  id: "normal-shepherds-pie",
  slug: "normal-shepherds-pie",
  name: "Shepherd’s Pie",
  effort: "normal",
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

While potatoes cook, melt 4 tbsp butter in a large sauté pan over medium heat. Add onion and carrots and cook until tender, about 6–10 minutes.

Add mushrooms and garlic and cook 2–3 minutes until mushrooms soften.

Add ground beef, corn, and peas. Cook until no longer pink. Season with salt and pepper.

Stir in Worcestershire sauce and beef broth. Bring to a simmer, reduce heat to low, and cook uncovered for about 10 minutes. Add a splash more broth if needed to keep it from drying out.

Drain potatoes and place in a bowl with remaining 4 tbsp butter. Mash and season with salt and pepper to taste.

Preheat oven to 400°F. Spread beef mixture in an even layer in an 8x13 baking dish.

Spread mashed potatoes over the top. Rough up the surface with a fork to create peaks.

Bake about 30 minutes until browned and bubbling.`,
},

{
  id: "quick-garlic-roasted-potatoes",
  slug: "quick-garlic-roasted-potatoes",
  name: "Garlic Roasted Potatoes",
  effort: "quick",
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
  id: "normal-italian-sausage-stuffed-peppers",
  slug: "normal-italian-sausage-stuffed-peppers",
  name: "Italian Sausage Stuffed Peppers",
  effort: "normal",
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

Heat olive oil in a large skillet over medium-high heat. Brown sausage, breaking into small pieces, about 3–4 minutes. Drain grease if needed.

Add tomatoes, garlic powder, onion powder, Italian seasoning, Worcestershire sauce, chicken broth, and cooked rice. Stir to combine and bring to a simmer. Cook 3–4 minutes until liquid is mostly gone.

Stir in Parmesan cheese and remove from heat.

Fill pepper halves with sausage mixture and top with mozzarella.

Cover with foil and bake 25–30 minutes (or longer if you like softer peppers) until peppers are tender.

Remove foil and broil 2–3 minutes until cheese is browned.

Cool 1–2 minutes. Top with fresh basil (and red pepper flakes if desired) and serve.`,
},

{
  id: "quick-roasted-broccoli",
  slug: "quick-roasted-broccoli",
  name: "Roasted Broccoli",
  effort: "quick",
  ingredients: `1 1/2 lbs broccoli florets
1/4 cup olive oil
1 1/2 tsp kosher salt
1/2 tsp freshly ground black pepper`,
  instructions: `Place a foil-lined baking sheet on the middle rack in the oven and preheat to 425°F.

Toss broccoli with olive oil, salt, and pepper until fully coated.

Carefully spread broccoli on the hot baking sheet in an even layer, scraping any oil/seasoning from the bowl over the broccoli.

Roast 14–16 minutes, tossing halfway through, until browned and tender-crisp.

Transfer to a serving platter and serve hot.`,
},

{
  id: "quick-honey-garlic-chicken",
  slug: "quick-honey-garlic-chicken",
  name: "Honey Garlic Chicken",
  effort: "quick",
  ingredients: `4 boneless skinless chicken breasts
Salt and pepper, to taste
1/3 cup honey
1/4 cup soy sauce
4 cloves garlic, minced
1 tbsp olive oil
1 tsp cornstarch (optional, for thickening)`,
  instructions: `Season chicken with salt and pepper.

Heat olive oil in a skillet over medium heat. Cook chicken 5–6 minutes per side until cooked through. Remove and set aside.

In the same pan, add honey, soy sauce, and garlic. Simmer 2–3 minutes.

If thicker sauce is desired, stir cornstarch with 1 tbsp water and add to pan.

Return chicken to skillet and coat in sauce. Simmer 2–3 minutes and serve.`,
},

{
  id: "quick-creamy-tortellini",
  slug: "quick-creamy-tortellini",
  name: "Creamy Spinach Tortellini",
  effort: "quick",
  ingredients: `1 (20 oz) package cheese tortellini
1 cup heavy cream
1/2 cup grated Parmesan cheese
2 cloves garlic, minced
2 cups fresh spinach
Salt and pepper, to taste`,
  instructions: `Cook tortellini according to package directions. Drain.

In a skillet over medium heat, sauté garlic for 30 seconds.

Add heavy cream and simmer 3–4 minutes.

Stir in Parmesan and spinach. Cook until spinach wilts.

Add tortellini and toss to coat. Season to taste and serve.`,
},

{
  id: "quick-lemon-butter-salmon",
  slug: "quick-lemon-butter-salmon",
  name: "Lemon Butter Salmon",
  effort: "quick",
  ingredients: `4 salmon fillets
Salt and pepper, to taste
3 tbsp butter
2 cloves garlic, minced
Juice of 1 lemon
Fresh parsley (optional)`,
  instructions: `Season salmon with salt and pepper.

Melt butter in a skillet over medium heat. Add garlic and cook 30 seconds.

Place salmon skin-side down and cook 4–5 minutes per side until flaky.

Squeeze lemon juice over salmon and garnish with parsley before serving.`,
},

{
  id: "quick-chicken-fried-rice",
  slug: "quick-chicken-fried-rice",
  name: "Chicken Fried Rice",
  effort: "quick",
  ingredients: `2 cups cooked rice
1 lb cooked chicken, diced
2 eggs, beaten
1 cup frozen mixed vegetables
3 tbsp soy sauce
1 tbsp sesame oil
2 green onions, sliced`,
  instructions: `Heat sesame oil in a large skillet.

Scramble eggs and set aside.

Add vegetables and cook 2–3 minutes.

Stir in rice and chicken. Cook until heated through.

Add soy sauce and scrambled eggs. Toss well.

Top with green onions and serve.`,
},

{
  id: "quick-bbq-chicken-flatbread",
  slug: "quick-bbq-chicken-flatbread",
  name: "BBQ Chicken Flatbread",
  effort: "quick",
  ingredients: `2 flatbreads or naan
1 cup cooked chicken, shredded
1/2 cup BBQ sauce
1/2 red onion, thinly sliced
1 cup shredded mozzarella cheese`,
  instructions: `Preheat oven to 400°F.

Spread BBQ sauce over flatbreads.

Top with chicken, red onion, and mozzarella.

Bake 8–10 minutes until cheese is melted and bubbly.

Slice and serve.`,
},

{
  id: "normal-baked-ziti",
  slug: "normal-baked-ziti",
  name: "Baked Ziti",
  effort: "normal",
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

Bake 25–30 minutes until bubbly and golden.`,
},

{
  id: "normal-chicken-alfredo",
  slug: "normal-chicken-alfredo",
  name: "Chicken Alfredo",
  effort: "normal",
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

Bake 30–35 minutes until golden.`,
},

{
  id: "normal-taco-pasta",
  slug: "normal-taco-pasta",
  name: "Taco Pasta",
  effort: "normal",
  ingredients: `1 lb ground beef
1 packet taco seasoning
8 oz pasta
1 cup salsa
1 cup shredded cheddar cheese
1/2 cup sour cream`,
  instructions: `Cook pasta according to package directions.

Brown ground beef and drain grease. Stir in taco seasoning.

Add salsa and cooked pasta. Stir well.

Remove from heat and stir in sour cream and cheese.

Serve hot.`,
},
];




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
];