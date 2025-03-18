const multer = require("multer");
const { db } = require("../config/db");
const ImageKit = require("imagekit");
const { post } = require("../routes/routes");
const fakeProducts = require("../data/fakeproducts.json");

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
    const formattedTitle = `${title
      .toLowerCase()
      .replace(/[,./']/g, "")
      .replace(/\s+/g, "-")}`;
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== "");
    // const optimizeTitle = `${title.toLowerCase().replace(/ /g, "-")}`;
    if (imageUrls) {
      const product = {
        title: formattedTitle,
        description,
        sizes,
        tags: tagsArray,
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
      const result = await db.collection("products").insertOne(product);
      res.status(201).json({ message: "Product added successfully", result });
    } else {
      res.status(400).json({ message: "Image not uploaded" });
    }
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const { title } = req.params; // Title search from params
    const { category, subCategory } = req.query; // Category and subcategory from query
    console.log(req.query);
    console.log(subCategory);

    let filter = {};
    if (title) {
      filter.title = decodeURIComponent(title); // Decode title for accurate matching
    }
    if (category) {
      filter["category.label"] = decodeURIComponent(category);
    }
    if (subCategory) {
      filter["category.subcategory.label"] = decodeURIComponent(subCategory);
    } else if (category) {
      // If category is provided but no subcategory, filter only by category
      filter["category.subcategory.label"] = { $exists: true }; // Optional filter, can be removed if not needed
    }

    const products = await db
      .collection("products")
      .find(filter)
      .sort({ postedAt: -1 }) // Sort by the most recent products
      .toArray();

    if ((title || category || subCategory) && products.length === 0) {
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

const searchTags = async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query);

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Find products where tags contain the query (case-insensitive search)
    const searchResults = await db
      .collection("products")
      .find({
        tags: { $elemMatch: { $regex: query, $options: "i" } }, // Case-insensitive regex search on tags
      })
      .toArray();

    if (searchResults.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Extract matching tag names
    const matchingTags = [];

    // Loop through products and collect matching tags
    searchResults.forEach((product) => {
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          matchingTags.push(tag); // Add the tag to the array
        }
      });
    });

    // Sort matching tags based on the first occurrence of the query and then alphabetically
    matchingTags.sort((a, b) => {
      const aIndex = a.toLowerCase().indexOf(query.toLowerCase());
      const bIndex = b.toLowerCase().indexOf(query.toLowerCase());

      // First compare by the index of the match
      if (aIndex === bIndex) {
        // If both match at the same position, then sort alphabetically
        return a.localeCompare(b);
      }
      return aIndex - bIndex; // Ascending order based on the first match
    });

    // Return the sorted matching tags
    res.json({ matchingTags });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
  testApi,
  searchTags,
};
