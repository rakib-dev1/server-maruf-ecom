const { ObjectId } = require("mongodb");
const { db } = require("../config/db");
const { getIO } = require("../services/socket"); // <--- use getIO

const addToCart = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const { title, price, images, email, quantity } = req.body;
    console.log(req.body.images);

    const cartItems = {
      title,
      price,
      quantity,
      images,
      email,
      addedDate: new Date(),
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
      customerInfo,
      paymentMethod,
      totalPrice,
      deliveryCharge,
      products,
    } = req.body;

    const orderItems = {
      customerInfo,
      paymentMethod,
      totalPrice,
      products,
      deliveryCharge,
      status: "Pending",
      orderDate: new Date(),
    };

    const result = await db.collection("orders").insertOne(orderItems);

    // Emit a real-time notification to all connected clients
    const io = getIO();
    io.emit("orderConfirmed", {
      message: "Order confirmed successfully!",
      order: orderItems,
    });

    res.send(result);
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrders = async (req, res) => {
  try {
    console.log("order", req.query);
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    console.log(req.query);
    const query = { "customerInfo.email": email };
    const orders = await db.collection("orders").find(query).toArray();
    res.send(orders);
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
  getOrders,
};
