"use client";

import { IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 현재 창에서 리다이렉트
      window.location.assign(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full px-6 py-3 flex items-center justify-center gap-3 
        bg-white rounded-xl text-gray-500 
        hover:bg-gray-50 hover:shadow-md
        border border-gray-200
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#4285F4]/40
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <IconLoader2 className="w-5 h-5 animate-spin" />
      ) : (
        <div className="relative w-5 h-5">
          <Image
            src="/google.svg"
            alt="Google Logo"
            fill
            className="object-contain"
          />
        </div>
      )}
      <span className="text-sm font-medium text-gray-700">
        {isLoading ? "로그인 중..." : "Continue with Google"}
      </span>
    </button>
  );
}