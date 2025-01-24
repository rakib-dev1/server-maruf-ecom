const { db } = require("../config/db");

const getProducts = async (req, res) => {
 
    products = await db.collection("products").find().toArray();
  
  res.json(products);
};
module.exports = { getProducts };
