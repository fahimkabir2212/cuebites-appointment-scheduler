'use server';

import { cookies } from 'next/headers';
import { handleResponse } from './handleResponse';

export interface ApiResponse {
  status: number;
  success: boolean;
  message: string;
  errorDescription?: string;
  [key: string]: any;
}

export interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
  cache?: RequestCache;
  revalidate?: number;
  body?: any;
}

const DEFAULT_FETCH_OPTIONS = {
  cache: 'no-store' as RequestCache,
  next: { revalidate: 0 },
  credentials: 'omit' as RequestCredentials,
};

export async function request(
  method: string,
  url: string,
  body?: any,
  options: RequestOptions = {},
): Promise<ApiResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const isFormData = body instanceof FormData;
  const finalBody = isFormData ? body : body ? JSON.stringify(body) : undefined;

  const { headers: optionHeaders, ...restOptions } = options;

  const finalHeaders: HeadersInit = {
    ...(isFormData ? {} : body ? { 'Content-Type': 'application/json' } : {}),
    ...(optionHeaders || {}),
  };

  const finalOptions: RequestInit = {
    method,
    headers: finalHeaders,
    body: finalBody,
    ...DEFAULT_FETCH_OPTIONS,
    ...restOptions,
    next: {
      revalidate: options.revalidate ?? DEFAULT_FETCH_OPTIONS.next.revalidate,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    return await handleResponse(response, url, accessToken);
  } catch (err: any) {
    return {
      status: 503,
      success: false,
      message: 'Could not connect to the server.',
      errorDescription: err?.message || 'Unknown network error',
    };
  }
}
