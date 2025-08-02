"use client";
import { usePathname, useRouter } from "next/navigation";
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
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        if(pathname.includes("dashboard")) {
            localStorage.removeItem("admin");
        }
        router.push("/"); // Redirect to login page
        toast.success("Đăng xuất thành công!");
    };

    useEffect(() => {
        // Check for user data in localStorage or cookie
        const storedUser = localStorage.getItem("user");
        const storedAdmin = localStorage.getItem("admin");

        if (pathname.includes("dashboard") && storedAdmin) {

            setUser(JSON.parse(storedAdmin));
        } else {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [pathname]);

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