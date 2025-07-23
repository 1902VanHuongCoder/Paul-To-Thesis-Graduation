"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import toast from "react-hot-toast";

interface User {
    userID: string;
    username: string;
    email: string;
    avatar: string;
    token: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    console.log("UserProvider initialized with user:", user);
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        toast.success("Đăng xuất thành công!");
    };

    useEffect(() => {
        // Check for user data in localStorage or cookie
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}