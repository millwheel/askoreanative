import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function successResponse<T>(data: T, statusCode: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      status: statusCode,
    },
    { status: statusCode }
  );
}

export function errorResponse(
  statusCode: number,
  message: string,
  code?: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      error: message,
      status: statusCode,
      ...(code && { code }),
    },
    { status: statusCode }
  );
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse<never>> {
  return errorResponse(404, message, 'NOT_FOUND');
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse<never>> {
  return errorResponse(401, message, 'UNAUTHORIZED');
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse<never>> {
  return errorResponse(403, message, 'FORBIDDEN');
}

export function validationErrorResponse(message: string): NextResponse<ApiResponse<never>> {
  return errorResponse(400, message, 'VALIDATION_ERROR');
}

export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse<never>> {
  return errorResponse(500, message, 'SERVER_ERROR');
}

// Utility to handle async route handlers
export async function asyncHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error('Route handler error:', error);

    if (error instanceof ApiError) {
      return errorResponse(error.statusCode, error.message, error.code);
    }

    if (error instanceof SyntaxError) {
      return validationErrorResponse('Invalid request body');
    }

    return serverErrorResponse();
  }
}
