"use client";

import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardRecentActivity() {
  // Mock data - in a real app, this would come from your API
  const activities = [
    {
      id: "1",
      type: "check_out",
      user: {
        name: "Jane Smith",
        department: "Science",
        avatar: "/avatars/01.png",
      },
      resource: {
        name: "Microscope #3",
        category: "Lab Equipment",
      },
      quantity: 1,
      timestamp: "2023-05-26T14:30:00Z",
    },
    {
      id: "2",
      type: "check_in",
      user: {
        name: "Mark Johnson",
        department: "Physical Education",
        avatar: "/avatars/02.png",
      },
      resource: {
        name: "Basketball Set",
        category: "Sports Equipment",
      },
      quantity: 10,
      timestamp: "2023-05-26T13:45:00Z",
    },
    {
      id: "3",
      type: "addition",
      user: {
        name: "Sarah Lee",
        department: "Administration",
        avatar: "/avatars/03.png",
      },
      resource: {
        name: "Chromebooks",
        category: "Digital Devices",
      },
      quantity: 15,
      timestamp: "2023-05-26T12:15:00Z",
    },
    {
      id: "4",
      type: "reservation",
      user: {
        name: "Robert Chen",
        department: "Mathematics",
        avatar: "/avatars/04.png",
      },
      resource: {
        name: "Computer Lab A",
        category: "Facilities",
      },
      quantity: 1,
      timestamp: "2023-05-26T11:30:00Z",
    },
    {
      id: "5",
      type: "maintenance",
      user: {
        name: "Lisa Wong",
        department: "IT Support",
        avatar: "/avatars/05.png",
      },
      resource: {
        name: "Projector #2",
        category: "AV Equipment",
      },
      quantity: 1,
      timestamp: "2023-05-26T10:45:00Z",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "check_out":
        return <Icons.arrowRight className="h-4 w-4 text-amber-500" />;
      case "check_in":
        return <Icons.check className="h-4 w-4 text-emerald-500" />;
      case "addition":
        return <Icons.add className="h-4 w-4 text-blue-500" />;
      case "reservation":
        return <Icons.calendar className="h-4 w-4 text-purple-500" />;
      case "maintenance":
        return <Icons.settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Icons.moreVertical className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case "check_out":
        return (
          <>
            <span className="font-medium">{activity.user.name}</span> checked out{" "}
            <span className="font-medium">{activity.resource.name}</span>
            {activity.quantity > 1 ? ` (${activity.quantity} items)` : ""}
          </>
        );
      case "check_in":
        return (
          <>
            <span className="font-medium">{activity.user.name}</span> returned{" "}
            <span className="font-medium">{activity.resource.name}</span>
            {activity.quantity > 1 ? ` (${activity.quantity} items)` : ""}
          </>
        );
      case "addition":
        return (
          <>
            <span className="font-medium">{activity.user.name}</span> added{" "}
            <span className="font-medium">
              {activity.quantity} {activity.resource.name}
            </span>{" "}
            to inventory
          </>
        );
      case "reservation":
        return (
          <>
            <span className="font-medium">{activity.user.name}</span> reserved{" "}
            <span className="font-medium">{activity.resource.name}</span>
          </>
        );
      case "maintenance":
        return (
          <>
            <span className="font-medium">{activity.user.name}</span> reported{" "}
            <span className="font-medium">{activity.resource.name}</span> for
            maintenance
          </>
        );
      default:
        return "Unknown activity";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest resource transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 rounded-md border p-3 transition-all hover:bg-muted/50"
            >
              <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">{getActivityText(activity)}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.user.department} ·{" "}
                  {formatDate(activity.timestamp)}
                </p>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="View details"
                >
                  <Icons.moreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  );
}
