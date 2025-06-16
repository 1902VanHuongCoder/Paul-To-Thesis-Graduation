"use client";
import { auth } from "@/lib/firebase-config"; // Adjust the import path as necessary
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import gglogo from "@public/images/gg+logo.png";
import Image from "next/image";
export default function SocialLogin() {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // You can now get the user from auth.currentUser
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed. Please try again.");
    }
  };

  return (
    <div>
      <button onClick={handleGoogleLogin} className="w-fit h-fit rounded-full overflow-hidden cursor-pointer">
         <Image src={gglogo} alt="Google Logo" width={50} height={50} />
      </button>
    </div>
  );
}