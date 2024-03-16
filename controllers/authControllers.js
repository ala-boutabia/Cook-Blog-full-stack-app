import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const register = async (req, res) => {
  try {
    // Destructure user data from the request body
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check for existing user with the same email
    const foundUser = await User.findOne({ email: email }).exec();
    if (foundUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash the password securely using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({ username, email, password: hashedPassword });

    // Save the new user to the database
    await newUser.save();

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set the refresh token as a secure HTTP-only cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 7, // One week in milliseconds
    });

    // Respond with a success message and sanitized user data (excluding password)
    const sanitizedUser = { username: newUser.username, email: newUser.email };
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: sanitizedUser,
      accessToken,
    });
  } catch (error) {
    // Handle specific errors
    if (error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

const login = async (req, res) => {
  try {
    // Destructure user data from the request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Check for existing user with the same email
    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid login credentials." });
    }

    // Compare password hashes securely
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid login credentials." });
    }

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: foundUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set the refresh token as a secure HTTP-only cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 7, // One week in milliseconds
    });

    // Respond with a success message and sanitized user data (excluding password)
    const sanitizedUser = { email: foundUser.email };
    res.status(200).json({
      success: true,
      message: "You are logged in successfully",
      user: sanitizedUser,
      accessToken,
    });
  } catch (error) {
    // Handle specific errors
    if (error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const foundUser = await User.findById(decoded.id).exec();
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
      const accessToken = jwt.sign(
        { id: foundUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );
      res.json({ accessToken });
    }
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204); // no content
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: "true",
  });
  res.json({ message: "You are logged out" });
};

export { register, login, refresh, logout };
