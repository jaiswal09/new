"use client";

import { AuthCheck } from "@/components/layout/auth-check";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardInventory } from "@/components/dashboard/dashboard-inventory";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardUpcomingReservations } from "@/components/dashboard/dashboard-upcoming-reservations";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();

  console.log("Dashboard page loaded for user:", user?.name);

  return (
    <AuthCheck>
      <AppShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's what's happening in your resource management system.
            </p>
          </div>

          <DashboardMetrics />

          <div className="grid gap-8 md:grid-cols-2">
            <DashboardInventory />
            <DashboardUpcomingReservations />
          </div>

          <DashboardRecentActivity />
        </div>
      </AppShell>
    </AuthCheck>
  );
}