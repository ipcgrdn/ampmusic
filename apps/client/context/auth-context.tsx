"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api, resetQueue } from "@/lib/axios";
import { User, AuthContextType, AuthError } from "@/types/auth";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearError = () => setError(null);

  // 인증 상태 초기화 함수
  const resetAuthState = () => {
    setUser(null);
    setIsError(false);
    setError(null);
    setIsLoading(false);
    resetQueue();
  };

  // 인증 에러 처리 함수
  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);
    resetAuthState();
    setError({
      message: error?.response?.data?.message || "Authentication failed",
      code: error?.response?.data?.code || "AUTH_ERROR",
    });

    // auth 경로에서는 리다이렉션하지 않음
    if (!pathname.startsWith("/auth")) {
      router.push("/auth");
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        // auth 경로에서는 사용자 정보를 로드하지 않음
        if (pathname.startsWith("/auth")) {
          setIsLoading(false);
          return;
        }

        const { data } = await api.get("/auth/me");
        setUser(data);
        setIsError(false);
        setError(null);
      } catch (error: any) {
        handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router, pathname]);

  useEffect(() => {
    // 토큰 관련 에러 이벤트 리스너
    const handleTokenError = () => {
      handleLogout();
    };

    // 401 에러 이벤트 리스너
    const handleUnauthorized = () => {
      resetAuthState();
      router.push("/auth");
    };

    window.addEventListener("tokenError", handleTokenError);
    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("tokenError", handleTokenError);
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [router]);

  const login = () => {
    window.location.assign(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      resetAuthState();
      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      setError({
        message: "Failed to logout",
        code: "AUTH_LOGOUT_ERROR",
      });
    }
  };

  return (
    <AuthContext
      value={{
        user,
        isLoading,
        isError,
        error,
        clearError,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.email === "cejewe2002@gmail.com";
};
