/**
 * Converts decimal strings (0.5, 0.25, 0.75, 0.33) 
 * into pretty kitchen fractions (1/2, 1/4, 3/4, 1/3).
 */
export function formatIngredients(text: string): string {
  if (!text) return "";

  const fractions: Record<string, string> = {
    "0.25": "1/4",
    "0.5": "1/2",
    "0.50": "1/2",
    "0.75": "3/4",
    "0.33": "1/3",
    "0.66": "2/3",
    "1.5": "1 1/2",
    "1.25": "1 1/4",
    "2.5": "2 1/2",
  };

  let formattedText = text;

  // Use a regex to find numbers in the text
  Object.keys(fractions).forEach((decimal) => {
    // This looks for the decimal as a whole word/number
    const regex = new RegExp(`\\b${decimal}\\b`, "g");
    formattedText = formattedText.replace(regex, fractions[decimal]);
  });

  return formattedText;
}