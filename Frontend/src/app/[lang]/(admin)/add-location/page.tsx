"use client";
import { baseUrl } from "@/lib/others/base-url";
import { useState, useEffect } from "react";

interface Location {
  locationID: number;
  locationName: string;
  address: string;
  hotline: string;
}

export default function AddLocationPage() {
  const [locationName, setLocationName] = useState("");
  const [hotline, setHotline] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Address API states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provinces, setProvinces] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [districts, setDistricts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wards, setWards] = useState<any[]>([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // Location list and edit state
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingID, setEditingID] = useState<number | null>(null);
  const [editLocationName, setEditLocationName] = useState("");
  const [editHotline, setEditHotline] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Fetch provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!province) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const selected = provinces.find(p => p.name === province);
    if (selected) {
      fetch(`https://provinces.open-api.vn/api/p/${selected.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
    }
  }, [province, provinces]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!district) {
      setWards([]);
      return;
    }
    const selected = districts.find(d => d.name === district);
    if (selected) {
      fetch(`https://provinces.open-api.vn/api/d/${selected.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
    }
  }, [district, districts]);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/location`);
      const data = await res.json();
      setLocations(data);
    } catch {
      setLocations([]);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const fullAddress = `${detailAddress}, ${ward}, ${district}, ${province}`;
    try {
      const res = await fetch(`${baseUrl}/api/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationName, address: fullAddress, hotline }),
      });
      if (res.ok) {
        setSuccessMsg("Location added successfully!");
        setLocationName("");
        setHotline("");
        setProvince("");
        setDistrict("");
        setWard("");
        setDetailAddress("");
        fetchLocations();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to add location.");
      }
    } catch (error) {
        console.error("Error adding location:", error);
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (locationID: number) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/location/${locationID}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Location deleted.");
        fetchLocations();
      } else {
        setErrorMsg("Failed to delete location.");
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  const startEdit = (loc: Location) => {
    setEditingID(loc.locationID);
    setEditLocationName(loc.locationName);
    setEditHotline(loc.hotline);
    setEditAddress(loc.address);
  };

  const handleUpdate = async (locationID: number) => {
    try {
      const res = await fetch(`${baseUrl}/api/location/${locationID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: editLocationName,
          address: editAddress,
          hotline: editHotline,
        }),
      });
      if (res.ok) {
        setSuccessMsg("Location updated.");
        setEditingID(null);
        fetchLocations();
      } else {
        setErrorMsg("Failed to update location.");
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add New Location</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Location Name</label>
          <input
            type="text"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        {/* Address selection */}
        <div>
          <label className="block font-medium mb-1">Province/City</label>
          <select
            value={province}
            onChange={e => {
              setProvince(e.target.value);
              setDistrict("");
              setWard("");
            }}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select province/city</option>
            {provinces.map(p => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">District</label>
          <select
            value={district}
            onChange={e => {
              setDistrict(e.target.value);
              setWard("");
            }}
            required
            className="w-full px-3 py-2 border rounded"
            disabled={!province}
          >
            <option value="">Select district</option>
            {districts.map(d => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Ward</label>
          <select
            value={ward}
            onChange={e => setWard(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            disabled={!district}
          >
            <option value="">Select ward</option>
            {wards.map(w => (
              <option key={w.code} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Detail Address</label>
          <input
            type="text"
            value={detailAddress}
            onChange={e => setDetailAddress(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="House number, street..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Hotline</label>
          <input
            type="text"
            value={hotline}
            onChange={e => setHotline(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        {successMsg && <div className="text-green-600">{successMsg}</div>}
        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Location
        </button>
      </form>

      {/* Location List */}
      <h2 className="text-xl font-semibold mt-10 mb-2">Location List</h2>
      <div className="space-y-2">
        {locations.map(loc =>
          editingID === loc.locationID ? (
            <div key={loc.locationID} className="border p-2 rounded bg-gray-50 flex flex-col gap-2">
              <input
                className="border px-2 py-1 rounded"
                value={editLocationName}
                onChange={e => setEditLocationName(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                value={editHotline}
                onChange={e => setEditHotline(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleUpdate(loc.locationID)}
                >
                  Save
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                  onClick={() => setEditingID(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={loc.locationID} className="border p-2 rounded flex flex-col gap-1">
              <div>
                <span className="font-semibold">{loc.locationName}</span>
                <span className="ml-2 text-gray-500">{loc.address}</span>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => startEdit(loc)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(loc.locationID)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}