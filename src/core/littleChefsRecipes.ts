import type { Meal } from "./types";

/**
 * Little Chefs: small, hands-on recipes for children and a supervising adult.
 * Do not add these to DINNER_RECIPES/PLANNER_RECIPES: they are not Smart Week dinner candidates.
 * Photos will be added separately after approval; SafeRecipeImage shows an icon in the meantime.
 */
export const LITTLE_CHEFS_RECIPES: Meal[] = [
  {
    id: "little-chefs-apple-pie-cup",
    slug: "little-chefs-apple-pie-cup",
    name: "Apple Pie in a Cup",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","dessert","no-bake","quick","vegetarian"],
    isVegetarian: true,
    ingredients: "4 graham cracker sheets\n1 can (21 oz) ready-to-eat apple pie filling\n1 cup whipped cream\n1/4 tsp ground cinnamon",
    instructions: "Grown-up: Open the apple pie filling, and cut any large apple pieces into smaller, easy-to-eat bites.\nLittle chef: Place 1 graham cracker sheet in a sealed bag and gently crush it with your hands or a rolling pin.\nLittle chef: Pour the graham cracker crumbs into the bottom of your cup.\nLittle chef: Spoon 2 to 3 generous spoonfuls of apple pie filling over the crumbs.\nLittle chef: Add a dollop of whipped cream and a little sprinkle of cinnamon. Enjoy right away!",
    notes: "Inspired by a classroom visual recipe. No oven needed! Kids can crush, layer, and sprinkle; a grown-up should open the can and help size the apple pieces. The filling can may make more than four cups.",
    translations: {
      es: {
        name: "Pay de Manzana en Vasito",
        tags: ["pequeños chefs","niños","apto para niños","postre","sin hornear","rápido","vegetariano"],
        ingredients: "4 galletas graham completas\n1 lata (21 oz) de relleno para pay de manzana listo para comer\n1 taza de crema batida\n1/4 tsp de canela molida",
        instructions: "Adulto: Abre el relleno de manzana y corta los trozos grandes en pedacitos fáciles de comer.\nPequeño chef: Coloca 1 galleta graham en una bolsa cerrada y tritúrala suavemente con las manos o un rodillo.\nPequeño chef: Vierte las migas de galleta en el fondo de tu vasito.\nPequeño chef: Agrega de 2 a 3 cucharadas generosas de relleno de manzana sobre las migas.\nPequeño chef: Termina con un poco de crema batida y una pizca de canela. ¡A disfrutar!",
        notes: "Inspirado en una receta visual del salón de clases. ¡Sin horno! Los niños pueden triturar, formar capas y espolvorear; un adulto debe abrir la lata y cortar los trozos grandes de manzana. Puede sobrar relleno.",
      },
    },
  },
  {
    id: "little-chefs-strawberry-shortcake-cups",
    slug: "little-chefs-strawberry-shortcake-cups",
    name: "Strawberry Shortcake Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","dessert","no-bake","quick","vegetarian","strawberry"],
    isVegetarian: true,
    ingredients: "2 cups ready-to-eat pound cake, cubed\n2 cups strawberries, washed and diced\n1 cup whipped cream",
    instructions: "Grown-up: Wash, hull, and dice the strawberries into small pieces; cut the pound cake into bite-size cubes.\nLittle chef: Place a few cake cubes in the bottom of each of 4 cups.\nLittle chef: Add a layer of strawberries and a spoonful of whipped cream.\nLittle chef: Repeat the layers until the cups are filled, finishing with strawberries.\nServe immediately, or refrigerate until it's time for dessert.",
    notes: "A no-bake dessert for little hands: layer, scoop, and decorate. Grown-ups handle the knife and fruit prep.",
    translations: {
      es: {
        name: "Vasitos de Pastel con Fresas",
        tags: ["pequeños chefs","niños","apto para niños","postre","sin hornear","rápido","vegetariano","fresas"],
        ingredients: "2 tazas de panqué listo para comer, en cubos\n2 tazas de fresas lavadas y picadas\n1 taza de crema batida",
        instructions: "Adulto: Lava, quita las hojas y corta las fresas en pedacitos; corta el panqué en cubos pequeños.\nPequeño chef: Pon algunos cubitos de panqué en el fondo de cada uno de 4 vasitos.\nPequeño chef: Agrega una capa de fresas y una cucharada de crema batida.\nPequeño chef: Repite las capas hasta llenar los vasitos y termina con fresas.\nSirve enseguida o refrigera hasta la hora del postre.",
        notes: "Un postre sin hornear para manitas pequeñas: hacer capas, servir y decorar. Los adultos se encargan del cuchillo y la preparación de las frutas.",
      },
    },
  },
  {
    id: "little-chefs-rainbow-yogurt-parfaits",
    slug: "little-chefs-rainbow-yogurt-parfaits",
    name: "Rainbow Yogurt Parfaits",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","breakfast","snack","no-bake","quick","vegetarian","fruit"],
    isVegetarian: true,
    ingredients: "2 cups vanilla yogurt\n1 cup strawberries, diced\n1/2 cup blueberries\n1/2 cup diced ripe mango\n1/2 cup granola, optional",
    instructions: "Grown-up: Wash the fruit, chop strawberries and mango into small pieces, and halve blueberries for younger children as needed.\nLittle chef: Scoop a layer of yogurt into each of 4 clear cups.\nLittle chef: Add a colorful layer of strawberries, blueberries, and mango.\nLittle chef: Repeat the yogurt and fruit layers until the cups are full.\nSprinkle granola on top just before serving, if using. Enjoy cold!",
    notes: "A colorful breakfast or snack kids can assemble. Grown-ups prep fruit into age-appropriate sizes; check granola ingredients for allergens.",
    translations: {
      es: {
        name: "Parfaits Arcoíris de Yogur",
        tags: ["pequeños chefs","niños","apto para niños","desayuno","merienda","sin hornear","rápido","vegetariano","fruta"],
        ingredients: "2 tazas de yogur de vainilla\n1 taza de fresas picadas\n1/2 taza de arándanos azules\n1/2 taza de mango maduro picado\n1/2 taza de granola, opcional",
        instructions: "Adulto: Lava la fruta, corta las fresas y el mango en pedacitos y parte los arándanos por la mitad para los más pequeños cuando sea necesario.\nPequeño chef: Sirve una capa de yogur en cada uno de 4 vasos transparentes.\nPequeño chef: Agrega una capa colorida de fresas, arándanos y mango.\nPequeño chef: Repite las capas de yogur y fruta hasta llenar los vasos.\nSi usas granola, agrégala justo antes de servir. ¡Disfruta frío!",
        notes: "Un desayuno o merienda colorida que los niños pueden preparar. Los adultos cortan la fruta según la edad; revisa los alérgenos de la granola.",
      },
    },
  },
  {
    id: "little-chefs-banana-roll-up-bites",
    slug: "little-chefs-banana-roll-up-bites",
    name: "Banana Roll-Up Bites",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","snack","no-bake","quick","vegetarian","banana"],
    isVegetarian: true,
    ingredients: "4 small flour tortillas\n4 Tbsp softened cream cheese\n2 ripe bananas\n1/2 cup strawberries, finely diced",
    instructions: "Grown-up: Wash and finely dice the strawberries; cut each banana in half lengthwise.\nLittle chef: Spread 1 Tbsp cream cheese over each tortilla with a butter knife or spoon.\nLittle chef: Place half a banana and some chopped strawberries near one edge of each tortilla.\nLittle chef: Roll each tortilla tightly around the fruit.\nGrown-up: Cut the rolls into bite-size pinwheels appropriate for the child's age. Serve right away.",
    notes: "Kids spread and roll; grown-ups do the cutting. Serve as bite-size pieces with supervision.",
    translations: {
      es: {
        name: "Rollitos de Plátano en Bocaditos",
        tags: ["pequeños chefs","niños","apto para niños","merienda","sin hornear","rápido","vegetariano","plátano"],
        ingredients: "4 tortillas pequeñas de harina\n4 Tbsp de queso crema suave\n2 plátanos maduros\n1/2 taza de fresas bien picadas",
        instructions: "Adulto: Lava y corta las fresas en pedacitos; parte cada plátano a lo largo en dos.\nPequeño chef: Unta 1 Tbsp de queso crema sobre cada tortilla con un cuchillo sin filo o una cuchara.\nPequeño chef: Coloca medio plátano y un poco de fresa picada cerca de un borde de cada tortilla.\nPequeño chef: Enrolla bien cada tortilla alrededor de la fruta.\nAdulto: Corta los rollitos en bocaditos del tamaño adecuado para la edad del niño. Sirve de inmediato.",
        notes: "Los niños untan y enrollan; los adultos cortan. Sirve en bocaditos pequeños con supervisión.",
      },
    },
  },
  {
    id: "little-chefs-mini-pizza-makers",
    slug: "little-chefs-mini-pizza-makers",
    name: "Mini Pizza Makers",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","lunch","snack","pizza","quick","vegetarian"],
    isVegetarian: true,
    ingredients: "4 English muffins, split\n1/2 cup pizza sauce\n1 cup shredded mozzarella cheese\n1/2 cup finely chopped bell peppers or other vegetables, optional\n1 tsp olive oil",
    instructions: "Grown-up: Preheat the oven to 400°F and line a baking sheet; split the English muffins and chop any vegetable toppings.\nLittle chef: Place the 8 muffin halves cut-side up on the baking sheet and brush lightly with olive oil.\nLittle chef: Spread pizza sauce over each half, then add mozzarella and the toppings you like.\nGrown-up: Bake for 8 to 10 minutes, until the cheese is bubbling and the edges are golden.\nGrown-up: Let the mini pizzas cool to a safe eating temperature before serving.",
    notes: "A fun build-your-own lunch. Little chefs choose toppings and assemble their pizzas; a grown-up manages the hot oven and tray.",
    translations: {
      es: {
        name: "Minipizzas para Pequeños Chefs",
        tags: ["pequeños chefs","niños","apto para niños","almuerzo","merienda","pizza","rápido","vegetariano"],
        ingredients: "4 panecillos ingleses (English muffins), partidos por la mitad\n1/2 taza de salsa para pizza\n1 taza de queso mozzarella rallado\n1/2 taza de pimientos u otras verduras finamente picados, opcional\n1 tsp de aceite de oliva",
        instructions: "Adulto: Precalienta el horno a 400°F y prepara una bandeja; parte los panecillos por la mitad y pica las verduras.\nPequeño chef: Coloca las 8 mitades con el lado cortado hacia arriba en la bandeja y úntalas ligeramente con aceite de oliva.\nPequeño chef: Extiende salsa para pizza, agrega mozzarella y los ingredientes que más te gusten.\nAdulto: Hornea de 8 a 10 minutos, hasta que el queso burbujee y los bordes estén dorados.\nAdulto: Deja enfriar las minipizzas hasta que se puedan comer sin quemarse.",
        notes: "Un almuerzo divertido para armar a tu gusto. Los pequeños chefs eligen ingredientes y preparan sus pizzas; un adulto maneja el horno y la bandeja calientes.",
      },
    },
  },
  {
    id: "little-chefs-chocolate-dirt-cups",
    slug: "little-chefs-chocolate-dirt-cups",
    name: "Chocolate Dirt Cups",
    servings: 4,
    effort: "quick",
    tags: ["little-chefs","kids","kid-friendly","dessert","no-bake","quick","vegetarian","chocolate"],
    isVegetarian: true,
    ingredients: "4 cups prepared chocolate pudding\n8 chocolate sandwich cookies\n4 gummy worms, optional for older children",
    instructions: "Grown-up: Put the sandwich cookies in a sealed bag and help crush them into crumbs.\nLittle chef: Scoop 1 cup of prepared chocolate pudding into each of 4 clear cups.\nLittle chef: Sprinkle cookie crumbs over the pudding to make the 'dirt'.\nLittle chef: Decorate each cup with a gummy worm, if using and appropriate for the child's age.\nServe right away, or refrigerate until dessert time.",
    notes: "A silly, no-bake treat kids can assemble. Gummy candies are a choking hazard for young children—omit them for little ones. Use already prepared pudding.",
    translations: {
      es: {
        name: "Vasitos de Tierra de Chocolate",
        tags: ["pequeños chefs","niños","apto para niños","postre","sin hornear","rápido","vegetariano","chocolate"],
        ingredients: "4 tazas de pudín de chocolate ya preparado\n8 galletas sándwich de chocolate\n4 gomitas en forma de gusano, opcionales para niños mayores",
        instructions: "Adulto: Coloca las galletas de chocolate en una bolsa cerrada y ayuda a triturarlas.\nPequeño chef: Pon 1 taza de pudín de chocolate preparado en cada uno de 4 vasitos transparentes.\nPequeño chef: Espolvorea las migas de galleta sobre el pudín para crear la 'tierra'.\nPequeño chef: Decora cada vasito con una gomita de gusano, si se usa y es apropiada para su edad.\nSirve enseguida o refrigera hasta la hora del postre.",
        notes: "Un postre divertido, sin hornear, que los niños pueden armar. Las gomitas pueden causar atragantamiento en niños pequeños: omítelas para los más pequeños. Usa pudín ya preparado.",
      },
    },
  },
];
