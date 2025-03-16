const { ObjectId } = require("mongodb");
const { db } = require("../config/db");
const addToCart = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const { title, price, image, email, quantity } = req.body;
    console.log(req.body);

    const cartItems = {
      title,
      price,
      quantity,
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
};
const removeCartItems = async (req, res) => {
  try {
    const id = req.query.item;
    console.log(id);
    const query = { _id: new ObjectId(id) };
    const cartItems = await db.collection("cart").deleteOne(query);
    res.send(cartItems);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const orderConfirmItems = async (req, res) => {
  try {
    const {
      userInfo,
      paymentMethod,
      itemQuantities,
      totalPrice,
      cart,
      deliveryFee,
    } = req.body;

    const orderItems = {
      userInfo: userInfo,
      totalPrice,
      cart,
      status: "pending",
      itemQuantities,
      deliveryFee,
      paymentMethod,
      orderDate: new Date(),
    };
    console.log(orderItems);
    const result = await db.collection("orders").insertOne(orderItems);
    res.send(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItems,
  orderConfirmItems,
};
