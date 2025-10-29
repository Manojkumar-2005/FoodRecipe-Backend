import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import "./config/passport.js"; // load passport strategy

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("🍳 Food Recipe API is running successfully!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

app.use(
  cors({
    origin: ["https://foodrecipe-frontend-ez61.onrender.com"],
    credentials: true,
  })
);
