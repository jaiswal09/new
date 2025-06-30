"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface DashboardInventoryProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardInventory({
  className,
  ...props
}: DashboardInventoryProps) {
  // Mock data - in a real app, this would come from your API
  const data = [
    { name: "Available", value: 1084, color: "var(--chart-2)" },
    { name: "Checked Out", value: 125, color: "var(--chart-1)" },
    { name: "Low Stock", value: 64, color: "var(--chart-3)" },
    { name: "Maintenance", value: 11, color: "var(--chart-4)" },
  ];

  const categories = [
    { name: "Textbooks", count: 342, percentage: 28 },
    { name: "Lab Equipment", count: 275, percentage: 22 },
    { name: "Digital Devices", count: 218, percentage: 17 },
    { name: "Sports Equipment", count: 156, percentage: 13 },
    { name: "Art Supplies", count: 123, percentage: 10 },
    { name: "Other", count: 170, percentage: 14 },
  ];

  return (
    <Card className={cn("col-span-3", className)} {...props}>
      <CardHeader>
        <CardTitle>Inventory Overview</CardTitle>
        <CardDescription>
          Summary of all resources in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-4 flex items-center">
            <div className="text-2xl font-bold">1,284</div>
            <div className="ml-2 text-sm text-muted-foreground">
              Total Resources
            </div>
          </div>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center">
                <div className="w-1/3 text-sm font-medium">{category.name}</div>
                <div className="flex w-2/3 items-center gap-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-[160px] items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Inventory Details
        </Button>
      </CardFooter>
    </Card>
  );
}
