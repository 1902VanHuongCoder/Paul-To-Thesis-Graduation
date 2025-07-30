import { baseUrl } from "../others/base-url";

export const createNewContact = async ({
  userID,
  subject,
  message,
}: {
  userID: string;
  subject: string;
  message: string;
}) => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    body: JSON.stringify({
      userID,
      subject,
      message,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create contact");
  }

  return response.json();
};

export const fetchAllContacts = async () => {
  const response = await fetch(`${baseUrl}/api/contact`);

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  return response.json();
};