import { provinceCoordinate } from "./vietnam-province-coordinate";

export const calculateShippingCost = async (selectedProvince: {
  code: number;
}) => {
  if(selectedProvince.code === 92 ) return 20000;
  const origin = provinceCoordinate.find((item) => item.code === 92);
  const destination = provinceCoordinate.find(
    (item) => item.code === selectedProvince.code
  );

  if (!origin || !destination) {
    console.error("Origin or destination not found");
    return 0;
  }

  try {
    const res = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY || "",
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat],
          ],
          profile: "driving-car",
        }),
      }
    );
    const data = await res.json();
    const distance = data.features[0].properties.summary.distance / 1000;
    if (distance < 10) return 0;
    if (distance < 50) return 30000;
    if (distance < 100) return 50000;
    return 70000;
  } catch (error) {
    console.error("Error fetching distance:", error);
    return 0;
  }
};
