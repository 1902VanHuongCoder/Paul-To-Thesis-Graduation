"use client";
import { baseUrl } from "@/lib/base-url";
import { useState, useEffect } from "react";

interface Location {
    locationID: number;
    locationName: string;
    address: string;
    hotline: string;
}

interface Product {
    productID: number;
    productName: string;
    productPrice?: number;
    productPriceSale?: number;
    quantityAvailable?: number;
    categoryID?: number;
    originID?: number;
    subcategoryID?: number;
    images?: string[];
    rating?: number | null;
    createdAt?: string;
    tagIDs?: number[];
}

interface Inventory {
    inventoryID: number;
    productID: number;
    locationID: number;
    quantityInStock: number;
    product?: Product;
    location?: Location;
}

export default function AddInventoryPage() {
    const [productID, setProductID] = useState<number | "">("");
    const [locationID, setLocationID] = useState<number | "">("");
    const [quantityInStock, setQuantityInStock] = useState<number | "">("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Inventory list state
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [editQuantities, setEditQuantities] = useState<{ [key: number]: number }>({});

    // Fetch location list from server
    useEffect(() => {
        fetch(`${baseUrl}/api/location`)
            .then(res => res.json())
            .then(data => setLocations(data))
            .catch(() => setLocations([]));
    }, []);

    // Fetch product list from server
    const fetchProducts = () => {
        fetch(`${baseUrl}/api/product`)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(() => setProducts([]));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch inventory list from server
    const fetchInventories = () => {
        fetch(`${baseUrl}/api/inventory`)
            .then(res => res.json())
            .then(data => setInventories(data))
            .catch(() => setInventories([]));
    };

    useEffect(() => {
        fetchInventories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg("");
        setErrorMsg("");
        if (!productID || !locationID || !quantityInStock) {
            setErrorMsg("Please fill in all fields.");
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/inventory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productID: Number(productID),
                    locationID: Number(locationID),
                    quantityInStock: Number(quantityInStock),
                }),
            });
            if (res.ok) {
                setSuccessMsg("Inventory added successfully!");
                setProductID("");
                setLocationID("");
                setQuantityInStock("");
                fetchInventories();
            } else {
                const data = await res.json();
                setErrorMsg(data.error || "Failed to add inventory.");
            }
        } catch (error) {
            console.error("Error adding inventory:", error);
            setErrorMsg("An error occurred. Please try again.");
        }
    };

    const handleQuantityChange = (inventoryID: number, value: string) => {
        setEditQuantities(prev => ({
            ...prev,
            [inventoryID]: value === "" ? 0 : Number(value),
        }));
    };

    const handleUpdate = async (inventory: Inventory) => {
        setSuccessMsg("");
        setErrorMsg("");
        const newQuantity = editQuantities[inventory.inventoryID];
        if (typeof newQuantity !== "number" || isNaN(newQuantity)) {
            setErrorMsg("Invalid quantity.");
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/inventory/${inventory.inventoryID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productID: inventory.productID,
                    locationID: inventory.locationID,
                    quantityInStock: newQuantity,
                }),
            });
            if (res.ok) {
                setSuccessMsg("Quantity updated successfully!");
                fetchInventories();
            } else {
                const data = await res.json();
                setErrorMsg(data.error || "Failed to update quantity.");
            }
        } catch (error) {
            console.error("Error updating inventory:", error);
            setErrorMsg("An error occurred. Please try again.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Add New Inventory</h1>
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <div>
                    <label className="block font-medium mb-1">Product</label>
                    <div className="flex gap-2">
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
                                    {prod.categoryID ? ` - CatID: ${prod.categoryID}` : ""}
                                    {prod.originID ? ` - OriginID: ${prod.originID}` : ""}
                                    {prod.subcategoryID ? ` - SubCatID: ${prod.subcategoryID}` : ""}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={() => setShowAddProduct(true)}
                        >
                            Add Product
                        </button>
                    </div>
                    {showAddProduct && <p>Hello</p>}
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
                    <label className="block font-medium mb-1">Quantity In Stock</label>
                    <input
                        type="number"
                        value={quantityInStock}
                        onChange={e => setQuantityInStock(e.target.value === "" ? "" : Number(e.target.value))}
                        required
                        min={0}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Enter quantity"
                    />
                </div>
                {successMsg && <div className="text-green-600">{successMsg}</div>}
                {errorMsg && <div className="text-red-600">{errorMsg}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Add Inventory
                </button>
            </form>

            <h2 className="text-xl font-semibold mb-2">Inventory List</h2>
            <table className="w-full border mb-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Product</th>
                        <th className="p-2 border">Location</th>
                        <th className="p-2 border">Quantity</th>
                        <th className="p-2 border">Update</th>
                    </tr>
                </thead>
                <tbody>
                    {inventories.map(inv => (
                        <tr key={inv.inventoryID}>
                            <td className="p-2 border">
                                {inv.product?.productName || inv.productID}
                            </td>
                            <td className="p-2 border">
                                {inv.location?.locationName || inv.locationID}
                            </td>
                            <td className="p-2 border">
                                <input
                                    type="number"
                                    min={0}
                                    value={
                                        editQuantities[inv.inventoryID] !== undefined
                                            ? editQuantities[inv.inventoryID]
                                            : inv.quantityInStock
                                    }
                                    onChange={e =>
                                        handleQuantityChange(inv.inventoryID, e.target.value)
                                    }
                                    className="border px-2 py-1 rounded w-24"
                                />
                            </td>
                            <td className="p-2 border">
                                <button
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                    onClick={() => handleUpdate(inv)}
                                >
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}