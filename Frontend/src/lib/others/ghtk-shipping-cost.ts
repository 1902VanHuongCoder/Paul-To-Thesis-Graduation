// GHN API token (set in .env.local)
const GHN_TOKEN = process.env.NEXT_PUBLIC_GHN_TOKEN;

/**
 * Calculate shipping cost using GHN API
 * @param params - GHN fee calculation parameters
 * @returns shipping fee (number)
 * Docs: https://api.ghn.vn/home/docs/detail?id=5
 */
export async function calculateGHNShippingCost({
  from_district,
  to_district,
  service_type_id,
  height,
  length,
  weight,
  width,
  insurance_value,
}: {
  from_district: number;
  to_district: number;
  service_type_id: number;
  height: number;
  length: number;
  weight: number;
  width: number;
  insurance_value: number;
}) {
  try {
    const url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN || "",
      },
      body: JSON.stringify({
        from_district,
        to_district,
        service_type_id,
        height,
        length,
        weight,
        width,
        insurance_value,
      }),
    });
    const data = await res.json();
    // The fee is usually in data.data.total
    return data.data?.total || 0;
  } catch (err) {
    console.error("GHN fee error:", err);
    return 0;
  }
}