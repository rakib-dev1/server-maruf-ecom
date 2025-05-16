const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
  getRecommendedProducts,
  searchTags,
  postReview,
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
  GoogleUser,
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
  getOrderDetails,
} = require("../controllers/userControllers");
const {
  updateDeliveryStatus,
  getAllCustomers,
} = require("../controllers/adminControllers");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const route = express.Router();
route.get("/", (req, res) => res.send("FMLIO Server is running..😘"));

// get route
route.get("/products/:title", getProducts);
route.get("/products/", getProducts);
route.get("/categories", getCategories);
route.get("/featured-products", getFeaturedProducts);
route.get("/highlights", getHighLights);
route.get("/cart", authMiddleware, getCartItems);
route.get("/search", searchTags);
route.get("/recommend", getRecommendedProducts);
route.get("/orders", authMiddleware, getOrders);
route.get("/order-details/:id", authMiddleware, getOrderDetails);
route.get("/users", authMiddleware, getUser);
route.get("/customers", authMiddleware, verifyAdmin, getAllCustomers);
// post route
route.post(
  "/add-products",
  authMiddleware,
  verifyAdmin,
  upload.array("images", 10),
  addNewProducts
);
route.post("/cart", authMiddleware, addToCart);
route.post("/categories", authMiddleware, verifyAdmin, addNewCategory);
route.post("/order", authMiddleware, orderConfirmItems);
route.post(
  "/review-post",
  authMiddleware,
  upload.array("images", 5),
  postReview
);

//auth route
route.post("/auth/login", authLogin);
route.post("/auth/signup", authSignup);
route.post("/auth/google", GoogleUser);

// patch route
route.patch("/update-user", authMiddleware, upload.single("image"), updateUser);
route.patch(
  "/delivery-status",
  authMiddleware,
  verifyAdmin,
  updateDeliveryStatus
);
// delete route
route.delete("/cart", authMiddleware, removeCartItems);

module.exports = route;
