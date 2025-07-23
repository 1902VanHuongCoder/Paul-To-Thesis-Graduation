import { baseUrl } from "../others/base-url";

export const getAllUsers = async () => {
  const res = await fetch(`${baseUrl}/api/users`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data;
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${baseUrl}/api/users/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const responseData = await res.json();
  if (res.status === 401) {
    return { status: "error", message: responseData.message, data: null, token: null };
  }
  return {
    data: responseData.user,
    status: "success",
    token: responseData.token,
    message: "Login successful",
  };
};

export const googleRegister = async (userData: {
  userID: string;
  username: string;
  email: string;
  avatar: string;
  providerID: string;
}) => {
  const res = await fetch(`${baseUrl}/api/users/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  const data = await res.json();
  return data;
};

export const register = async (
  userData: {
    userID: string;
    username: string;
    email: string;
    password: string;
    role: string;
  },
  address: string,
  phone: string,
  isDefault: boolean
) => {
  const res = await fetch(`${baseUrl}/api/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      shippingAddress: {
        address,
        phone,
        isDefault,
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  const data = await res.json();
  return data;
};

export const googleLogin = async (userData: {
  userID: string;
  username: string;
  email: string;
  avatar: string;
  providerID: string;
}) => {
  const res = await fetch(`${baseUrl}/api/users/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error("Google login failed");
  }

  const data = await res.json();
  return data;
};

export const getUserInfo = async (userID: string) => {
  const res = await fetch(`${baseUrl}/api/users/${userID}`);

  if (!res.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = await res.json();
  return data;
};

export const checkPassword = async (password: string, userID: string) => {
  const res = await fetch(`${baseUrl}/api/users/confirm-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userID,
      password,
    }),
  });
  if (!res.ok) {
    return false;
  }
  return true;
};

export const updateUserProfile = async (
  username: string,
  email: string,
  avatar: string,
  password: string | null,
  userID: string
) => {
  const res = await fetch(`${baseUrl}/api/users/${userID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      avatar,
      password,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to update user profile");
  }
  const data = await res.json();
  return data;
};

export const updateUserProfileStatus = async (
  userID: string,
  isActive: boolean
) => {
  const res = await fetch(`${baseUrl}/api/users/${userID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: !isActive }),
  });
  if (!res.ok) {
    throw new Error("Failed to update user status");
  }
  return res.ok;
};

export const deleteAccount = async (userID: string) => {
  const res = await fetch(`${baseUrl}/api/users/${userID}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  return res.ok;
};
