const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getHighLights,
} = require("../controllers/productsControllers");
const {
  getCategories,
  addNewCategory,
} = require("../controllers/categoriesControllers");
const authenticate = require("../middlewares/authMiddleware");
const authLogin = require("../controllers/authControllers");

const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get rout
route.get("/products", authenticate, getProducts);
route.get("/categories", getCategories);
route.get("/featured-products", getFeaturedProducts);
route.get("/highlights", getHighLights);

// post route
route.post("/categories", addNewCategory);

//auth route
route.post("/auth/login", authLogin);

module.exports = route;
