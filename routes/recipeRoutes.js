import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  addRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addRating,
  addComment,
  toggleFavorite,
  getUserFavorites,
} from "../controllers/recipeController.js";

const router = express.Router();

// 🔹 Multer + Cloudinary setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "food-recipes",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// 🔹 Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

// ===============================
// 📌 ROUTES
// ===============================

// ✅ Add a new recipe (with image)
router.post("/add", isAuthenticated, upload.single("image"), addRecipe);

// ✅ Get all recipes
router.get("/", getRecipes);

// ✅ Get single recipe by ID
router.get("/:id", getRecipeById);

// ✅ Delete recipe
router.delete("/:id", isAuthenticated, deleteRecipe);

// ✅ Update recipe
router.put("/:id", isAuthenticated, upload.single("image"), updateRecipe);

// ✅ Add rating to recipe
router.post("/:id/rating", isAuthenticated, addRating);

// ✅ Add comment to recipe
router.post("/:id/comment", isAuthenticated, addComment);

// ✅ Toggle favorite
router.post("/:id/favorite", isAuthenticated, toggleFavorite);

// ✅ Get user favorites
router.get("/favorites", isAuthenticated, getUserFavorites);

export default router;
