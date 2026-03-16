export function formatIngredients(text: string): string {
  if (!text) return "";

  const fractions: Record<string, string> = {
    "0.25": "1/4",
    "0.5": "1/2",
    "0.75": "3/4",
    "0.33": "1/3",
  };

  let lines = text.split('\n');
  
  const formattedLines = lines.map(line => {
    let updatedLine = line;
    
    Object.keys(fractions).forEach((decimal) => {
      // REGEX EXPLANATION:
      // ^${decimal} -> Matches 0.5 if it's at the very start of the line
      // \\s${decimal}\\s -> Matches 0.5 if it has spaces on both sides
      const startRegex = new RegExp(`^${decimal}`, "g");
      const middleRegex = new RegExp(`\\s${decimal}\\s`, "g");

      updatedLine = updatedLine.replace(startRegex, fractions[decimal]);
      updatedLine = updatedLine.replace(middleRegex, ` ${fractions[decimal]} `);
    });

    return updatedLine;
  });

  return formattedLines.join('\n');
}