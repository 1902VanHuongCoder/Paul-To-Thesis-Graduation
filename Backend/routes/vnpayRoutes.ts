import express from "express";
import { createVNPayPayment,paymentReturn } from "../controllers/vnpayController";

const router = express.Router();

router.post("/", createVNPayPayment);

router.get("/", paymentReturn); 

export default router;