import { baseUrl } from "../others/base-url";
type Address = { province: string; district: string; ward: string };
type AboutForm = {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo: string;
  companyImage: string;
  companySlogan: string;
  companyFacebook: string;
  companyWorkingTime: string;
  companyDescription: string;
  copanyAddress: string;
  address: Address;
  termsAndPolicy: string;
};
export const fetchAboutRecords = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/about`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch about records:", error);
    throw error;
  }
};

export const createAboutRecord = async (data: AboutForm) => {
  try {
    const response = await fetch(`${baseUrl}/api/about`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create about record: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating about record:", error);
    throw error;
  }
};

export const updateAboutRecord = async (data: AboutForm) => {
  try {
    const response = await fetch(`${baseUrl}/api/about`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update about record: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating about record:", error);
    throw error;
  }
}


export const deleteAboutRecord = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/about/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete about record: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting about record:", error);
    throw error;
  }
};