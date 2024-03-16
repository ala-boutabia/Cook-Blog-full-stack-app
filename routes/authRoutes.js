import express from "express";
const router = express.Router();
import {
  login,
  logout,
  refresh,
  register,
} from "../controllers/authControllers.js";

router.post("/register", register);
router.route("/login").post(login);
router.route("/refresh").get(refresh); // get refresh token from cookies
router.route("/logout").post(logout);

export default router;
