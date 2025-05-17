import express from "express";
import { createVNPayPayment,createVNPayPaymentTest,paymentReturn, vnpayIPN } from "../controllers/vnpayController";

const router = express.Router();

router.post("/", createVNPayPaymentTest);

router.get("/return", paymentReturn);

router.get("/vnpay-ipn", vnpayIPN);

export default router;