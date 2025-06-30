"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ResourceActionButtonProps {
  resourceId: string;
  resourceName: string;
  actionType: "check_out" | "check_in";
  maxQuantity: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ResourceActionButton({
  resourceId,
  resourceName,
  actionType,
  maxQuantity,
  variant = "outline",
  size = "sm",
  className,
}: ResourceActionButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState("");
  const [returnDate, setReturnDate] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleAction = () => {
    // In a real app, you would call an API endpoint to process the transaction
    console.log("Processing", actionType, "for resource", resourceId, {
      quantity,
      notes,
      returnDate: actionType === "check_out" ? returnDate : undefined,
    });

    // Show success toast
    toast({
      title: actionType === "check_out" ? "Resource checked out" : "Resource checked in",
      description: `${actionType === "check_out" ? "Checked out" : "Checked in"} ${quantity} ${resourceName}`,
    });

    // Close dialog and reset form
    setIsOpen(false);
    setQuantity(1);
    setNotes("");
    setReturnDate("");

    // In a real app, you would refresh the data
    // router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {actionType === "check_out" ? "Check Out" : "Check In"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "check_out" ? "Check Out" : "Check In"} Resource
          </DialogTitle>
          <DialogDescription>
            {actionType === "check_out"
              ? "Check out this resource for temporary use."
              : "Return this resource to the inventory."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resource">Resource</Label>
            <Input id="resource" value={resourceName} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity{" "}
              <span className="text-xs text-muted-foreground">
                (Max: {maxQuantity})
              </span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 0 && val <= maxQuantity) {
                  setQuantity(val);
                }
              }}
            />
          </div>
          {actionType === "check_out" && (
            <div className="space-y-2">
              <Label htmlFor="return-date">Expected Return Date</Label>
              <Input
                id="return-date"
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAction}>
            {actionType === "check_out" ? "Check Out" : "Check In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
