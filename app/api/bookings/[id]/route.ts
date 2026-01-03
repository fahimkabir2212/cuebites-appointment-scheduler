import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/apiResponse";
import { catchAsync } from "../../../../lib/catchAsync";

export const GET = catchAsync(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    // ✅ Await params (your working pattern)
    const { id } = await context.params;

    const bookingId = Number(id);

    if (Number.isNaN(bookingId)) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Invalid booking id",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        staff: true,
      },
    });

    if (!booking) {
      return apiResponse({
        status: 404,
        success: false,
        message: "Booking not found",
      });
    }

    return apiResponse({
      status: 200,
      success: true,
      message: "Booking fetched successfully",
      data: booking,
    });
  }
);

export const PATCH = catchAsync(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await context.params;
    const bookingId = Number(id);

    if (Number.isNaN(bookingId)) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Invalid booking id",
      });
    }

    const body = await request.json();

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existing) {
      return apiResponse({
        status: 404,
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ Validate staffId if changing
    if (body.staffId !== undefined) {
      const staffExists = await prisma.staff.findUnique({
        where: { id: body.staffId },
        select: { id: true },
      });

      if (!staffExists) {
        return apiResponse({
          status: 400,
          success: false,
          message: "Invalid staffId",
        });
      }
    }

    const startTime = body.startTime
      ? new Date(body.startTime)
      : existing.startTime;

    const endTime = body.endTime ? new Date(body.endTime) : existing.endTime;

    const staffId = body.staffId ?? existing.staffId;

    if (startTime >= endTime) {
      return apiResponse({
        status: 400,
        success: false,
        message: "End time must be after start time",
      });
    }

    // 🔒 Overlap check
    const overlap = await prisma.booking.findFirst({
      where: {
        staffId,
        id: { not: bookingId },
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });

    if (overlap) {
      return apiResponse({
        status: 400,
        success: false,
        message: "This staff already has a booking during this time",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(body.staffId !== undefined && { staffId: body.staffId }),
        ...(body.clientName && { clientName: body.clientName }),
        ...(body.clientPhone && { clientPhone: body.clientPhone }),
        startTime,
        endTime,
        address: body.address,
        instructions: body.instructions,
      },
      include: {
        staff: true,
      },
    });

    return apiResponse({
      status: 200,
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  }
);

export const DELETE = catchAsync(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await context.params;
    const bookingId = Number(id);

    if (Number.isNaN(bookingId)) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Invalid booking id",
      });
    }

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existing) {
      return apiResponse({
        status: 404,
        success: false,
        message: "Booking not found",
      });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return apiResponse({
      status: 200,
      success: true,
      message: "Booking deleted successfully",
    });
  }
);
