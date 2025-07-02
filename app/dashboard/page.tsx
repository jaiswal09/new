"use client";

import { useAuth } from "@/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardInventory } from "@/components/dashboard/dashboard-inventory";
import { DashboardUpcomingReservations } from "@/components/dashboard/dashboard-upcoming-reservations";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  console.log("Dashboard - User:", user, "Loading:", loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your resources today.
          </p>
        </div>

        <DashboardMetrics />
        
        <div className="grid lg:grid-cols-2 gap-6">
          <DashboardInventory />
          <DashboardUpcomingReservations />
        </div>
        
        <DashboardRecentActivity />
      </div>
    </AppShell>
  );
}