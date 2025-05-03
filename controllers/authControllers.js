const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role, // Include role in token if needed
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log(user);
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
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
      role: "user",
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const GoogleUser = async (req, res) => {
  try {
    const { email, image, name } = req.body;
    let user = await db.collection("users").findOne({ email: email });
    if (!user) {
      user = {
        email: email,
        name: name,
        image: image,
        role: "user",
        createdAt: new Date(),
      };
      const result = await db.collection("users").insertOne(user);
      user._id = result.insertedId;
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { authLogin, authSignup, GoogleUser };
