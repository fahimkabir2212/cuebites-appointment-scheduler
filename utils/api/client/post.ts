import { cookies } from "next/headers";
import { request, RequestOptions, ApiResponse } from "./request";

export function postPublic(
  url: string,
  body: any = {},
  overrides: Partial<RequestOptions> = {}
): Promise<ApiResponse> {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(overrides.headers ?? {}),
  };

  return request("POST", url, body, {
    ...overrides,
    headers,
  });
}

export async function postPrivate(
  url: string,
  body: any = {},
  overrides: Partial<RequestOptions> = {}
): Promise<ApiResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(overrides.headers ?? {}),
  };

  return request("POST", url, body, {
    ...overrides,
    headers,
  });
}
