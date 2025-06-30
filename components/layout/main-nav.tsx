"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.dashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </div>
      </Link>
      <Link
        href="/resources"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/resources" || pathname.startsWith("/resources/")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.resources className="h-4 w-4" />
          <span>Resources</span>
        </div>
      </Link>
      <Link
        href="/transactions"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/transactions" || pathname.startsWith("/transactions/")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.transaction className="h-4 w-4" />
          <span>Transactions</span>
        </div>
      </Link>
      <Link
        href="/reservations"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/reservations" || pathname.startsWith("/reservations/")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.calendar className="h-4 w-4" />
          <span>Reservations</span>
        </div>
      </Link>
      <Link
        href="/analytics"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/analytics"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.analytics className="h-4 w-4" />
          <span>Analytics</span>
        </div>
      </Link>
      <Link
        href="/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/settings"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          <Icons.settings className="h-4 w-4" />
          <span>Settings</span>
        </div>
      </Link>
    </nav>
  );
}
