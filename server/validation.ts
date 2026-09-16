import { badRequest } from "./errors";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asRecord(value: unknown, label = "body"): Record<string, unknown> {
  if (!isRecord(value)) {
    throw badRequest(`${label} must be a JSON object`);
  }
  return value;
}

export function requireString(
  obj: Record<string, unknown>,
  key: string,
  maxLength = 10000
): string {
  const value = obj[key];
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`Missing or invalid field: ${key}`);
  }
  if (value.length > maxLength) {
    throw badRequest(`Field ${key} is too long (max ${maxLength} characters)`);
  }
  return value.trim();
}

export function optionalString(
  obj: Record<string, unknown>,
  key: string,
  maxLength = 10000
): string | undefined {
  const value = obj[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw badRequest(`Field ${key} must be a string`);
  }
  if (value.length > maxLength) {
    throw badRequest(`Field ${key} is too long (max ${maxLength} characters)`);
  }
  return value.trim();
}

export function requireEnum<T extends string>(
  obj: Record<string, unknown>,
  key: string,
  allowed: readonly T[]
): T {
  const value = obj[key];
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw badRequest(`Field ${key} must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

export function optionalEnum<T extends string>(
  obj: Record<string, unknown>,
  key: string,
  allowed: readonly T[]
): T | undefined {
  const value = obj[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw badRequest(`Field ${key} must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

export function requireObject(
  obj: Record<string, unknown>,
  key: string
): Record<string, unknown> {
  const value = obj[key];
  if (!isRecord(value)) {
    throw badRequest(`Field ${key} must be an object`);
  }
  return value;
}

export function optionalObject(
  obj: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined {
  const value = obj[key];
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    throw badRequest(`Field ${key} must be an object`);
  }
  return value;
}

export function requireArray(obj: Record<string, unknown>, key: string, maxItems = 500): unknown[] {
  const value = obj[key];
  if (!Array.isArray(value)) {
    throw badRequest(`Field ${key} must be an array`);
  }
  if (value.length > maxItems) {
    throw badRequest(`Field ${key} has too many items (max ${maxItems})`);
  }
  return value;
}

export function optionalArray(obj: Record<string, unknown>, key: string, maxItems = 500): unknown[] | undefined {
  const value = obj[key];
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw badRequest(`Field ${key} must be an array`);
  }
  if (value.length > maxItems) {
    throw badRequest(`Field ${key} has too many items (max ${maxItems})`);
  }
  return value;
}

export function optionalBoolean(obj: Record<string, unknown>, key: string): boolean | undefined {
  const value = obj[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "boolean") {
    throw badRequest(`Field ${key} must be a boolean`);
  }
  return value;
}