const express = require("express");
const { getProducts } = require("../controllers/placesControllers");
const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get route
route.get("/products", getProducts);

module.exports = route;
