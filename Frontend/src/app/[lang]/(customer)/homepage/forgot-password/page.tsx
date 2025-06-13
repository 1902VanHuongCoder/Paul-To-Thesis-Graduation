"use client";

import PasswordForgetDialog from "@/components/section/password-forget/password-forget";
import React from "react";

export default function ForgotPasswordPage() {
    const [open, setOpen] = React.useState(true);
  
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <PasswordForgetDialog 
                    open={open} 
                    setOpen={setOpen}
                />
              
            </div>
        </div>
    );
}