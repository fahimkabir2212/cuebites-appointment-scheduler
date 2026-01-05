"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatMinute } from "@/utils/formatMinute";
import { StaffTableRow } from "../types";

export const staffColumns: ColumnDef<StaffTableRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const availabilities = row.original.availabilities;

      if (!availabilities.length) {
        return <span className="text-muted-foreground">Not set</span>;
      }

      return (
        <div className="flex flex-col gap-1 text-sm">
          {availabilities.map((day) => (
            <div key={day.dayOfWeek}>
              <span className="font-medium">{day.dayOfWeek}:</span>{" "}
              {day.timeRanges
                .map(
                  (r) =>
                    `${formatMinute(r.startMinute)}–${formatMinute(
                      r.endMinute
                    )}`
                )
                .join(", ")}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>("isActive");

      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
];
