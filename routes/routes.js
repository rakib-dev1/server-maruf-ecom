const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
  getRecommendedProducts,
  searchTags,
} = require("../controllers/productsControllers");
const {
  getCategories,
  addNewCategory,
} = require("../controllers/categoriesControllers");
const {
  authMiddleware,
  verifyAdmin,
} = require("../middlewares/authMiddleware");
const {
  authLogin,
  authSignup,
  sessionUser,
} = require("../controllers/authControllers");
const multer = require("multer");
const {
  addToCart,
  getCartItems,
  removeCartItems,
  orderConfirmItems,
  getOrders,
  getUser,
  updateUser,
} = require("../controllers/userControllers");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const route = express.Router();
route.get("/", (req, res) => res.send("Maruf Ecom Server is running..😘"));

// get route
route.get("/products/:title", getProducts);
route.get("/products/", getProducts);
route.get("/categories", getCategories);
route.get("/featured-products", getFeaturedProducts);
route.get("/highlights", getHighLights);
route.get("/cart", getCartItems);
route.get("/search", searchTags);
route.get("/recommend", getRecommendedProducts);
route.get("/orders", authMiddleware, getOrders);
route.get("/users", authMiddleware, getUser);
// post route
route.post(
  "/add-products",
  authMiddleware,
  verifyAdmin,
  upload.array("images", 10),
  addNewProducts
);
route.post("/cart", addToCart);
route.post("/categories", addNewCategory);
route.post("/order", orderConfirmItems);

//auth route
route.post("/auth/login", authLogin);
route.post("/auth/signup", authSignup);
route.post("/auth/session", sessionUser);

// delete route
route.delete("/cart", removeCartItems);
// patch route
route.patch("/update-user", upload.single("image"), updateUser);

module.exports = route;
