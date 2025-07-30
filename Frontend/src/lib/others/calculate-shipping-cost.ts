import { provinceCoordinate } from "./vietnam-province-coordinate";

// Haversine formula: calculates the great-circle distance between two points on a sphere given their longitudes and latitudes.
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

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

  // Use Haversine formula to calculate straight-line distance
  const distance = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  console.log("Haversine Distance (km):", distance);
  if (distance < 10) return 0;
  if (distance < 50) return 30000;
  if (distance < 100) return 50000;
  return 70000;
};
