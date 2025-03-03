const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
  testApi,
} = require("../controllers/productsControllers");
const {
  getCategories,
  addNewCategory,
} = require("../controllers/categoriesControllers");

const { authLogin, authSignup } = require("../controllers/authControllers");
const multer = require("multer");
const protect = require("../middlewares/authMiddleware");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get rout
route.get("/products/:title", getProducts);
route.get("/products/", getProducts);
route.get("/categories", getCategories);
route.get("/featured-products", getFeaturedProducts);
route.get("/highlights", getHighLights);
route.get("/test", protect, testApi);

// post route
route.post(
  "/add-products",

  upload.array("images", 10),
  addNewProducts
);
route.post("/categories", addNewCategory);

//auth route
route.post("/auth/login", authLogin);
route.post("/auth/signup", authSignup);

module.exports = route;
