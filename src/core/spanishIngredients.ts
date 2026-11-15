// Internal grocery normalization only. Recipe text, inventory names and saved
// source wording stay in their original language. All aliases are exact food
// identities demonstrated by the built-in bilingual catalog (see test fixture).
export const SPANISH_GROCERY_ALIASES: ReadonlyArray<{
  englishName: string;
  aliases: readonly string[];
}> = [
  { englishName: "salt", aliases: ["sal"] },
  { englishName: "black pepper", aliases: ["pimienta negra", "pimienta"] },
  { englishName: "olive oil", aliases: ["aceite de oliva"] },
  { englishName: "garlic", aliases: ["ajo"] },
  { englishName: "garlic powder", aliases: ["ajo en polvo"] },
  { englishName: "onion powder", aliases: ["cebolla en polvo"] },
  { englishName: "onion", aliases: ["cebolla", "cebollas"] },
  { englishName: "yellow onion", aliases: ["cebolla amarilla", "cebollas amarillas"] },
  { englishName: "red onion", aliases: ["cebolla roja", "cebolla morada"] },
  { englishName: "white onion", aliases: ["cebolla blanca"] },
  { englishName: "green onion", aliases: ["cebollin", "cebollines"] },
  { englishName: "tomato", aliases: ["tomate", "tomates"] },
  { englishName: "cherry tomatoes", aliases: ["tomates cherry"] },
  { englishName: "diced tomatoes", aliases: ["tomates en cubitos", "tomates cortados en cubitos"] },
  { englishName: "fire roasted diced tomatoes", aliases: ["tomates asados en cubitos"] },
  { englishName: "crushed tomatoes", aliases: ["tomates triturados"] },
  { englishName: "tomato sauce", aliases: ["salsa de tomate"] },
  { englishName: "tomato paste", aliases: ["pasta de tomate"] },
  { englishName: "corn", aliases: ["maiz"] },
  { englishName: "milk", aliases: ["leche"] },
  { englishName: "whole milk", aliases: ["leche entera"] },
  { englishName: "butter", aliases: ["mantequilla"] },
  { englishName: "heavy cream", aliases: ["crema espesa", "crema para batir"] },
  { englishName: "sour cream", aliases: ["crema agria"] },
  { englishName: "cream cheese", aliases: ["queso crema"] },
  { englishName: "cheddar cheese", aliases: ["queso cheddar"] },
  { englishName: "shredded cheddar cheese", aliases: ["queso cheddar rallado"] },
  { englishName: "shredded mozzarella cheese", aliases: ["queso mozzarella rallado"] },
  { englishName: "mozzarella cheese", aliases: ["queso mozzarella"] },
  { englishName: "grated parmesan cheese", aliases: ["queso parmesano rallado", "queso parmesano recien rallado"] },
  { englishName: "parmesan cheese", aliases: ["queso parmesano"] },
  { englishName: "feta cheese", aliases: ["queso feta"] },
  { englishName: "ricotta cheese", aliases: ["queso ricotta"] },
  { englishName: "egg", aliases: ["huevo", "huevos"] },
  { englishName: "rice", aliases: ["arroz"] },
  { englishName: "white rice", aliases: ["arroz blanco"] },
  { englishName: "brown rice", aliases: ["arroz integral"] },
  { englishName: "egg noodles", aliases: ["fideos de huevo"] },
  { englishName: "chicken broth", aliases: ["caldo de pollo"] },
  { englishName: "beef broth", aliases: ["caldo de res"] },
  { englishName: "vegetable broth", aliases: ["caldo de verduras"] },
  { englishName: "black beans", aliases: ["frijoles negros"] },
  { englishName: "pinto beans", aliases: ["frijoles pintos"] },
  { englishName: "kidney beans", aliases: ["frijoles rojos"] },
  { englishName: "chickpeas", aliases: ["garbanzos"] },
  { englishName: "chicken breast", aliases: ["pechuga de pollo", "pechugas de pollo"] },
  { englishName: "chicken thigh", aliases: ["muslos de pollo"] },
  { englishName: "ground beef", aliases: ["carne molida de res"] },
  { englishName: "ground turkey", aliases: ["pavo molido"] },
  { englishName: "bacon", aliases: ["tocino"] },
  { englishName: "potato", aliases: ["papa", "papas"] },
  { englishName: "baby potatoes", aliases: ["papas baby"] },
  { englishName: "sweet potato", aliases: ["camote", "camotes"] },
  { englishName: "carrot", aliases: ["zanahoria", "zanahorias"] },
  { englishName: "red bell pepper", aliases: ["pimiento rojo"] },
  { englishName: "green bell pepper", aliases: ["pimiento verde"] },
  { englishName: "yellow bell pepper", aliases: ["pimiento amarillo"] },
  { englishName: "cucumber", aliases: ["pepino"] },
  { englishName: "romaine lettuce", aliases: ["lechuga romana"] },
  { englishName: "fresh spinach", aliases: ["espinaca fresca"] },
  { englishName: "cilantro", aliases: ["cilantro fresco"] },
  { englishName: "parsley", aliases: ["perejil", "perejil fresco"] },
  { englishName: "dried parsley", aliases: ["perejil seco"] },
  { englishName: "dried thyme", aliases: ["tomillo seco"] },
  { englishName: "dried rosemary", aliases: ["romero seco"] },
  { englishName: "dried oregano", aliases: ["oregano seco"] },
  { englishName: "fresh ginger", aliases: ["jengibre fresco"] },
  { englishName: "ground cumin", aliases: ["comino", "comino molido"] },
  { englishName: "cinnamon", aliases: ["canela", "canela molida"] },
  { englishName: "smoked paprika", aliases: ["paprika ahumada"] },
  { englishName: "chili powder", aliases: ["chile en polvo"] },
  { englishName: "red pepper flakes", aliases: ["hojuelas de chile rojo"] },
  { englishName: "cayenne pepper", aliases: ["pimienta de cayena"] },
  { englishName: "italian seasoning", aliases: ["sazonador italiano", "condimento italiano"] },
  { englishName: "taco seasoning", aliases: ["sazonador para tacos"] },
  { englishName: "flour", aliases: ["harina", "harina para todo uso"] },
  { englishName: "sugar", aliases: ["azucar"] },
  { englishName: "brown sugar", aliases: ["azucar morena"] },
  { englishName: "cornstarch", aliases: ["maicena"] },
  { englishName: "honey", aliases: ["miel"] },
  { englishName: "soy sauce", aliases: ["salsa de soya"] },
  { englishName: "worcestershire sauce", aliases: ["salsa worcestershire"] },
  { englishName: "bbq sauce", aliases: ["salsa barbecue"] },
  { englishName: "apple cider vinegar", aliases: ["vinagre de manzana"] },
  { englishName: "rice vinegar", aliases: ["vinagre de arroz"] },
  { englishName: "sesame oil", aliases: ["aceite de sesamo", "aceite de ajonjoli"] },
  { englishName: "vegetable oil", aliases: ["aceite vegetal"] },
  { englishName: "sesame seeds", aliases: ["semillas de sesamo"] },
  { englishName: "mayonnaise", aliases: ["mayonesa"] },
  { englishName: "yellow mustard", aliases: ["mostaza amarilla"] },
  { englishName: "dijon mustard", aliases: ["mostaza dijon"] },
  { englishName: "vanilla extract", aliases: ["extracto de vainilla"] },
  { englishName: "baking powder", aliases: ["polvo para hornear"] },
  { englishName: "baking soda", aliases: ["bicarbonato de sodio"] },
  { englishName: "marinara sauce", aliases: ["salsa marinara"] },
  { englishName: "cream of chicken soup", aliases: ["crema de pollo"] },
  { englishName: "mushrooms", aliases: ["champinones"] },
  { englishName: "baby bella mushrooms", aliases: ["champinones baby bella"] },
  { englishName: "balsamic glaze", aliases: ["glaseado balsamico"] },
  { englishName: "flour tortillas", aliases: ["tortillas de harina"] },
  { englishName: "corn tortillas", aliases: ["tortillas de maiz"] },
  { englishName: "avocado", aliases: ["aguacate"] },
  { englishName: "celery", aliases: ["apio"] },
  { englishName: "celery stalk", aliases: ["tallos de apio"] },
  { englishName: "cream of mushroom soup", aliases: ["crema de champinones"] },
  { englishName: "green chiles", aliases: ["chiles verdes"] },
  { englishName: "chili seasoning", aliases: ["sazonador para chili"] },
  { englishName: "chili beans", aliases: ["frijoles para chili"] },
  { englishName: "frozen mixed vegetables", aliases: ["verduras mixtas congeladas"] },
  { englishName: "frozen peas", aliases: ["chicharos congelados"] },
  { englishName: "broccoli", aliases: ["brocoli", "floretes de brocoli"] },
  { englishName: "zucchini", aliases: ["calabacin"] },
  { englishName: "croutons", aliases: ["crutones"] },
  { englishName: "refrigerated biscuits", aliases: ["biscuits refrigerados"] },
  { englishName: "crescent roll dough", aliases: ["masa refrigerada para crescent rolls"] },
  { englishName: "hamburger buns", aliases: ["panes para hamburguesa"] },
  { englishName: "hot dog buns", aliases: ["panes para hot dog"] },
  { englishName: "green beans", aliases: ["ejotes"] },
  { englishName: "fresh green beans", aliases: ["ejotes frescos"] },
  { englishName: "ground pork", aliases: ["carne molida de cerdo"] },
  { englishName: "ground lamb", aliases: ["carne molida de cordero"] },
  { englishName: "chicken", aliases: ["pollo"] },
  { englishName: "cooked chicken", aliases: ["pollo cocido"] },
  { englishName: "cooked shredded chicken", aliases: ["pollo cocido deshebrado"] },

  { englishName: "frozen corn", aliases: ["maiz congelado"] },
  { englishName: "lime", aliases: ["lima"] },
  { englishName: "lime juice", aliases: ["jugo de lima"] },

  { englishName: "gochujang", aliases: ["gochujang"] },
  { englishName: "sparkling water", aliases: ["agua mineral con gas"] },
  { englishName: "bell pepper", aliases: ["pimiento morron", "pimientos"] },

  { englishName: "long grain white rice", aliases: ["arroz blanco de grano largo"] },
  { englishName: "white beans", aliases: ["frijoles blancos"] },
  { englishName: "fire-roasted tomatoes", aliases: ["tomates rostizados"] },
  { englishName: "diced tomatoes with green chiles", aliases: ["tomates en cubitos con chiles verdes"] },
  { englishName: "coconut milk", aliases: ["leche de coco"] },
  { englishName: "full-fat coconut milk", aliases: ["leche de coco entera"] },
  { englishName: "ranch seasoning mix", aliases: ["mezcla ranch", "sazonador ranch"] },
  { englishName: "cheese tortellini", aliases: ["tortellini de queso"] },
  { englishName: "shelf-stable potato gnocchi", aliases: ["gnocchi de papa estable en estante"] },
  { englishName: "frozen fully cooked meatballs", aliases: ["albondigas congeladas completamente cocidas"] },
  { englishName: "frozen diced hash brown potatoes", aliases: ["papas hash brown congeladas en cubitos"] },
  { englishName: "condensed tomato soup", aliases: ["sopa de tomate condensada"] },

  { englishName: "fried eggs", aliases: ["huevos fritos"] },
  { englishName: "soft-boiled eggs", aliases: ["huevos pasados por agua"] },

];

export function normalizeSpanishKey(value: string) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\s+/g, " ").trim();
}
const aliases = new Map(SPANISH_GROCERY_ALIASES.flatMap(entry =>
  entry.aliases.map(alias => [alias, entry.englishName] as const)));

// Keep product modifiers (fresh/frozen/dried, meat species/cut, tomato form)
// intact. These rules remove only quantity-size and preparation grammar.
export function spanishNameCandidates(value: string): string[] {
  let name = normalizeSpanishKey(value).replace(/^de\s+/, "");
  if (hasSpanishIngredientChoice(name)) return [];
  name = name.replace(/\ben cubos\b/g, "en cubitos").replace(/\([^)]*\)/g, " ").trim().replace(/^de\s+/, "")
    .replace(/,\s*(?:(?:finamente|recien)\s+)?(?:picad[oa]s?|rebanad[oa]s?|rallad[oa]s?|escurrid[oa]s?|pelad[oa]s?|cortad[oa]s?|batid[oa]s?|suavizad[oa]s?|derretid[oa]s?|desmoronad[oa]s?|en rodajas|en rebanadas|en cub(?:os|itos)|aplastad[oa]s?|cocid[oa]s?|sin escurrir|con sus jugos|mantenido caliente|preferiblemente|partid[oa]s?)\b.*$/, "")
    .replace(/,?\s*(?:opcional|(?:mas )?(?:extra )?al gusto|mas extra para servir|mas extra para barnizar|para servir|dividid[oa]s?)\b.*$/, "")
    .replace(/\b(?:pequen[oa]s?|median[oa]s?|grandes?)\b/g, " ")
    .replace(/\bsin hueso y sin piel\b/g, " ")
    .replace(/\s+/g, " ").trim();
  const candidates = [name, name.replace(/\s+(?:(?:finamente|recien)\s+)?(?:picad[oa]s?|rallad[oa]s?|derretid[oa]s?|escurrid[oa]s?|suave|sin sal)$/, "").trim()];
  // Regular inflections may resolve only to a documented Spanish alias,
  // never to an arbitrary similar English word.
  if (/^[a-z]+$/.test(name)) {
    for (const form of [name + "s", name + "es", name.replace(/(?:es|s)$/, "")]) {
      if (aliases.has(form)) candidates.push(form);
    }
  }
  return candidates;
}

export function hasSpanishIngredientChoice(value: string): boolean {
  const name = normalizeSpanishKey(value).replace(/\b(?:picad[oa]s?|rebanad[oa]s?)\s+o\s+(?:rallad[oa]s?|picad[oa]s?)\b/g, "");
  if (/(?:^|[\s,(])o\s/.test(name)) return true;
  if (!/[a-z]\s*\/\s*[a-z]/.test(name)) return false;
  return name.split(/\s*\/\s*/).some(part => aliases.has(part.replace(/^de\s+/, "")) || /\b(?:queso|crema|frijoles|limon)\b/.test(part));
}

export function spanishGroceryName(value: string): string | null {
  for (const candidate of spanishNameCandidates(value)) {
    const name = aliases.get(candidate);
    if (name) return name;
  }
  return null;
}

// These are lexical unit aliases, not conversions or inferred package sizes.
export const SPANISH_UNITS: Record<string, string> = {
  taza: "cup", tazas: "cups", cucharada: "Tbsp", cucharadas: "Tbsp",
  cucharadita: "tsp", diente: "clove", dientes: "cloves",
  lata: "can", latas: "cans", paquete: "package", paquetes: "packages",
  frasco: "jar", frascos: "jars", cabeza: "head", rebanada: "slice", rebanadas: "slices", tiras: "strips",
  manojo: "bunch", bolsa: "bag", bolsas: "bags",
};
const UNIT_PREFIX = /^(cup|cups|tbsp|tsp|oz|lb|g|kg|ml|l|cloves?|cans?|packages?|boxes?|jars?|heads?|quart|slices?|strips?|bunches?|bags?|tazas?|cucharadas?|cucharaditas?|dientes?|latas?|paquetes?|frascos?|cabezas?|rebanadas?|tiras?|manojos?|bolsas?)\b\s*/i;
const AMOUNT_PREFIX = /^(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*(?:-|–|to|a)\s*(?:\d+\/\d+|\d+(?:\.\d+)?))?\s*/;

export type SpanishIngredientNormalization = { text: string; recognized: boolean; processWater?: boolean; knownProduct?: boolean; productName?: string };
export function normalizeSpanishIngredientLine(value: string, knownEnglish?: (name: string) => string | null): SpanishIngredientNormalization {
  const original = String(value || "");
  let text = normalizeSpanishKey(original);
  const size = text.match(/\(([^)]*\d[^)]*\b(?:oz|lb|g|kg|ml|l)\b[^)]*)\)/);
  if (size) text = text.replace(size[0], " ").replace(/\s+/g, " ").trim();
  const amount = text.match(AMOUNT_PREFIX)?.[0] || "";
  if (amount) text = text.slice(amount.length).trim();
  const unit = text.match(UNIT_PREFIX)?.[1] || "";
  if (unit) text = text.replace(UNIT_PREFIX, "");
  const name = text.replace(/^de\s+/, "");
  let english = spanishGroceryName(name);
  // English loanwords after Spanish grammar use the existing registry rather
  // than duplicating every canonical English name in a translation table.
  if (!english && knownEnglish && /^de\s+/.test(text)) {
    for (const candidate of spanishNameCandidates(name)) {
      english = knownEnglish(candidate);
      if (english) break;
    }
  }
  if (!english && hasSpanishIngredientChoice(name)) {
    let found = false;
    const parts = name.split(/\s+o\s+|\s*\/\s*(?=[a-z])/).map(part => {
      const translated = spanishGroceryName(part.replace(/,$/, ""));
      if (translated) found = true;
      return translated || part;
    });
    if (found) english = parts.join(" o ");
  }
  const processWater = name.replace(/,.*$/, "").split(/\s+o\s+/).every(part =>
    /^(?:agua(?: fria| caliente| tibia)?|agua reservada(?: de (?:la pasta|los fideos))?|hielo(?: triturado)?)$/.test(part));
  const spanishUnit = spanishUnitAlias(unit);
  const selfAlias = english && spanishNameCandidates(name).some(candidate => normalizeSpanishKey(english!) === candidate);
  if (selfAlias && !spanishUnit && !/^de\s+/.test(text)) return { text: original, recognized: false, productName: name };
  if (!english && !processWater && !spanishUnit) return { text: original, recognized: false, productName: name };
  const product = english || (processWater ? "water" : name);
  const optional = /\bopcional\b/.test(name) ? ", optional" : "";
  const taste = /\bal gusto\b/.test(name) ? ", to taste" : "";
  return { recognized: true, processWater, knownProduct: Boolean(english), productName: product, text: [amount.trim().replace(/\s+a\s+/, " to "), spanishUnit || unit, size?.[0], product + optional + taste].filter(Boolean).join(" ") };
}

// Matching-only unit interpretation; callers must not rewrite stored units.
export function spanishUnitForMatching(value: string | null | undefined) {
  if (!value) return value;
  return spanishUnitAlias(normalizeSpanishKey(value)) || value;
}

function spanishUnitAlias(value: string) {
  return SPANISH_UNITS[value] || SPANISH_UNITS[value + "s"] || SPANISH_UNITS[value.replace(/s$/, "")];
}
