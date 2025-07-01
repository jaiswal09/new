"use client";

import { AuthCheck } from "@/components/layout/auth-check";
import { AppShell } from "@/components/layout/app-shell";
import { ResourcesGrid } from "@/components/resources/resources-grid";
import { ResourcesFilters } from "@/components/resources/resources-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ResourcesPage() {
  console.log("Resources page loaded");

  return (
    <AuthCheck>
      <AppShell>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
              <p className="text-muted-foreground">
                Manage your school's resources and inventory
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          <ResourcesFilters />
          <ResourcesGrid />
        </div>
      </AppShell>
    </AuthCheck>
  );
}