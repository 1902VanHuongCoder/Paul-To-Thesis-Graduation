import { baseUrl } from "../others/base-url";

export const fetchSubCategories = async () => {
  const res = await fetch(`${baseUrl}/api/subcategory`);
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    throw new Error("Failed to fetch subcategories");
  }
};

export const fetchSubCategoriesBasedOnCategory = async (categoryID: string) => {
  const res = await fetch(
    `${baseUrl}/api/subcategory?categoryID=${categoryID}`
  );
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    throw new Error("Failed to fetch subcategories for the category");
  }
};

export const createSubCategory = async (data: {
  subcategoryName: string;
  categoryID: string;
}) => {
  const res = await fetch(`${baseUrl}/api/subcategory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create subcategory");
  }
  return res.json();
};

export const updateSubCategory = async (
  id: string,
  data: { subcategoryName: string; categoryID: string }
) => {
  const res = await fetch(`${baseUrl}/api/subcategory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update subcategory");
  }
  return res.json();
};

export const deleteSubCategory = async (id: string) => {
  const res = await fetch(`${baseUrl}/api/subcategory/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return {message: data.message, status: res.status};
};


