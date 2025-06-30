"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationNav } from "@/components/layout/notification-nav";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function SiteHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="inline-block font-heading text-xl font-bold text-primary">
              SRMS
            </span>
          </Link>
          <MainNav className="hidden md:flex" />
          <Button variant="outline" size="sm" className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>
          <NotificationNav />
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : user ? (
            <UserNav user={user} />
          ) : null}
        </div>
      </div>
    </header>
  );
}
