// Already correct and reusable ✅
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const verifyAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Error verifying admin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { authMiddleware, verifyAdmin };
