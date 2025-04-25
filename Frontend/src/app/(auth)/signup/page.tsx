// filepath: d:\Learning Web\Thesis\graduation-thesis\src\app\login.tsx
import React from "react";

export default function Signup() {
  return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50`}>
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}