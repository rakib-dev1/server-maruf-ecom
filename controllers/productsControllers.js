const { db } = require("../config/db");

const getProducts = async (req, res) => {
  try {
    const { category, subcategory } = req.query; // Added 'title' to the query parameters
    let filter = {};
    console.log(category, subcategory); // Added title for logging

    // Check for category and subcategory
    if (category) {
      filter["category.label"] = { $regex: new RegExp(category, "i") };
    }
    if (subcategory) {
      filter["category.subcategory.label"] = {
        $regex: new RegExp(subcategory, "i"),
      };
    }

    // Check for title

    // Fetch the products based on the filter
    const products = await db.collection("products").find(filter).toArray();

    // Send the found products as the response
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getHighLights = async (req, res) => {
  try {
    const { category } = req.query;
    console.log(category);
    const highlights = await db
      .collection("highlight")
      .find({ category: category })
      .toArray();
    res.json(highlights);
  } catch (error) {
    console.error("Error fetching highlights:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getProducts, getFeaturedProducts, getHighLights };
