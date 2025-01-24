const categoriesData = require("../data/categories.json");
const getCategories = async (req, res) => {
  res.json(categoriesData);
};

module.exports = { getCategories };
