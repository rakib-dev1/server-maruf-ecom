const { db } = require("../config/db");
const getCategories = async (req, res) => {
  const categories = await db.collection("categories").find().toArray();
  res.json(categories);
};

module.exports = { getCategories };
