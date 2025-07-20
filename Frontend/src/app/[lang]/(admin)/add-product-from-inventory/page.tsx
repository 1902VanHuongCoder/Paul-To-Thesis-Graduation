"use client";
import { useState, useEffect } from "react";
import { baseUrl } from "@/lib/others/base-url";
import { useUser } from "@/contexts/user-context";

type Category = {
    categoryID: number;
    categoryName: string;
};
type SubCategory = {
    subcategoryID: number;
    subcategoryName: string;
};
type Origin = {
    originID: number;
    originName: string;
};
type Tag = {
    tagID: number;
    tagName: string;
};


type Product = {
    productID: number;
    category: Category;
    origin: Origin;
    subcategory: SubCategory;
    Tags: Tag[];
    productName: string;
    productPrice: number;
    productPriceSale: number;
    quantityAvailable: number;
    rating: number;
    createdAt: string;
    updatedAt: string;
    description: string;
    descriptionImages: string[];
    images: string[];
    isShow: boolean;
    expiredAt: Date | null;
    unit: string;
};

interface Location {
    locationID: number;
    locationName: string;
    address: string;
    hotline: string;
}


export default function AddProductFromInventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [productID, setProductID] = useState<number | "">("");
    const [locationID, setLocationID] = useState<number | "">("");
    const [quantity, setQuantity] = useState<number | "">("");
    const [note, setNote] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const {user} = useUser(); 

    useEffect(() => {
        fetch(`${baseUrl}/api/product`)
            .then(res => res.json())
            .then(data => setProducts(data || []));
        fetch(`${baseUrl}/api/location`)
            .then(res => res.json())
            .then(data => setLocations(data || []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user){
            setErrorMsg("You must be logged in to perform this action.");
            return;
        }
        setSuccessMsg("");
        setErrorMsg("");
        if (!productID || !locationID || !quantity) {
            setErrorMsg("Please fill in all fields.");
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/inventory/export`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productID: Number(productID),
                    locationID: Number(locationID),
                    quantity: Number(quantity),
                    performedBy: user || "unknown",
                    note,
                }),
            });
            if (res.ok) {
                setSuccessMsg("Product fetched from inventory successfully!");
                setProductID("");
                setLocationID("");
                setQuantity("");
                setNote("");
            } else {
                const data = await res.json();
                setErrorMsg(data.error || data.message || "Failed to fetch product from inventory.");
            }
        } catch (error) {
            console.error("Error fetching product from inventory:", error);
            setErrorMsg("An error occurred. Please try again.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Fetch Product From Inventory</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Product</label>
                    <select
                        value={productID}
                        onChange={e => setProductID(e.target.value === "" ? "" : Number(e.target.value))}
                        required
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="">Select product</option>
                        {products.map(prod => (
                            <option key={prod.productID} value={prod.productID}>
                                {prod.productName}
                                {prod.productPrice ? ` - ${prod.productPrice}₫` : ""}
                                {prod.quantityAvailable !== undefined ? ` - SL: ${prod.quantityAvailable}` : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Location</label>
                    <select
                        value={locationID}
                        onChange={e => setLocationID(e.target.value === "" ? "" : Number(e.target.value))}
                        required
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="">Select location</option>
                        {locations.map(loc => (
                            <option key={loc.locationID} value={loc.locationID}>
                                {loc.locationName} ({loc.address})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                        required
                        min={1}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Enter quantity"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Note</label>
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Optional note"
                    />
                </div>
                {successMsg && <div className="text-green-600">{successMsg}</div>}
                {errorMsg && <div className="text-red-600">{errorMsg}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Fetch Product
                </button>
            </form>
        </div>
    );
}