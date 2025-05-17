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

//   //! single product api working api?title=Shoe
//   //! tags query api working api?tags=Shoe For Women,red
//   //! category and subcategory api working api?category=shoes&subcategory=sneakers
//   //! only category api working api?category=shoes

const getProducts = async (req, res) => {
  try {
    const { title } = req.params;
    const { tags, category, subcategory, maxPrice, rating, color } = req.query;

    let filter = {};

    if (title) {
      filter.title = { $regex: new RegExp(title, "i") };
    }

    if (tags) {
      const tagsArray = tags.split(",").map((tag) => tag.trim());
      filter.$or = tagsArray.map((tag) => ({
        tags: { $regex: new RegExp(`^${tag}$`, "i") },
      }));
    }

    if (category) {
      filter["category.href"] = category;
    }

    if (subcategory) {
      filter["category.subcategory.label"] = subcategory;
    }

    if (maxPrice) {
      filter.price = { $lte: parseFloat(maxPrice) };
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (color && color !== "all") {
      filter.color = { $regex: new RegExp(`^${color}$`, "i") };
    }

    const products = await db
      .collection("products")
      .aggregate([
        { $match: filter },
        { $sort: { postedAt: -1 } },
        {
          $addFields: {
            _idStr: { $toString: "$_id" },
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_idStr",
            foreignField: "productId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $round: [{ $avg: "$reviews.rating" }, 2] },
                null,
              ],
            },
          },
        },
        {
          $project: {
            _idStr: 0,
          },
        },
      ])
      .toArray();

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

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Find products where tags or title contain the query (case-insensitive search)
    const searchResults = await db
      .collection("products")
      .find({
        $or: [
          { tags: { $elemMatch: { $regex: query, $options: "i" } } },
          { title: { $regex: query, $options: "i" } },
        ],
      })
      .toArray();

    if (searchResults.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    const matchingTags = [];
    const matchingTitles = [];

    // Loop through products and collect matching tags and titles
    searchResults.forEach((product) => {
      if (product.title.toLowerCase().includes(query.toLowerCase())) {
        matchingTitles.push(product.title); // Add the title to the array
      }
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          matchingTags.push(tag); // Add the tag to the array
        }
      });
    });

    // Remove duplicates by converting the arrays to Sets
    const uniqueTags = [...new Set(matchingTags)];
    const uniqueTitles = [...new Set(matchingTitles)];

   
    const sortByQueryMatch = (a, b) => {
      const aIndex = a.toLowerCase().indexOf(query.toLowerCase());
      const bIndex = b.toLowerCase().indexOf(query.toLowerCase());

      if (aIndex === bIndex) {
      
        return a.localeCompare(b);
      }
      return aIndex - bIndex;
    };

    uniqueTags.sort(sortByQueryMatch);
    uniqueTitles.sort(sortByQueryMatch);

    // Return the sorted unique matching tags and titles
    res.json({ matchingTags: uniqueTags, matchingTitles: uniqueTitles });
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
const postReview = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { userName, userEmail, productId, review, rating } = req.body;
    const files = req.files;
    let imageUrls = [];
    for (const file of files) {
      const uploadedImage = await imagekit.upload({
        file: file.buffer.toString("base64"),
        fileName: file.originalname,
      });

      imageUrls.push(uploadedImage.url);
    }
    const reviewData = {
      productId,
      rating: parseInt(rating),
      userName,
      userEmail,
      review,
      images: imageUrls,
      postedAt: new Date(),
    };
    console.log("Review data:", reviewData);

    const result = await db.collection("reviews").insertOne(reviewData);
    res.status(201).json({ message: "Review added successfully", result });
  } catch (error) {
    console.error("Error adding review:", error);
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
  postReview,
};
