"use client";

import { Icons } from "@/components/shared/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardMetrics() {
  // Mock data - in a real app, this would come from your API
  const metrics = [
    {
      title: "Total Resources",
      value: "1,284",
      change: "+2.5%",
      changeType: "positive",
      icon: "resources",
    },
    {
      title: "Active Checkouts",
      value: "42",
      change: "-4.3%",
      changeType: "negative",
      icon: "transaction",
    },
    {
      title: "Low Stock Items",
      value: "15",
      change: "+12.3%",
      changeType: "negative",
      icon: "warning",
    },
    {
      title: "Upcoming Reservations",
      value: "23",
      change: "+8.2%",
      changeType: "positive",
      icon: "calendar",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = Icons[metric.icon as keyof typeof Icons];
        return (
          <Card key={metric.title} className="dashboard-stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p
                className={`text-xs ${metric.changeType === "positive" ? "text-secondary-emerald" : "text-destructive"}`}
              >
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
