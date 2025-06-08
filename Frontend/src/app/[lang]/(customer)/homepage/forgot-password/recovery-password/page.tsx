"use client";
import CreateNewPassword from "@/components/section/password-forget/create-newpass";
import { useUser } from "@/contexts/user-context";
import React from "react";

export default function RecoveryPasswordPage() {
    const { user } = useUser();
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">

                <CreateNewPassword userID={user?.userID} />
            </div>
        </div>
    );
}