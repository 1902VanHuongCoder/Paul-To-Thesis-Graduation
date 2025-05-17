import querystring from "querystring";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const vnp_TmnCode = String(process.env.VNPAY_TMNCODE);
const vnp_HashSecret = String(process.env.VNPAY_SECRET_KEY);
const vnp_Url = process.env.VNPAY_URL;
const vnp_ReturnUrl = String(process.env.VNPAY_RETURN_URL);

export const generateVNPayUrl = (
  orderId: string,
  amount: number,
  orderInfo: string,
  bankCode: string = "",
  locale: string = "vn"
) => {
  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T]/g, "").slice(0, 14); // Format: YYYYMMDDHHmmss
  const expireDate = new Date(date.getTime() + 15 * 60 * 1000) // 15 minutes from now
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);

  const ipAddr = "127.0.0.1"; // Replace with the actual client IP address if available

  const vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Locale: locale || "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: (amount * 100).toString(), // VNPay requires the amount in VND multiplied by 100
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // Add bank code if provided
  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  // Sort parameters alphabetically
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnp_Params[key];
      return acc;
    }, {} as Record<string, string>);

  // Generate the secure hash
  const signData = querystring.stringify(sortedParams);
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Append the secure hash to the parameters
  sortedParams["vnp_SecureHash"] = secureHash;

  // Generate the payment URL
  return `${vnp_Url}?${querystring.stringify(sortedParams)}`;
};