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

  console.log("IP address:", ipAddr);
  // Convert IPv6 loopback to IPv4 loopback
  if (ipAddr === "::1" || ipAddr === "0:0:0:0:0:0:0:1") {
    ipAddr = "127.0.0.1";
  }

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
  vnp_Url += "?" + querystring.stringify(sortedParams, { encode: true });

  // Redirect to VNPay payment URL
  res.redirect(vnp_Url);

  console.log(vnp_Url);
};

function sortObject(obj: Record<string, any>): Record<string, string> {
  let sorted: Record<string, string> = {};
  let str: string[] = [];
  let key: string;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    const originalKey = decodeURIComponent(str[i]);
    sorted[str[i]] = encodeURIComponent(obj[originalKey]).replace(/%20/g, "+");
  }
  return sorted;
}

export const createVNPayPaymentTest = async (req: Request, res: Response) : Promise<void> => {
     

    var ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    var tmnCode = "7L3UH3E7";
    var secretKey = "8813K697ILHSCL0R3NYAFMDV2MFL7N1H";
    var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    var returnUrl = `http://localhost:3000/${req.body.language}/homepage/checkout/vnpay-return`;

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");

     const orderId = req.body.orderId || moment(date).format("DDHHmmss");
    var amount = req.body.amount;
    var bankCode = req.body.bankCode;

    var orderInfo = req.body.orderDescription;
    var orderType = req.body.orderType;
    var locale = req.body.language;
    if (locale === null || locale === "") {
      locale = "vn";
    }
    var currCode = "VND";
    var vnp_Params: Record<string, string | number> = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = String(orderId);
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = String(ipAddr);
    vnp_Params["vnp_CreateDate"] = String(createDate);
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }
    vnp_Params = sortObject(vnp_Params);
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    // res.redirect(vnpUrl);
    console.log(vnpUrl);
    res.status(200).json({ url: vnpUrl });
}

export const paymentReturn = async (
  req: Request,
  res: Response
): Promise<void> => {
  let vnp_Params = { ...req.query };

  console.log("vnp param", vnp_Params);

  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  // Verify the secure hash
  const signData = querystring.stringify(vnp_Params , { encode: false });
  // const vnp_HashSecret = String(process.env.VNPAY_SECRET_KEY);
  const vnp_HashSecret = "8813K697ILHSCL0R3NYAFMDV2MFL7N1H";
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // console.log("checkHash", checkHash);
  // console.log("secureHash", secureHash);

  if (secureHash === checkHash) {
    // Payment is valid
    // res.status(200).json({ message: "Payment successful", data: vnp_Params });
    console.log("Payment successful", vnp_Params);
    res.redirect("http://localhost:3000");
  } else {
    // Payment is invalid
    res.status(400).json({ message: "Giao dịch không hợp lệ nhé" });
  }
};

export const vnpayIPN = async (req: Request, res: Response) => {
  let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = "8813K697ILHSCL0R3NYAFMDV2MFL7N1H";

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");    
    
    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
    
    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if(secureHash === signed){ //kiểm tra checksum
        if(checkOrderId){
            if(checkAmount){
                if(paymentStatus=="0"){ //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if(rspCode=="00"){
                        //thanh cong
                        //paymentStatus = '1'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        console.log("Payment successful");
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                    else {
                        //that bai
                        //paymentStatus = '2'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                }
                else{
                    res.status(200).json({RspCode: '02', Message: 'This order has been updated to the payment status'})
                }
            }
            else{
                res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
            }
        }       
        else {
            res.status(200).json({RspCode: '01', Message: 'Order not found'})
        }
    }
    else {
        res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
    }
}


