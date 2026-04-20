export async function scrapeRecipe(url: string) {
  try {
    // This uses the AllOrigins 'get' bridge which is more stable for HTTPS sites
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Bridge connection failed");

    const data = await response.json();
    const html = data.contents; // AllOrigins wraps the result in a 'contents' string

    if (!html) throw new Error("No data returned from bridge");

    // --- 1. FAST-TRACK (Regex search) ---
    const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    // ... rest of your existing logic ...
    
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[1]);
        const search = Array.isArray(json) ? json : [json];
        const found = search.find((obj: any) => 
          obj["@type"] === "Recipe" || 
          obj["@graph"]?.some((inner: any) => inner["@type"] === "Recipe")
        );
        
        const recipeData = found?.["@type"] === "Recipe" 
          ? found 
          : found?.["@graph"]?.find((inner: any) => inner["@type"] === "Recipe");

        if (recipeData) {
          return {
            name: recipeData.name,
            ingredients: Array.isArray(recipeData.recipeIngredient) 
              ? recipeData.recipeIngredient.join('\n') : recipeData.recipeIngredient,
            instructions: Array.isArray(recipeData.recipeInstructions)
              ? recipeData.recipeInstructions.map((step: any) => step.text || step).join('\n') : recipeData.recipeInstructions,
            photoUrl: Array.isArray(recipeData.image) ? recipeData.image[0] : recipeData.image?.url || recipeData.image
          };
        }
      } catch (e) { /* Regex match failed, moving to DOM parser */ }
    }

    // --- 2. SLOW FALLBACK (Full DOM Parser) ---
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    let fallbackData: any = null;

    jsonLdScripts.forEach(script => {
      try {
        const json = JSON.parse(script.innerHTML);
        const search = Array.isArray(json) ? json : [json];
        const found = search.find((obj: any) => 
          obj["@type"] === "Recipe" || 
          obj["@graph"]?.some((inner: any) => inner["@type"] === "Recipe")
        );
        if (found) {
          fallbackData = found["@type"] === "Recipe" ? found : found["@graph"].find((inner: any) => inner["@type"] === "Recipe");
        }
      } catch (e) { /* ignore */ }
    });

    if (fallbackData) {
      return {
        name: fallbackData.name,
        ingredients: Array.isArray(fallbackData.recipeIngredient) 
          ? fallbackData.recipeIngredient.join('\n') : fallbackData.recipeIngredient,
        instructions: Array.isArray(fallbackData.recipeInstructions)
          ? fallbackData.recipeInstructions.map((step: any) => step.text || step).join('\n') : fallbackData.recipeInstructions,
        photoUrl: Array.isArray(fallbackData.image) ? fallbackData.image[0] : fallbackData.image?.url || fallbackData.image
      };
    }

    // --- 3. META TAG FALLBACK ---
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    
    if (ogTitle) {
      return {
        name: ogTitle,
        ingredients: "Scraper found the title, but couldn't reach the ingredients list. You may need to paste them manually.",
        instructions: "",
        photoUrl: ogImage || ""
      };
    }

    throw new Error("No data found.");
  } catch (error) {
    console.error("Scraper Error:", error);
    return null;
  }
}