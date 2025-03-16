const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    // Compare the password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create a JWT token with the user's details
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Return the user object and token
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token, // Send token to the user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const authSignup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await db.collection("users").findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const sessionUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log(req.body);
    const existingUser = await db.collection("users").findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const user = {
      email: email,
      name: name,
      createdAt: new Date(),
    };
    const result = await db.collection("users").insertOne(user);
    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { authLogin, authSignup, sessionUser };
