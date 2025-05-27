import express from "express";
import { getProductIDs } from "../controllers/productTagController";

const router = express.Router();

router.post("/", getProductIDs);

export default router;