export function formatIngredients(text: string): string {
  if (!text) return "";
  const fractions: Record<string, string> = {
    "0.25": "1/4", "0.5": "1/2", "0.75": "3/4", "0.33": "1/3", "0.66": "2/3"
  };
  let updated = text;
  Object.keys(fractions).forEach(dec => {
    // This regex finds the decimal even if it's not surrounded by spaces
    const reg = new RegExp(dec, "g");
    updated = updated.replace(reg, fractions[dec]);
  });
  return updated;
}