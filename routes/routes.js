const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getHighLights,
} = require("../controllers/productsControllers");
const { getCategories } = require("../controllers/categoriesControllers");
const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get route
route.get("/products", getProducts);
route.get("/categories", getCategories);
route.get("/featured-products", getFeaturedProducts);
route.get("/highlights", getHighLights);

module.exports = route;
