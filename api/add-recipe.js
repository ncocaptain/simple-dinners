// Example Vercel Serverless Function (Node.js)
export default async function handler(req, res) {
  // Only allow POST requests (sending data)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { title, ingredients, instructions, prepTime, cookTime } = req.body;

    // 1. Basic Validation
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. Data Formatting (Standardizing for your DB)
    const newRecipe = {
      title: title.trim(),
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split('\n'),
      instructions: Array.isArray(instructions) ? instructions : instructions.split('\n'),
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      createdAt: new Date().toISOString(),
    };

    // 3. Database Logic
    // This is where you'd call your DB (Supabase, MongoDB, etc.)
    // const savedRecipe = await db.recipes.insert(newRecipe);

    console.log('Recipe received:', newRecipe);

    return res.status(200).json({ 
      success: true, 
      message: 'Recipe added to Simple Dinners!', 
      data: newRecipe 
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}