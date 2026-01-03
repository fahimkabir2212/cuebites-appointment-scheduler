import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/apiResponse";
import { Prisma } from "@/generated/prisma/client";
import { isValidEmail } from "@/lib/validators";

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

// POST /api/staff
export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

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

    const existingStaff = await prisma.staff.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingStaff) {
      return apiResponse({
        status: 409,
        success: false,
        message: "Email already exists",
      });
    }

    const staff = await prisma.staff.create({
      data: { name, email },
    });

    return apiResponse({
      status: 201,
      success: true,
      message: "Staff created successfully",
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
      message: "Failed to create staff",
    });
  }
}
