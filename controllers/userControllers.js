const { db } = require("../config/db");
const addToCart = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const { title, price, image, email } = req.body;
    console.log(title, price, image, email);
    const cartItems = {
      title,
      price,
      image,
      email,
    };
    const result = await db.collection("cart").insertOne(cartItems);
    res.send(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCartItems = async (req, res) => {
    try {
        const email = req.query.email;
        const query = { email: email };
        const cartItems = await db.collection("cart").find(query).toArray();
        res.send(cartItems);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = { addToCart,getCartItems };
