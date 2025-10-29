import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: String,
  email: String,
  image: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});

export default mongoose.model("User", userSchema);
