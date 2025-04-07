const { db } = require("../config/db");
// const getCategories = async (req, res) => {
//   try {
//     const { category,subcategory } = req.query; // Get category from query params

//     if (category) {
//       const categoryData = await db
//         .collection("categories")
//         .findOne({ label: category });
//       if (categoryData) {
//         return res.json(categoryData.subcategories); // Return only subcategories
//       } else {
//         return res.status(404).json({ message: "Category not found" });
//       }
//     } // If no category is provided, return all categories
//     const categories = await db.collection("categories").find().toArray();
//     res.json(categories);
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
// Add a new category
const getCategories = async (req, res) => {
  try {
    const { category } = req.query;
    console.log(category);
    if (category) {
      const result = await db
        .collection("categories")
        .findOne({ href: category });

      if (!result) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.json(result); // Return to stop further execution
    }

    // If no category is provided, fetch all categories
    const result = await db.collection("categories").find().toArray();
    return res.json(result); // Ensure a single response is sent
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const addNewCategory = async (req, res) => {
  try {
    const { label, subcategories } = req.body;
    if (label && subcategories) {
      const category = await db.collection("categories").findOne({ label });
      if (category) {
        return res.status(400).json({ message: "Category already exists" });
      }
      const newCategory = await db
        .collection("categories")
        .insertOne({ label, subcategories });
      res.json(newCategory);
    } else {
      return res
        .status(400)
        .json({ message: "Please provide category and subcategories Must!" });
    }
  } catch (error) {
    console.error("Error adding new category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getCategories, addNewCategory };
