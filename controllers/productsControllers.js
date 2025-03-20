const { db } = require("../config/db");
const ImageKit = require("imagekit");

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
  //! single product api working api?title=Shoe
  //! tags query api working api?tags=Shoe For Women,red
  //! category and subcategory api working api?category=shoes&subcategory=sneakers
  //! only category api working api?category=shoes

  try {
    const { title } = req.params;
    const { tags, category, subcategory } = req.query;
    console.log(title, tags, category, subcategory);

    let filter = {};

    if (title) {
      filter.title = title;
    }

    if (tags) {
      const tagsArray = tags.split(",").map((tag) => tag.trim());
      filter.$or = tagsArray.map((tag) => ({
        tags: { $regex: new RegExp(`^${tag}$`, "i") }, // Case-insensitive match
      }));
    }

    if (category) {
      filter["category.label"] = category;
    }

    if (subcategory) {
      filter["category.subcategory.label"] = subcategory;
    }

    const products = await db.collection("products").find(filter).toArray();

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
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

//search tag api
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
        tags: { $elemMatch: { $regex: query, $options: "i" } },
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

    // Remove duplicates by converting the array to a Set
    const uniqueTags = [...new Set(matchingTags)];

    // Sort unique tags based on the first occurrence of the query and then alphabetically
    uniqueTags.sort((a, b) => {
      const aIndex = a.toLowerCase().indexOf(query.toLowerCase());
      const bIndex = b.toLowerCase().indexOf(query.toLowerCase());

      // First compare by the index of the match
      if (aIndex === bIndex) {
        // If both match at the same position, then sort alphabetically
        return a.localeCompare(b);
      }
      return aIndex - bIndex; // Ascending order based on the first match
    });

    // Return the sorted unique matching tags
    res.json({ matchingTags: uniqueTags });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// recommended products api

const getRecommendedProducts = async (req, res) => {
  try {
    const { tags } = req.query;
    const tagsArray = tags?.split(",");
    const products = await db
      .collection("products")
      .find({
        tags: { $in: tagsArray },
      })
      .toArray();
    if (products?.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found matching the tags" });
    }
    res.json(products);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getHighLights,
  addNewProducts,
  searchTags,
  getRecommendedProducts,
};
