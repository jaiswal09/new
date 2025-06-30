import { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardInventory } from "@/components/dashboard/dashboard-inventory";
import { DashboardUpcomingReservations } from "@/components/dashboard/dashboard-upcoming-reservations";

export const metadata: Metadata = {
  title: "Dashboard | School Resource Management System",
  description: "Dashboard for School Resource Management System",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>
        <div className="space-y-6">
          <DashboardMetrics />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <DashboardInventory className="md:col-span-1 lg:col-span-3" />
            <DashboardUpcomingReservations className="md:col-span-1 lg:col-span-4" />
          </div>
          <DashboardRecentActivity />
        </div>
      </div>
    </AppShell>
  );
}
