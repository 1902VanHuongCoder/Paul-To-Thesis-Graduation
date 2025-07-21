import { baseUrl } from "../others/base-url";

type Product = {
  productName: string;
  productPrice: number;
  productPriceSale?: number | null;
  quantityAvailable: number;
  categoryID: number;
  subcategoryID: number;
  originID: number;
  tagIDs: number[];
  images: string[];
  descriptionImages: string[];
  description: string;
  isShow: boolean;
  expiredAt?: Date | null;
  unit: string;
  barcode?: string;
  boxBarcode?: string;
  quantityPerBox?: number;
  performedBy: string;
  diseaseIDs: number[];
};
export async function fetchProducts() {
  const res = await fetch(`${baseUrl}/api/product`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductByName(productName: string) {
  const res = await fetch(`${baseUrl}/api/product/name?name=${encodeURIComponent(productName)}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function fetchProductById(productId: string) {
  const res = await fetch(`${baseUrl}/api/product/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function importProducts(isBox: boolean, barcode: string) {
  const res = await fetch(`${baseUrl}/api/product/${isBox ? 'box-' : ''}barcode/${barcode}`);
  if (!res.ok) throw new Error("Failed to import products");
  return res.json();
}

export async function updateProduct(productId: string, data: Product) {
  const res = await fetch(`${baseUrl}/api/product/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.ok;
}

export async function updateProductQuantity(productID: string, quantity: number, performedBy: string, note: string) {
  const res = await fetch(`${baseUrl}/api/product/update/quantity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productID,
      quantityAvailable: quantity,
      performedBy,
      note,
    }),
  });
  if (!res.ok) throw new Error("Failed to update product quantity");
  return res.ok;
}

export async function deleteProduct(productId: string) {
  const res = await fetch(`${baseUrl}/api/product/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.ok;
}