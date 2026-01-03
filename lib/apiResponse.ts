import { NextResponse } from "next/server";

export function apiResponse<T>({
  status,
  success,
  message,
  data,
}: {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}) {
  return NextResponse.json(
    {
      status,
      success,
      message,
      ...(data !== undefined && { data }),
    },
    { status }
  );
}
