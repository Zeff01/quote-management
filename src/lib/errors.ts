export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): {
  message: string;
  statusCode: number;
} {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof Error) {
    return { message: error.message, statusCode: 500 };
  }

  return { message: "An unexpected error occurred", statusCode: 500 };
}
