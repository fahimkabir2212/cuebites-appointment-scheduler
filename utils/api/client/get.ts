'use server';

import { cookies } from 'next/headers';
import { ApiResponse, request, RequestOptions } from './request';

export async function getPublic(
  url: string,
  overrides: Partial<RequestOptions> = {},
): Promise<ApiResponse> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(overrides.headers ?? {}),
  };

  return request('GET', url, undefined, {
    ...overrides,
    headers,
  });
}

export async function getPrivate(
  url: string,
  overrides: Partial<RequestOptions> = {},
): Promise<ApiResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(overrides.headers ?? {}),
  };

  return request('GET', url, undefined, {
    ...overrides,
    headers,
  });
}
