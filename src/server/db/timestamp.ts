export function withInsertTimestamps<T extends Record<string, any>>(row: T) {
  const now = new Date().toISOString();
  return { ...row, created_at: now, updated_at: now };
}

export function withUpdateTimestamp<T extends Record<string, any>>(patch: T) {
  const now = new Date().toISOString();
  return { ...patch, updated_at: now };
}
