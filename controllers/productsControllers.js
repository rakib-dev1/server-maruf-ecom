const multer = require("multer");
const { db } = require("../config/db");
const ImageKit = require("imagekit");
const { post } = require("../routes/routes");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const addNewProducts = async (req, res) => {
  try {
    const {
      title,
      description,
      sizes,
      tags,
      price,
      stock,
      discount,
      categories,
      subcategories,
    } = req.body;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    let imageUrls = [];
    for (const file of files) {
      const uploadedImage = await imagekit.upload({
        file: file.buffer.toString("base64"),
        fileName: file.originalname,
      });
      imageUrls.push(uploadedImage.url);
    }
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
    const optimizeTitle = `${title
      .toLowerCase()
      .replace(/ /g, "-")}-${randomNumber}`;

    const product = {
      title: optimizeTitle,
      description,
      sizes,
      tags,
      postedAt: new Date(),
      price: parseFloat(price),
      stock: parseInt(stock),
      discount: parseInt(discount),
      category: {
        label: categories,
        subcategory: { label: subcategories },
      },
      images: imageUrls,
    };
    console.log(product);
    const result = await db.collection("products").insertOne(product);
    res.status(201).json({ message: "Product added successfully", result });
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const { title } = req.params;
    console.log(title);
    let filter = {};

    if (title) {
      filter = { title: decodeURIComponent(title) }; // Decode title and use it in filter
    }

    const products = await db
      .collection("products")
      .find(filter)
      .sort({ postedAt: -1 })
      .toArray();

    if (title && products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

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

const testApi = (req, res) => {
  res.send("API is working");
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
  testApi,
};
