import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/apiResponse";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: {
      staff: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return apiResponse({
    status: 200,
    success: true,
    message: "Bookings fetched successfully",
    data: bookings,
  });
}

export async function POST(req: Request) {
  try {
    const {
      staffId,
      clientName,
      clientPhone,
      startTime,
      endTime,
      address,
      instructions,
    } = await req.json();

    /* ================= VALIDATION ================= */

    if (!staffId || !clientName || !clientPhone || !startTime || !endTime) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Missing required fields",
      });
    }

    if (clientName.trim().length === 0) {
      return apiResponse({
        status: 400,
        success: false,
        message: "clientName cannot be empty",
      });
    }

    if (clientPhone.trim().length < 6) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Invalid client phone number",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return apiResponse({
        status: 400,
        success: false,
        message: "End time must be after start time",
      });
    }

    /* ================= STAFF EXISTS ================= */

    const staffExists = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { id: true },
    });

    if (!staffExists) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Invalid staffId",
      });
    }

    /* ================= OVERLAP CHECK ================= */

    const overlap = await prisma.booking.findFirst({
      where: {
        staffId,
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (overlap) {
      return apiResponse({
        status: 400,
        success: false,
        message: "This staff already has a booking during this time",
      });
    }

    /* ================= CREATE BOOKING ================= */

    const booking = await prisma.booking.create({
      data: {
        staffId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        startTime: start,
        endTime: end,
        address,
        instructions,
      },
      include: {
        staff: true,
      },
    });

    return apiResponse({
      status: 201,
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return apiResponse({
      status: 500,
      success: false,
      message: "Failed to create booking",
    });
  }
}
