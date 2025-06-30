"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface AuthCheckProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AuthCheck({ children, allowedRoles }: AuthCheckProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to dashboard if user doesn't have the required role
      router.push("/dashboard");
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading spinner while checking authentication
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If role check is required and user doesn't have the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  // If authenticated and has required role, render children
  return <>{children}</>;
}
