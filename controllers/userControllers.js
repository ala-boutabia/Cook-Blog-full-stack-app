import User from "../models/User.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email");
    if (users.length === 0) {
      return res.status(200).json({ message: "No users found." }); // No content to return
    }
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getAllUsers };
