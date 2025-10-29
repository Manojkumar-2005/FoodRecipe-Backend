import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import "./config/passport.js"; // Passport strategy

dotenv.config();
connectDB();

const app = express();

// ✅ CORS configuration (only once)
app.use(
  cors({
    origin: [
      "https://foodrecipe-frontend-ez61.onrender.com",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("🍳 Food Recipe API is running successfully!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
