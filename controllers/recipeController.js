import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

export const addRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, category, cookingTime } = req.body;

    // Validate required fields
    if (!title || !ingredients || !instructions || !category) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const recipe = new Recipe({
      title: title.trim(),
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
      category,
      cookingTime: cookingTime ? parseInt(cookingTime) : 0,
      image: req.file?.path || "",
      createdBy: req.user._id,
    });

    await recipe.save();
    res.status(201).json({ success: true, message: "Recipe added successfully", recipe });
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getRecipes = async (req, res) => {
  try {
    const { category, search, ingredients, cookingTime, rating, page = 1, limit = 10 } = req.query;
    console.log('Recipe GET / request:', { category, search, ingredients, cookingTime, rating, page, limit });
    let filter = {};

    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };
    if (ingredients) filter.ingredients = { $regex: ingredients, $options: "i" };
    if (cookingTime) filter.cookingTime = { $lte: parseInt(cookingTime) };
    if (rating) {
      // Filter recipes with average rating >= rating
      const minRating = parseFloat(rating);
      filter.$expr = { $gte: [{ $avg: "$ratings.rating" }, minRating] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const recipes = await Recipe.find(filter)
      .populate("createdBy", "name")
      .populate("ratings.user", "name")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recipe.countDocuments(filter);
    console.log('Fetched recipes count:', recipes.length);
    res.json({
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getRecipes:', error);
    res.status(500).json({ message: "Failed to fetch recipes", error: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("ratings.user", "name")
      .populate("comments.user", "name");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipe" });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, category, cookingTime } = req.body;

    // Check ownership
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this recipe" });
    }

    const updatedData = {
      title,
      ingredients,
      instructions,
      category,
      cookingTime: cookingTime || recipe.cookingTime,
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    res.status(500).json({ message: "Error updating recipe" });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this recipe" });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting recipe" });
  }
};

// New functions for ratings, comments, favorites
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Remove existing rating by user
    recipe.ratings = recipe.ratings.filter(r => r.user.toString() !== req.user._id.toString());
    // Add new rating
    recipe.ratings.push({ user: req.user._id, rating: parseInt(rating) });
    await recipe.save();

    res.json({ message: "Rating added successfully", averageRating: recipe.averageRating });
  } catch (error) {
    res.status(500).json({ message: "Error adding rating" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    recipe.comments.push({ user: req.user._id, comment });
    await recipe.save();

    await recipe.populate("comments.user", "name");
    res.json({ message: "Comment added successfully", comments: recipe.comments });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.id;

    const index = user.favorites.indexOf(recipeId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: "Removed from favorites", isFavorite: false });
    } else {
      user.favorites.push(recipeId);
      await user.save();
      res.json({ message: "Added to favorites", isFavorite: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Error toggling favorite" });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites" });
  }
};
