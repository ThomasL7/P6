const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");

const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");

// Mongodb connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB - Successful connection"))
  .catch(() => console.log("MongoDB - Failed connection"));

// Accepted formats
app.use(express.json());

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  next();
});

// Routes usage
app.use("/api/books", booksRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);

// Export app
module.exports = app;
