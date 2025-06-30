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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DashboardUpcomingReservationsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardUpcomingReservations({
  className,
  ...props
}: DashboardUpcomingReservationsProps) {
  // Mock data - in a real app, this would come from your API
  const reservations = [
    {
      id: "1",
      resourceName: "Computer Lab A",
      user: {
        name: "Robert Chen",
        department: "Mathematics",
        avatar: "/avatars/04.png",
      },
      startTime: "2023-05-27T10:00:00Z",
      endTime: "2023-05-27T11:30:00Z",
      purpose: "Math Quiz",
      status: "approved",
    },
    {
      id: "2",
      resourceName: "Auditorium",
      user: {
        name: "Emily Rodriguez",
        department: "Music",
        avatar: "/avatars/06.png",
      },
      startTime: "2023-05-27T13:00:00Z",
      endTime: "2023-05-27T15:00:00Z",
      purpose: "Choir Practice",
      status: "pending",
    },
    {
      id: "3",
      resourceName: "Science Lab 2",
      user: {
        name: "Jane Smith",
        department: "Science",
        avatar: "/avatars/01.png",
      },
      startTime: "2023-05-28T09:00:00Z",
      endTime: "2023-05-28T10:30:00Z",
      purpose: "Chemistry Experiment",
      status: "approved",
    },
    {
      id: "4",
      resourceName: "Gym",
      user: {
        name: "Mark Johnson",
        department: "Physical Education",
        avatar: "/avatars/02.png",
      },
      startTime: "2023-05-28T13:00:00Z",
      endTime: "2023-05-28T14:30:00Z",
      purpose: "Basketball Practice",
      status: "approved",
    },
    {
      id: "5",
      resourceName: "Digital Media Room",
      user: {
        name: "Lisa Wong",
        department: "Art",
        avatar: "/avatars/05.png",
      },
      startTime: "2023-05-29T11:00:00Z",
      endTime: "2023-05-29T12:30:00Z",
      purpose: "Digital Art Workshop",
      status: "pending",
    },
  ];

  const formatDateRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })} · ${start.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Different days
    return `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} ${start.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} ${end.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-secondary-emerald">
            Approved
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className={cn("col-span-4", className)} {...props}>
      <CardHeader>
        <CardTitle>Upcoming Reservations</CardTitle>
        <CardDescription>
          Scheduled resource reservations for the next days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col space-y-2 rounded-md border p-4 transition-all hover:bg-muted/50 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <div className="flex-shrink-0 sm:w-1/4">
                <div className="font-medium">{reservation.resourceName}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(
                    reservation.startTime,
                    reservation.endTime
                  )}
                </p>
              </div>
              <div className="flex items-center sm:w-1/4">
                <Avatar className="mr-2 h-8 w-8">
                  <AvatarImage
                    src={reservation.user.avatar}
                    alt={reservation.user.name}
                  />
                  <AvatarFallback>
                    {reservation.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{reservation.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.user.department}
                  </p>
                </div>
              </div>
              <div className="sm:w-1/4">
                <p className="text-sm">{reservation.purpose}</p>
              </div>
              <div className="flex items-center justify-between sm:w-1/4">
                <div className="flex-shrink-0">
                  {getStatusBadge(reservation.status)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <span className="sr-only">Actions</span>
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
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View All Reservations
        </Button>
      </CardFooter>
    </Card>
  );
}
