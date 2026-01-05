interface ApiError {
  status: number;
  success: false;
  message: string;
  errorDescription?: string;
}

export async function handleResponse<T = any>(
  response: Response,
  url: string
): Promise<T | ApiError> {
  if (!response.ok) {
    console.error(`API request failed for ${url}:`, response.status);

    // // Handle unauthorized
    // if (accessToken && response.status === 401) {
    //   await logout();
    // }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let errorBody: any;
    try {
      errorBody = isJson ? await response.json() : await response.text();
    } catch {
      errorBody = null;
    }

    console.error("Error response:", response.status, errorBody);

    // Server errors
    if (response.status >= 500) {
      throw {
        status: response.status,
        success: false,
        message: (isJson && errorBody?.message) || "Something went wrong",
        errorDescription: `API Error: ${response.status} ${response.statusText}`,
      } as ApiError;
    }

    // Client-side JSON error response
    return (
      isJson ? errorBody : { status: response.status, success: false }
    ) as ApiError;
  }

  // Successful response
  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json")
    ? await response.json()
    : ((await response.text()) as T);
}
