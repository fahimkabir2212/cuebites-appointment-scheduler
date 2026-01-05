import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/apiResponse";
import { Prisma, DayOfWeek } from "@/generated/prisma/client";
import { isValidEmail } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const { name, email, availability } = await req.json();

    /* ================= VALIDATION ================= */

    if (!name || !email) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Name and email are required",
      });
    }

    if (!isValidEmail(email)) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Invalid email address",
      });
    }

    if (availability && !Array.isArray(availability)) {
      return apiResponse({
        status: 400,
        success: false,
        message: "Availability must be an array",
      });
    }

    /* ================= TRANSACTION ================= */

    const staff = await prisma.$transaction(async (tx) => {
      // Create staff
      const staff = await tx.staff.create({
        data: { name, email },
      });

      // Create availability (if provided)
      if (availability?.length) {
        for (const day of availability) {
          if (!Object.values(DayOfWeek).includes(day.dayOfWeek)) {
            throw new Error(`Invalid dayOfWeek: ${day.dayOfWeek}`);
          }

          await tx.staffAvailability.create({
            data: {
              staffId: staff.id,
              dayOfWeek: day.dayOfWeek,
              timeRanges: {
                create: day.timeRanges.map((range: any) => {
                  if (
                    typeof range.startMinute !== "number" ||
                    typeof range.endMinute !== "number" ||
                    range.startMinute >= range.endMinute
                  ) {
                    throw new Error("Invalid time range");
                  }

                  return {
                    startMinute: range.startMinute,
                    endMinute: range.endMinute,
                  };
                }),
              },
            },
          });
        }
      }

      return staff;
    });

    return apiResponse({
      status: 201,
      success: true,
      message: "Staff and availability created successfully",
      data: staff,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return apiResponse({
          status: 409,
          success: false,
          message: "Email already exists",
        });
      }
    }

    return apiResponse({
      status: 500,
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create staff",
    });
  }
}

// GET /api/staff
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const skip = (page - 1) * limit;

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        availabilities: {
          orderBy: { dayOfWeek: "asc" },
          include: {
            timeRanges: {
              orderBy: { startMinute: "asc" },
            },
          },
        },
      },
    }),
    prisma.staff.count(),
  ]);

  return apiResponse({
    status: 200,
    success: true,
    message: "Staff fetched successfully",
    data: {
      items: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}
