import { PaginationParams } from './types';

/**
 * Builds URL query parameters for pagination
 * @param params - Pagination parameters
 * @returns Object with formatted query parameters
 */
export function buildPaginationParams(params: PaginationParams): Record<string, string | number> {
  const queryParams: Record<string, string | number> = {};
  
  if (params.page !== undefined && params.page >= 0) {
    queryParams.page = params.page;
  }
  
  if (params.limit !== undefined && params.limit > 0) {
    queryParams.limit = params.limit;
  }
  
  if (params.sort) {
    queryParams.sort = params.sort;
  }
  
  if (params.order) {
    queryParams.order = params.order;
  }
  
  return queryParams;
}

/**
 * Constructs the full resource path with appropriate path parameters
 * @param path - Base path with placeholders
 * @param params - Object containing path parameter values
 * @returns Formatted path with parameters substituted
 * 
 * @example
 * // Returns "/users/123/posts/456"
 * formatPath("/users/:userId/posts/:postId", { userId: 123, postId: 456 });
 */
export function formatPath(path: string, params: Record<string, string | number>): string {
  let formattedPath = path;
  
  // Replace all path parameters
  Object.entries(params).forEach(([key, value]) => {
    formattedPath = formattedPath.replace(`:${key}`, String(value));
  });
  
  return formattedPath;
}

/**
 * Validates that all required parameters are present
 * @param params - Object containing parameters to validate
 * @param requiredParams - Array of required parameter keys
 * @throws Error if any required parameter is missing
 */
export function validateRequiredParams(
  params: Record<string, unknown>,
  requiredParams: string[]
): void {
  const missingParams = requiredParams.filter(param => 
    params[param] === undefined || params[param] === null
  );
  
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }
}

/**
 * Deep clones an object to avoid reference issues
 * @param obj - Object to clone
 * @returns Deep cloned copy of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sanitizes data by removing undefined and null values
 * @param data - Object to sanitize
 * @returns Sanitized object with nullish values removed
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized: Partial<T> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  });
  
  return sanitized;
}

/**
 * Checks if a value is a plain object
 * @param value - Value to check
 * @returns True if the value is a plain object
 */
export function isPlainObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}