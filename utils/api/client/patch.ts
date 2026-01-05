'use server';

import { cookies } from 'next/headers';
import { request, RequestOptions, ApiResponse } from './request';

export function patchPublic(
  url: string,
  body: any = {},
  overrides: Partial<RequestOptions> = {},
): Promise<ApiResponse> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(overrides.headers ?? {}),
  };

  return request('PATCH', url, body, {
    ...overrides,
    headers,
  });
}

export async function patchPrivate(
  url: string,
  body: any = {},
  overrides: Partial<RequestOptions> = {},
): Promise<ApiResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(overrides.headers ?? {}),
  };

  return request('PATCH', url, body, {
    ...overrides,
    headers,
  });
}
