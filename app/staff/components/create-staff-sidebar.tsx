"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { createStaff } from "../actions";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

type Day = (typeof DAYS)[number];

type TimeRange = {
  startTime: string;
  endTime: string;
  error?: string;
};

type Availability = {
  dayOfWeek?: Day;
  dayError?: string;
  timeRanges: TimeRange[];
};

function timeToMinute(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function CreateStaffSidebar() {
  const [open, setOpen] = useState(false);

  const [staffDetails, setStaffDetails] = useState({
    name: "",
    email: "",
  });

  const [staffErrors, setStaffErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );

  const selectedDays = availability
    .map((a) => a.dayOfWeek)
    .filter(Boolean) as Day[];

  const addAvailabilityBlock = () => {
    setAvailability((prev) => [
      ...prev,
      {
        timeRanges: [{ startTime: "", endTime: "" }],
      },
    ]);
    setAvailabilityError(null);
  };

  const removeAvailabilityBlock = (index: number) => {
    if (index === 0) return;
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const setDay = (index: number, day: Day) => {
    setAvailability((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, dayOfWeek: day, dayError: undefined } : a
      )
    );
  };

  const addRange = (aIndex: number) => {
    setAvailability((prev) =>
      prev.map((a, i) =>
        i === aIndex
          ? {
              ...a,
              timeRanges: [...a.timeRanges, { startTime: "", endTime: "" }],
            }
          : a
      )
    );
  };

  const updateRange = (
    aIndex: number,
    rIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((a, i) => {
        if (i !== aIndex) return a;

        const ranges = a.timeRanges.map((r, ri) => {
          if (ri !== rIndex) return r;

          let error: string | undefined;

          const updated = { ...r, [field]: value };

          if (!updated.startTime || !updated.endTime) {
            error = "Start and end time are required";
          } else if (
            timeToMinute(updated.endTime) <= timeToMinute(updated.startTime)
          ) {
            error = "End time must be after start time";
          }

          return { ...updated, error };
        });

        return { ...a, timeRanges: ranges };
      })
    );
  };

  const removeRange = (aIndex: number, rIndex: number) => {
    if (rIndex === 0) return;

    setAvailability((prev) =>
      prev.map((a, i) =>
        i === aIndex
          ? {
              ...a,
              timeRanges: a.timeRanges.filter((_, ri) => ri !== rIndex),
            }
          : a
      )
    );
  };

  const resetForm = () => {
    setStaffDetails({ name: "", email: "" });
    setStaffErrors({});
    setAvailability([]);
    setAvailabilityError(null);
  };

  const handleSubmit = async () => {
    const errors: typeof staffErrors = {};
    let hasAvailabilityError = false;

    if (!staffDetails.name.trim()) errors.name = "Name is required";
    if (!staffDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(staffDetails.email)) {
      errors.email = "Invalid email address";
    }

    if (availability.length === 0) {
      setAvailabilityError("Weekly availability is required");
      hasAvailabilityError = true;
    }

    const validatedAvailability = availability.map((a) => {
      const dayError = a.dayOfWeek ? undefined : "Day is required";
      if (!a.dayOfWeek) hasAvailabilityError = true;

      const ranges = a.timeRanges.map((r) => {
        let error = r.error;

        if (!r.startTime || !r.endTime) {
          error = "Start and end time are required";
          hasAvailabilityError = true;
        }

        return { ...r, error };
      });

      return { ...a, dayError, timeRanges: ranges };
    });

    setAvailability(validatedAvailability);

    if (Object.keys(errors).length > 0 || hasAvailabilityError) {
      setStaffErrors(errors);
      return;
    }

    const payload = {
      name: staffDetails.name,
      email: staffDetails.email,
      availability: availability.map((a) => ({
        dayOfWeek: a.dayOfWeek!,
        timeRanges: a.timeRanges.map((r) => ({
          startMinute: timeToMinute(r.startTime),
          endMinute: timeToMinute(r.endTime),
        })),
      })),
    };

    try {
      const response = await createStaff(payload);

      if (response?.success) {
        toast.success("Success", {
          description: response.message || "Staff created successfully",
        });
        setOpen(false);
        resetForm();
      } else {
        toast.error("Error", {
          description: response?.message || "Failed to create staff",
        });
      }
    } catch {
      toast.error("Error", {
        description: "Something went wrong while creating staff",
      });
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus size={16} className="mr-2" />
          Create Staff
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-105 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Staff</SheetTitle>
        </SheetHeader>

        <div className="m-4 space-y-6">
          {/* Name */}
          <div>
            <Label className="mb-2">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={staffDetails.name}
              onChange={(e) => {
                setStaffDetails((p) => ({ ...p, name: e.target.value }));
                setStaffErrors((p) => ({ ...p, name: undefined }));
              }}
            />
            {staffErrors.name && (
              <p className="text-xs text-red-500 mt-1">{staffErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label className="mb-2">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              value={staffDetails.email}
              onChange={(e) => {
                setStaffDetails((p) => ({ ...p, email: e.target.value }));
                setStaffErrors((p) => ({ ...p, email: undefined }));
              }}
            />
            {staffErrors.email && (
              <p className="text-xs text-red-500 mt-1">{staffErrors.email}</p>
            )}
          </div>

          {/* Weekly Availability */}
          <div className="flex justify-between items-center">
            <Label>
              Weekly Availability <span className="text-red-500">*</span>
            </Label>
            <Button size="icon" variant="ghost" onClick={addAvailabilityBlock}>
              <Plus size={18} />
            </Button>
          </div>

          {availabilityError && (
            <p className="text-xs text-red-500">{availabilityError}</p>
          )}

          {availability.map((a, aIndex) => (
            <div key={aIndex} className="border rounded-md p-3 space-y-3">
              {/* Day selector + remove */}
              <div className="flex gap-2 items-center">
                <Select
                  value={a.dayOfWeek}
                  onValueChange={(v) => setDay(aIndex, v as Day)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem
                        key={d}
                        value={d}
                        disabled={selectedDays.includes(d)}
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={aIndex === 0}
                  onClick={() => removeAvailabilityBlock(aIndex)}
                >
                  <Trash size={16} />
                </Button>
              </div>

              {a.dayError && (
                <p className="text-xs text-red-500">{a.dayError}</p>
              )}

              {/* Time ranges */}
              {a.timeRanges.map((r, rIndex) => (
                <div key={rIndex} className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={r.startTime}
                      onChange={(e) =>
                        updateRange(aIndex, rIndex, "startTime", e.target.value)
                      }
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={r.endTime}
                      onChange={(e) =>
                        updateRange(aIndex, rIndex, "endTime", e.target.value)
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={rIndex === 0}
                      onClick={() => removeRange(aIndex, rIndex)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>

                  {r.error && <p className="text-xs text-red-500">{r.error}</p>}
                </div>
              ))}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => addRange(aIndex)}
              >
                <Plus size={14} className="mr-1" />
                Add time range
              </Button>
            </div>
          ))}

          <Button className="w-full" onClick={handleSubmit}>
            Create Staff
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
