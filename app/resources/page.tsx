import { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ResourcesGrid } from "@/components/resources/resources-grid";
import { ResourcesFilters } from "@/components/resources/resources-filters";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "Resources | School Resource Management System",
  description: "Manage school resources and inventory",
};

export default function ResourcesPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6 pt-8">
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <Button className="flex items-center space-x-2">
            <Icons.add className="h-4 w-4" />
            <span>Add Resource</span>
          </Button>
        </div>
        <ResourcesFilters />
        <ResourcesGrid />
      </div>
    </AppShell>
  );
}
