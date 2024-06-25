const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/iSourcing-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Schema for User
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  username: String,
  contactInfo: String,
  profilePicture: String,
});

const User = mongoose.model("User", userSchema);

// Multer Storage Configuration for Profile Pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Routes

// 1. Registration API
app.post("/api/register", upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email, username, contactInfo } = req.body;
    const profilePicture = req.file ? req.file.filename : "";

    // Create new user
    const newUser = new User({
      name,
      email,
      username,
      contactInfo,
      profilePicture,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register user" });
  }
});

// 2. View Registration Data API
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-__v"); // Exclude version key
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// 3. Update Registration User Data API
app.put("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateFields = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// 4. Delete User API
app.delete("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
