import { provinceCoordinate } from "./vietnam-province-coordinate";

export const calculateShippingCost = async (selectedProvince: {
  code: number;
}) => {
  const origin = provinceCoordinate.find((item) => item.code === 92);
  const destination = provinceCoordinate.find(
    (item) => item.code === selectedProvince.code
  );

  if (!origin || !destination) {
    console.error("Origin or destination not found");
    return 0;
  } else {
    await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY || "",
        },
        body: JSON.stringify({
          coordinates: [
            [origin?.lng, origin?.lat],
            [destination?.lng, destination?.lat],
          ],
          profile: "driving-car",
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const distance = data.features[0].properties.summary.distance / 1000;
        let shippingCost = 0;
        if (distance && distance < 10) {
          // If distance is less than 10 km, the delivery cost is free
          shippingCost = 0;
        } else if (distance && distance > 10 && distance < 50) {
          // If the distance is between 10 and 50 km, the delivery cost is 30,000 VND
          shippingCost = 30000;
        } else if (distance && distance > 50 && distance < 100) {
          // If the distance is between 50 and 100 km, the delivery cost is 50,000 VND
          shippingCost = 50000;
        } else if (distance && distance > 100) {
          // If the distance is more than 100 km, the delivery cost is 70,000 VND
          shippingCost = 70000;
        }
        return shippingCost;
      })
      .catch((error) => {
        console.error("Error fetching distance:", error);
        return 0;
      });
  }
};
