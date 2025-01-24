const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const route = require("./routes/routes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use("/", route);

module.exports = app;
