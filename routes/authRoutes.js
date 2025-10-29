import express from "express";
import passport from "passport";

const router = express.Router();

// Step 1: Redirect user to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://foodrecipe-frontend-ez61.onrender.com/dashboard",
    failureRedirect: "https://foodrecipe-frontend-ez61.onrender.com/login",
  })
);

// Step 3: Get logged-in user info
router.get("/user", async (req, res) => {
  try {
    console.log('Auth /user request:', { 
      isAuthenticated: req.isAuthenticated(), 
      userId: req.user ? req.user.id : null,
      sessionId: req.sessionID 
    });
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error in /auth/user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Step 4: Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173/login");
  });
});

export default router;
