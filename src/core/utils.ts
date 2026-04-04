export const formatIngredients = (line: string, simplify = false) => {
  if (!line) return "";
  
  // 1. Handle the fraction conversion (Existing logic)
  let formatted = line
    .replace(/\.5\b/g, " 1/2")
    .replace(/\.25\b/g, " 1/4")
    .replace(/\.75\b/g, " 3/4")
    .replace(/\.33\b/g, " 1/3")
    .replace(/\.66\b/g, " 2/3")
    .replace(/\s+/g, " ")
    .trim();

  // 2. If simplify is true, strip measurements (New logic)
  if (simplify) {
    // This regex looks for numbers and common units (cups, Tbsp, oz, lbs, g, ml, etc.)
    // and removes them from the start of the string.
    const measurementRegex = /^(\d+\s*\/\s*\d+|\d+\s*\d+\s*\/\s*\d+|\d+(\.\d+)?)\s*(cups?|Tbsp|tsp|oz|ounces?|lbs?|pounds?|g|kg|ml|l|cans?|jars?|packets?|slices?|sticks?|cloves?|heads?)\s*(of\s+)?/i;
    
    // Also strip simple leading numbers (e.g., "2 onions" becomes "Onions")
    const leadingNumberRegex = /^(\d+\s*\/\s*\d+|\d+(\.\d+)?)\s*/;

    formatted = formatted.replace(measurementRegex, "").replace(leadingNumberRegex, "");
    
    // Capitalize the first letter for a clean look
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return formatted;
};