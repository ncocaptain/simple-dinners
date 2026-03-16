export async function scrapeRecipe(url: string) {
  try {
    // Using a free proxy to bypass CORS for the demo
    // In a production app, you might use a dedicated API like Spoonacular or a custom backend
    const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
    const response = await fetch(proxyUrl);
    const data = await response.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');

    let recipeData: any = null;

    jsonLdScripts.forEach(script => {
      const json = JSON.parse(script.innerHTML);
      // JSON-LD can be a single object or an array
      const search = Array.isArray(json) ? json : [json];
      const found = search.find(obj => obj["@type"] === "Recipe" || obj["@graph"]?.some((inner: any) => inner["@type"] === "Recipe"));
      
      if (found) {
        recipeData = found["@type"] === "Recipe" ? found : found["@graph"].find((inner: any) => inner["@type"] === "Recipe");
      }
    });

    if (!recipeData) throw new Error("No recipe data found on this page.");

    return {
      name: recipeData.name,
      ingredients: Array.isArray(recipeData.recipeIngredient) 
        ? recipeData.recipeIngredient.join('\n') 
        : recipeData.recipeIngredient,
      instructions: Array.isArray(recipeData.recipeInstructions)
        ? recipeData.recipeInstructions.map((step: any) => step.text || step).join('\n')
        : recipeData.recipeInstructions,
      photoUrl: Array.isArray(recipeData.image) ? recipeData.image[0] : recipeData.image?.url || recipeData.image
    };
  } catch (error) {
    console.error("Scraper Error:", error);
    return null;
  }
}