import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();
const port = process.env.PORT || 5000;

import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

import rootRoute from "./routes/root.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Database connection
import connectDB from "./config/connectDB.js";
connectDB();
import corsOptions from "./config/corsOptions.js";

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json()); // Parse incoming JSON data
app.use(express.static("public"));

// Routes
app.use("/", rootRoute);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling routes
app.all("*", (req, res) => {
  res.status(400);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  }
});

// Database connection
mongoose.connection.once("open", () => {
  console.log("Connected succesfully to the database");
  // Start the server
  app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`);
  });
});
// Handle database connection errors
mongoose.connection.on("error", (err) => {
  console.log(err);
});
