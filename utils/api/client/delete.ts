'use server';

import { cookies } from 'next/headers';
import { request, RequestOptions, ApiResponse } from './request';

export function deletePublic(
  url: string,
  overrides: Partial<RequestOptions> = {},
): Promise<ApiResponse> {
  return request('DELETE', url, undefined, {
    ...overrides,
    headers: {
      Accept: 'application/json',
      ...(overrides.headers ?? {}),
    },
  });
}

export async function deletePrivate(
  url: string,
  overrides: Partial<RequestOptions> = {},
): Promise<ApiResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  return request('DELETE', url, undefined, {
    ...overrides,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(overrides.headers ?? {}),
    },
  });
}
