import { Request, Response } from "express";
import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
export const createVNPayPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");

  var ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    undefined; // Removed invalid property access

  const vnp_TmnCode = String(process.env.VNPAY_TMNCODE);
  const vnp_HashSecret = String(process.env.VNPAY_SECRET_KEY);
  let vnp_Url = String(process.env.VNPAY_URL);
  const vnp_ReturnUrl = String(process.env.VNPAY_RETURN_URL);

  const orderId = req.body.orderId || moment(date).format("DDHHmmss");
  const amount = req.body.amount;
  const orderInfo = req.body.orderInfo || `Thanh toan don hang :${orderId}`;
  const locale = req.body.locale || "vn";
  const orderType = req.body.orderType || "other";

  const vnp_Params: Record<string, string | number> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Amount: amount * 100, // VNPay requires the amount in VND multiplied by 100
    vnp_BankCode: req.body.bankCode,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_ReturnUrl,
    vnp_IpAddr: String(ipAddr),
    vnp_CreateDate: createDate,
    vnp_Locale: locale,
    vnp_ExpireDate: moment(date)
      .add(15, "minute")
      .format("YYYYMMDDHHmmss")
  };

   // Sort parameters alphabetically
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnp_Params[key];
      return acc;
    }, {} as Record<string, string | number>);
  
  // Generate the secure hash using sortedParams
  let signData = querystring.stringify(sortedParams, { encode: false });
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  
  // Add the secure hash to sortedParams
  sortedParams["vnp_SecureHash"] = signed;
  
  // Generate the payment URL using sortedParams
  vnp_Url += "?" + querystring.stringify(sortedParams, { encode: false });

  // Redirect to VNPay payment URL
  res.redirect(vnp_Url);

  console.log(vnp_Url);
};

export const paymentReturn = async (
  req: Request,
  res: Response
): Promise<void> => {
  const vnp_Params = req.query;

  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  // Sort parameters alphabetically
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = typeof vnp_Params[key] === "string" ? vnp_Params[key] : "";
      return acc;
    }, {} as Record<string, string>);

  // Verify the secure hash
  const signData = querystring.stringify(sortedParams);
  const vnp_HashSecret = String(process.env.VNPAY_SECRET_KEY);
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === checkHash) {
    // Payment is valid
    res.status(200).json({ message: "Payment successful", data: vnp_Params });
  } else {
    // Payment is invalid
    res.status(400).json({ message: "Invalid payment" });
  }
};
