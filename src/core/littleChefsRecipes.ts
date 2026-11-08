import type { Meal } from "./types";

/**
 * Little Chefs: quick recipes that children and their grown-ups can make together.
 * This collection is part of ALL_RECIPES but is excluded from DINNER_RECIPES /
 * PLANNER_RECIPES to avoid suggesting desserts as Smart Week dinners.
 * Source PNGs are kept in recipe-image-source; images:all builds .jpg and .webp.
 */
export const LITTLE_CHEFS_RECIPES: Meal[] = [
  {
    id: "little-chefs-apple-pie-cup",
    slug: "little-chefs-apple-pie-cup",
    photoUrl: "/images/little-chefs-apple-pie-cup.jpg",
    name: "Apple Pie in a Cup",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","quick","dessert","no-bake","vegetarian","apple"],
    isVegetarian: true,
    ingredients: "4 graham cracker sheets\n1 can (21 oz) ready-to-eat apple pie filling\n1 cup whipped cream\n1/4 tsp ground cinnamon",
    instructions: "Grown-up: Open the apple pie filling and cut large apple chunks into smaller bites if needed.\nLittle chef: Put 1 graham cracker sheet in a sealed bag and gently crush it into crumbs.\nLittle chef: Pour the crumbs into the bottom of your cup. Repeat for all 4 cups.\nLittle chef: Spoon 2 to 3 spoonfuls of apple pie filling over each crumb layer.\nLittle chef: Top with whipped cream and sprinkle with cinnamon. Enjoy!",
    notes: "Inspired by Aurelia’s classroom visual recipe! No baking needed. Grown-ups open the can and check apple sizes; little chefs crush, layer, and sprinkle.",
    translations: {
      es: {
        name: "Pay de manzana en vasito",
        ingredients: "4 láminas de galleta graham\n1 lata (21 oz) de relleno de pay de manzana listo para comer\n1 taza de crema batida\n1/4 tsp de canela molida",
        instructions: "Adulto: Abre la lata de relleno de manzana y corta los trozos grandes en bocados pequeños si es necesario.\nPequeño chef: Coloca 1 lámina de galleta graham en una bolsa cerrada y tritúrala suavemente.\nPequeño chef: Vierte las migas en el fondo de tu vasito. Repite para los 4 vasitos.\nPequeño chef: Agrega 2 a 3 cucharadas de relleno de manzana sobre las migas.\nPequeño chef: Termina con crema batida y una pizca de canela. ¡A disfrutar!",
        notes: "¡Inspirado en una receta visual de la escuela de Aurelia! No necesita horno. Un adulto abre la lata y revisa el tamaño de la manzana; los pequeños chefs trituran, forman capas y espolvorean.",
        tags: ["pequeños chefs","niños","apto para niños","postre","rápido"],
      },
    },
  },
  {
    id: "little-chefs-strawberry-shortcake-cups",
    slug: "little-chefs-strawberry-shortcake-cups",
    photoUrl: "/images/little-chefs-strawberry-shortcake-cups.jpg",
    name: "Strawberry Shortcake Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","quick","dessert","no-bake","vegetarian","strawberry"],
    isVegetarian: true,
    ingredients: "1 package (10 oz) ready-to-eat pound cake\n2 cups strawberries, washed and diced\n1 cup whipped cream",
    instructions: "Grown-up: Wash, hull, and dice the strawberries into small pieces. Cut the pound cake into bite-size cubes.\nLittle chef: Put a few cake cubes in the bottom of each of 4 cups.\nLittle chef: Add a layer of strawberries and a spoonful of whipped cream.\nLittle chef: Repeat the layers and finish with a few strawberries on top.\nServe right away or refrigerate until dessert time.",
    notes: "An easy, no-bake dessert for kids to stack and decorate. Grown-ups handle knives and fruit preparation.",
    translations: {
      es: {
        name: "Vasitos de pastel con fresas",
        ingredients: "1 paquete (10 oz) de panqué listo para comer\n2 tazas de fresas lavadas y picadas\n1 taza de crema batida",
        instructions: "Adulto: Lava, limpia y corta las fresas en trozos pequeños. Corta el panqué en cubitos.\nPequeño chef: Coloca unos cubitos de panqué en el fondo de cada uno de los 4 vasitos.\nPequeño chef: Agrega una capa de fresas y una cucharada de crema batida.\nPequeño chef: Repite las capas y termina con unas fresas encima.\nSirve de inmediato o refrigera hasta la hora del postre.",
        notes: "Un postre sin hornear, fácil de formar por capas y decorar. Los adultos se encargan del cuchillo y de preparar la fruta.",
        tags: ["pequeños chefs","niños","apto para niños","postre","rápido"],
      },
    },
  },
  {
    id: "little-chefs-banana-pudding-cups",
    slug: "little-chefs-banana-pudding-cups",
    photoUrl: "/images/little-chefs-banana-pudding-cups.jpg",
    name: "Banana Pudding Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","quick","dessert","no-bake","vegetarian","banana"],
    isVegetarian: true,
    ingredients: "4 ready-to-eat vanilla pudding snack cups\n2 ripe bananas\n16 vanilla wafer cookies\n1 cup whipped cream",
    instructions: "Grown-up: Peel and slice the bananas into small pieces appropriate for your child's age.\nLittle chef: Put 2 vanilla wafer cookies in the bottom of each of 4 cups.\nLittle chef: Add a spoonful of vanilla pudding, then a few banana pieces.\nLittle chef: Add 2 more wafers and repeat the pudding and banana layers.\nLittle chef: Top each cup with whipped cream. Serve soon or chill until ready to eat.",
    notes: "Use four ready-to-eat vanilla pudding snack cups (one per dessert). Kids layer cookies, pudding, and banana while grown-ups cut the fruit.",
    translations: {
      es: {
        name: "Vasitos de pudín de plátano",
        ingredients: "4 vasitos individuales de pudín de vainilla listo para comer\n2 plátanos maduros\n16 galletas de vainilla tipo wafer\n1 taza de crema batida",
        instructions: "Adulto: Pela y corta los plátanos en trozos pequeños apropiados para la edad del niño.\nPequeño chef: Coloca 2 galletas de vainilla en el fondo de cada uno de los 4 vasitos.\nPequeño chef: Agrega una cucharada de pudín de vainilla y después unos trocitos de plátano.\nPequeño chef: Agrega otras 2 galletas y repite las capas de pudín y plátano.\nPequeño chef: Termina cada vasito con crema batida. Sirve pronto o refrigera hasta comer.",
        notes: "Usa cuatro vasitos individuales de pudín listo para comer (uno por postre). Los niños forman capas; los adultos cortan la fruta.",
        tags: ["pequeños chefs","niños","apto para niños","postre","rápido"],
      },
    },
  },
  {
    id: "little-chefs-yogurt-parfait-cups",
    slug: "little-chefs-yogurt-parfait-cups",
    photoUrl: "/images/little-chefs-yogurt-parfait-cups.jpg",
    name: "Yogurt Parfait Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","quick","breakfast","snack","no-bake","vegetarian","fruit"],
    isVegetarian: true,
    ingredients: "2 cups vanilla yogurt\n1 cup strawberries, washed and diced\n1 cup blueberries, washed\n1/2 cup granola, optional",
    instructions: "Grown-up: Wash the fruit, dice the strawberries, and cut blueberries into age-appropriate pieces for younger children.\nLittle chef: Spoon a layer of yogurt into the bottom of each of 4 clear cups.\nLittle chef: Add a colorful layer of strawberries and blueberries.\nLittle chef: Repeat the yogurt and berry layers until the cups are filled.\nLittle chef: Add a little granola just before serving, if using. Enjoy cold!",
    notes: "A colorful breakfast or snack kids can build themselves. Grown-ups prepare fruit safely; check granola for allergens and avoid hard clusters for younger children.",
    translations: {
      es: {
        name: "Vasitos de parfait de yogur",
        ingredients: "2 tazas de yogur de vainilla\n1 taza de fresas lavadas y picadas\n1 taza de arándanos lavados\n1/2 taza de granola, opcional",
        instructions: "Adulto: Lava la fruta, corta las fresas y parte los arándanos en trozos apropiados para los niños más pequeños.\nPequeño chef: Coloca una capa de yogur en el fondo de cada uno de los 4 vasitos transparentes.\nPequeño chef: Agrega una capa colorida de fresas y arándanos.\nPequeño chef: Repite las capas de yogur y fruta hasta llenar los vasitos.\nPequeño chef: Agrega un poquito de granola justo antes de servir, si se usa. ¡Disfruta frío!",
        notes: "Un desayuno o merienda colorido que los niños pueden preparar. Un adulto corta la fruta de manera segura; revisa los alérgenos y evita trozos duros de granola para los más pequeños.",
        tags: ["pequeños chefs","niños","apto para niños","desayuno","merienda","rápido"],
      },
    },
  },
  {
    id: "little-chefs-walking-taco-cups",
    slug: "little-chefs-walking-taco-cups",
    photoUrl: "/images/little-chefs-walking-taco-cups.jpg",
    name: "Walking Taco Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","quick","lunch","snack","tacos","beef","family-friendly"],
    isVegetarian: false,
    ingredients: "1 lb ground beef\n1 packet taco seasoning\n2/3 cup water\n2 cups corn chips\n1 cup shredded cheddar cheese\n1 cup shredded lettuce\n1 medium tomato, diced\n1/2 cup mild salsa\n1/2 cup sour cream",
    instructions: "Grown-up: Cook the ground beef in a skillet over medium heat until browned and fully cooked. Drain excess grease, add taco seasoning and water, and simmer according to package directions.\nGrown-up: Let the taco meat cool until warm rather than hot; dice the tomato and prepare the toppings.\nLittle chef: Put a handful of corn chips in the bottom of each of 4 sturdy cups.\nLittle chef: With grown-up help, spoon some warm taco meat over the chips.\nLittle chef: Add shredded cheese, lettuce, tomato, salsa, and sour cream—choose your favorite toppings!\nMix gently with a spoon and enjoy. Grown-ups should help younger children with crunchy chips and bite sizes.",
    notes: "A build-your-own savory Little Chefs recipe! Adult handles the stove and hot meat; kids layer the cooled toppings in cups. Crush or skip hard chips for younger children as appropriate.",
    translations: {
      es: {
        name: "Vasitos de tacos para armar",
        ingredients: "1 lb de carne molida de res\n1 paquete de sazonador para tacos\n2/3 taza de agua\n2 tazas de totopos de maíz\n1 taza de queso cheddar rallado\n1 taza de lechuga rallada\n1 tomate mediano, picado\n1/2 taza de salsa suave\n1/2 taza de crema agria",
        instructions: "Adulto: Cocina la carne molida en un sartén a fuego medio hasta que esté bien cocida. Escurre la grasa, agrega el sazonador y el agua, y cocina según las instrucciones del paquete.\nAdulto: Deja enfriar la carne hasta que esté tibia, no caliente; corta el tomate y prepara los ingredientes.\nPequeño chef: Coloca un puñado de totopos en el fondo de cada uno de los 4 vasitos resistentes.\nPequeño chef: Con ayuda de un adulto, agrega un poco de carne tibia sobre los totopos.\nPequeño chef: Agrega queso, lechuga, tomate, salsa y crema agria. ¡Elige tus ingredientes favoritos!\nMezcla suavemente con una cuchara y disfruta. Los adultos ayudan a los más pequeños con los totopos crujientes y el tamaño de los bocados.",
        notes: "¡Una receta salada para armar! Un adulto maneja la estufa y la carne caliente; los niños forman capas con ingredientes tibios o fríos. Tritura u omite los totopos duros para niños pequeños según corresponda.",
        tags: ["pequeños chefs","niños","apto para niños","almuerzo","tacos","rápido"],
      },
    },
  },
  {
    id: "little-chefs-chocolate-dirt-cups",
    slug: "little-chefs-chocolate-dirt-cups",
    photoUrl: "/images/little-chefs-chocolate-dirt-cups.jpg",
    name: "Chocolate Dirt Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","quick","dessert","no-bake","chocolate"],
    isVegetarian: false,
    ingredients: "4 ready-to-eat chocolate pudding snack cups\n8 chocolate sandwich cookies\n4 gummy worms, optional",
    instructions: "Grown-up: Place the sandwich cookies in a sealed bag and help crush them into fine crumbs.\nLittle chef: Spoon the pudding from 1 ready-to-eat snack cup into each of 4 clear dessert cups.\nLittle chef: Sprinkle the cookie crumbs over each pudding cup to make the 'dirt'.\nLittle chef: If you're old enough for gummy candy, decorate the top with a gummy worm.\nServe right away or refrigerate until dessert time.",
    notes: "No-bake fun! Buy 4 ready-to-eat chocolate pudding snack cups (one per dessert). Gummy candy can be a choking hazard for young children; omit gummy worms for little ones. Check packaging for allergens.",
    translations: {
      es: {
        name: "Vasitos de tierra de chocolate",
        ingredients: "4 vasitos individuales de pudín de chocolate listo para comer\n8 galletas sándwich de chocolate\n4 gomitas en forma de gusano, opcional",
        instructions: "Adulto: Coloca las galletas sándwich en una bolsa cerrada y ayuda a triturarlas en migas finas.\nPequeño chef: Vierte el pudín de 1 vasito individual en cada uno de los 4 vasitos transparentes para el postre.\nPequeño chef: Espolvorea las migas sobre el pudín para formar la 'tierra'.\nPequeño chef: Si tienes edad suficiente para comer gomitas, decora con una gomita en forma de gusano.\nSirve enseguida o refrigera hasta la hora del postre.",
        notes: "¡Diversión sin hornear! Compra 4 vasitos individuales de pudín de chocolate (uno por postre). Las gomitas pueden causar atragantamiento en niños pequeños; omítelas para los más pequeños. Revisa los alérgenos.",
        tags: ["pequeños chefs","niños","apto para niños","postre","rápido"],
      },
    },
  },
];
