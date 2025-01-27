const { db } = require("../config/db");

const getProducts = async (req, res) => {
  const products = await db.collection("products").find().toArray();
  res.json(products);
};

const getFeaturedProducts = async (req, res) => {
  const categories = [
    "mens-shopping",
    "womens-fashion",
    "watch",
    "jewellery",
    "ladies-bag",
    "accessories",
    "shoes",
  ];
  const featuredProducts = [];
  for (const category of categories) {
    const product = await db
      .collection("products")
      .findOne({ "category.label": category });
    if (product) {
      featuredProducts.push(product);
    }
  }
  res.json(featuredProducts);
};
module.exports = { getProducts, getFeaturedProducts };
