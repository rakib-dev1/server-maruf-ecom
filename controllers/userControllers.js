const { ObjectId } = require("mongodb");
const { db } = require("../config/db");
const { getIO } = require("../services/socket");
const multer = require("multer");
const storage = multer.memoryStorage(); // Or use diskStorage if you prefer
const upload = multer({ storage });
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const addToCart = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const { title, price, images, email, quantity } = req.body;

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
      paymentNumber,
      paymentGateway,
      trxid,
      totalPrice,
      deliveryCharge,
      products,
    } = req.body;
    const existingTRXID = await db
      .collection("orders")
      .findOne({ trxid: trxid });
    console.log(existingTRXID);
    if (existingTRXID) {
      return res.status(400).json({ message: "Transaction ID already exists" });
    }

    const orderItems = {
      customerInfo,
      paymentMethod,
      paymentNumber,
      paymentGateway,
      trxid,
      totalPrice,
      products,
      deliveryCharge,
      status: "processing",
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
    const email = req.query.email;
    let query = {};
    if (email) {
      query = { "customerInfo.email": email };
    }
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ orderDate: -1 })
      .toArray();
    res.send(orders);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const query = { _id: new ObjectId(orderId) };
    const orderDetails = await db.collection("orders").findOne(query);
    if (!orderDetails) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.send(orderDetails);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getUser = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const query = { email: email };
    const user = await db.collection("users").findOne(query);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateUser = async (req, res) => {
  try {
    const {
      oldEmail,
      email,
      name,
      phone,
      street1,
      street2,
      city,
      state,
      zip,
      country,
    } = req.body;
    const imageFile = req.file;
    const existingUser = await db
      .collection("users")
      .findOne({ email: oldEmail });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let imageUrl = [];
    if (imageFile) {
      const uploadedImage = await imagekit.upload({
        file: imageFile.buffer.toString("base64"),
        fileName: imageFile.originalname,
      });
      imageUrl.push(uploadedImage.url);
    }
    const address = {
      street1,
      street2,
      city,
      state,
      zip,
      country,
    };
    const updatedUser = {
      name,
      email,
      password: existingUser.password,
      phone,
      ...(imageUrl.length > 0 && { image: imageUrl[0] }),
      address,
      updateAt: new Date(),
    };

    const result = await db.collection("users").updateOne(
      { email: oldEmail },
      { $set: updatedUser },
      { upsert: true } // If no document matches, insert a new one
    );

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItems,
  orderConfirmItems,
  getOrders,
  getUser,
  updateUser,
  getOrderDetails,
};
