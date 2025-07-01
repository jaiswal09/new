"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Home page - checking auth status:", { user, loading });
    
    if (!loading) {
      if (user) {
        console.log("User authenticated, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.log("User not authenticated, redirecting to login");
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
      <span className="ml-2 text-lg">Loading...</span>
    </div>
  );
}