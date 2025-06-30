"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

export function ResourcesGrid() {
  // Mock data - in a real app, this would come from your API
  const resources = [
    {
      id: "1",
      name: "Science Textbook - Grade 10",
      category: "Textbooks",
      quantity: 45,
      minQuantity: 10,
      location: "Library - Shelf B2",
      status: "available",
      imageUrl: "/images/textbook.jpg",
    },
    {
      id: "2",
      name: "Microscope - Advanced",
      category: "Lab Equipment",
      quantity: 8,
      minQuantity: 5,
      location: "Science Lab 1 - Cabinet 3",
      status: "low_stock",
      imageUrl: "/images/microscope.jpg",
    },
    {
      id: "3",
      name: "Chromebook - Student Model",
      category: "Digital Devices",
      quantity: 0,
      minQuantity: 5,
      location: "IT Storage - Room 105",
      status: "out_of_stock",
      imageUrl: "/images/chromebook.jpg",
    },
    {
      id: "4",
      name: "Basketball",
      category: "Sports Equipment",
      quantity: 12,
      minQuantity: 5,
      location: "Gym - Equipment Room",
      status: "available",
      imageUrl: "/images/basketball.jpg",
    },
    {
      id: "5",
      name: "Digital Projector",
      category: "AV Equipment",
      quantity: 3,
      minQuantity: 2,
      location: "AV Room - Shelf 1",
      status: "maintenance",
      imageUrl: "/images/projector.jpg",
    },
    {
      id: "6",
      name: "Art Supplies Kit - Basic",
      category: "Art Supplies",
      quantity: 20,
      minQuantity: 10,
      location: "Art Room - Cabinet A",
      status: "available",
      imageUrl: "/images/art-supplies.jpg",
    },
    {
      id: "7",
      name: "Chemistry Lab Kit",
      category: "Lab Equipment",
      quantity: 15,
      minQuantity: 8,
      location: "Science Lab 2 - Cabinet 2",
      status: "available",
      imageUrl: "/images/lab-kit.jpg",
    },
    {
      id: "8",
      name: "Interactive Whiteboard",
      category: "Digital Devices",
      quantity: 2,
      minQuantity: 1,
      location: "IT Storage - Room 105",
      status: "low_stock",
      imageUrl: "/images/whiteboard.jpg",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-secondary-emerald text-white">
            Available
          </Badge>
        );
      case "low_stock":
        return <Badge variant="secondary">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "maintenance":
        return <Badge variant="outline">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {resources.map((resource) => (
        <Card
          key={resource.id}
          className="resource-card overflow-hidden transition-all hover:shadow-md"
        >
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: resource.imageUrl
                  ? `url(${resource.imageUrl})`
                  : "none",
                backgroundColor: !resource.imageUrl ? "#f1f5f9" : "transparent",
              }}
            >
              {!resource.imageUrl && (
                <div className="flex h-full items-center justify-center">
                  <Icons.image
                    className="h-12 w-12 text-muted-foreground/40"
                    strokeWidth={1}
                  />
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {resource.category}
                </p>
              </div>
              {getStatusBadge(resource.status)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p
                  className={`font-medium ${resource.quantity === 0 ? "text-destructive" : resource.quantity <= resource.minQuantity ? "text-accent-amber" : "text-secondary-emerald"}`}
                >
                  {resource.quantity}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {resource.location.length > 20
                    ? `${resource.location.substring(0, 20)}...`
                    : resource.location}
                </p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Icons.arrowRight className="mr-2 h-3 w-3" />
                Check Out
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Icons.check className="mr-2 h-3 w-3" />
                Check In
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Icons.moreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
