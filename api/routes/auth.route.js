import express from "express"
import { authentication } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/auth", authentication);
export default router;
