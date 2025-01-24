const { db } = require("../config/db");

const getProducts = async (req, res) => {
 const products = await db.collection("products").find().toArray();
  res.json(products);
};
module.exports = { getProducts };
