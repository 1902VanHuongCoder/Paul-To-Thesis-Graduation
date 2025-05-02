"use client";

import { LanguageSwitcher, LoginForm, SignUpForm } from "@/app/components";

export default function NewsList() {
 
  return (
    <div className="font-sans w-screen min-h-screen">
      <LoginForm />
      <SignUpForm />
      <LanguageSwitcher />
    </div>
  );
}