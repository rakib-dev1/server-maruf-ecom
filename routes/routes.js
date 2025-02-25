const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
} = require("../controllers/productsControllers");
const {
  getCategories,
  addNewCategory,
} = require("../controllers/categoriesControllers");
const authenticate = require("../middlewares/authMiddleware");
const { authLogin, authSignup } = require("../controllers/authControllers");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get rout
route.get("/products", getProducts);
route.get("/categories", getCategories);
route.get("/featured-products", getFeaturedProducts);
route.get("/highlights", getHighLights);

// post route
route.post("/add-products",authenticate, upload.array("images", 10), addNewProducts);
route.post("/categories", addNewCategory);

//auth route
route.post("/auth/login", authLogin);
route.post("/auth/signup", authSignup);

module.exports = route;
