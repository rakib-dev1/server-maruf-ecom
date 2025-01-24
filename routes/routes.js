const express = require("express");
const { getProducts } = require("../controllers/productsControllers");
const { getCategories } = require("../controllers/categoriesControllers");
const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get route
route.get("/products", getProducts);
route.get("/categories", getCategories);

module.exports = route;
