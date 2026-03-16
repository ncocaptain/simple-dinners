export function formatIngredients(text: string): string {
  if (!text) return "";

  const fractions: Record<string, string> = {
    "0.25": "1/4",
    "0.5": "1/2",
    "0.75": "3/4",
    "0.33": "1/3",
    "0.66": "2/3"
  };

  let formattedText = text;

  Object.keys(fractions).forEach((decimal) => {
    // Removed the \\b (word boundary) so it catches 14.5 and turns it into 14 1/2
    const regex = new RegExp(decimal, "g"); 
    formattedText = formattedText.replace(regex, fractions[decimal]);
  });

  return formattedText;
}