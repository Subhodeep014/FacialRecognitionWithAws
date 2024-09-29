import express from "express"
import { registerEmployee, test } from "../controllers/register.controller.js";
const router = express.Router();

router.get("/test", test)
router.post("/register", registerEmployee)
export default router;