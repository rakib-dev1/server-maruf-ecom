const jwt = require("jsonwebtoken");
require("dotenv").config();

const users = [{ id: 1, email: "admin@mail.com", password: "admin" }];

const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ id: user.id, name: user.email, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = authLogin;
