require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const route = require("./routes/routes");
const http = require("http");
const socket = require("./services/socket");

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// Use routes
app.use("/", route);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socket.init(server);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Export app if needed
module.exports = app;
