/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { HttpError } from "./errors";

type AsyncRouteHandler<Args extends any[]> = (
  ...args: Args
) => Promise<Response | NextResponse>;

export function catchAsync<Args extends any[]>(
  handler: AsyncRouteHandler<Args>
) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return NextResponse.json(
          {
            status: error.status,
            success: false,
            message: error.message,
            errorDescription: error.errorDescription,
          },
          { status: error.status }
        );
      }

      console.error("Unhandled route error:", error);

      return NextResponse.json(
        {
          status: 500,
          success: false,
          message: "Internal server error",
          errorDescription: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}
