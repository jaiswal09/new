"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";

export function ResourcesFilters() {
  const categories = [
    "All Categories",
    "Textbooks",
    "Lab Equipment",
    "Digital Devices",
    "Sports Equipment",
    "AV Equipment",
    "Art Supplies",
    "Office Supplies",
    "Furniture",
  ];

  const statuses = [
    "All Statuses",
    "Available",
    "Low Stock",
    "Out of Stock",
    "Maintenance",
  ];

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search resources..."
          className="h-9 md:w-[300px] lg:w-[400px]"
        />
        <Button size="sm" variant="ghost" className="h-9 px-2 lg:px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="sr-only">Search</span>
        </Button>
      </div>
      <div className="flex flex-row space-x-2">
        <Select>
          <SelectTrigger className="h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="h-9 w-full sm:w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status.toLowerCase().replace(" ", "_")}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9">
          <Icons.reset className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
