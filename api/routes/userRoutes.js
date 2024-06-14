import express from "express";
import { getAllUsers } from "../controllers/userControllers.js";
const router = express.Router();
import verifyToken from "../middleware/verifyToken.js";

router.use(verifyToken);
router.route("/").get(getAllUsers);

export default router;
