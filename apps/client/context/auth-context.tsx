"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api, resetQueue } from "@/lib/axios";
import { User, AuthContextType, AuthError } from "@/types/auth";
import { useRouter, usePathname } from "next/navigation";
import { BrowserWarningModal } from "@/components/auth/browser-warning-modal";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const detectInAppBrowser = () => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      
      return (
        /instagram/.test(ua) ||
        /kakaotalk/.test(ua) ||
        /naver/.test(ua) ||
        /fban|fbav/.test(ua) ||
        /line/.test(ua) ||
        (/\bsafari\b/.test(ua) &&
          /\bmobile\b/.test(ua) &&
          !/chrome|crios|firefox|fxios|edg|edge/.test(ua))
      );
    }
    return false;
  };

  useEffect(() => {
    const inApp = detectInAppBrowser();
    setIsInAppBrowser(inApp);
  }, []);

  const clearError = () => setError(null);

  const resetAuthState = () => {
    setUser(null);
    setIsError(false);
    setError(null);
    setIsLoading(false);
    resetQueue();
  };

  const handleCloseWarningModal = () => {
    setIsWarningModalOpen(false);
  };

  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);
    resetAuthState();
    setError({
      message: error?.response?.data?.message || "Authentication failed",
      code: error?.response?.data?.code || "AUTH_ERROR",
    });

    if (!pathname.startsWith("/auth")) {
      router.push("/auth");
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
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
    const handleTokenError = () => {
      handleLogout();
    };

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
    if (isInAppBrowser) {
      setIsWarningModalOpen(true);
      return;
    }
    
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);
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
      <BrowserWarningModal 
        isOpen={isWarningModalOpen} 
        onClose={handleCloseWarningModal} 
      />
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
