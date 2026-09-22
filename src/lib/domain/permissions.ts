export type Role = "ADMIN" | "MEMBER" | "VIEWER";

export function canWrite(role: Role) {
  return role === "ADMIN" || role === "MEMBER";
}

export function canHardDelete(role: Role) {
  return role === "ADMIN";
}

export function canManageUsers(role: Role) {
  return role === "ADMIN";
}

export function canManageSettings(role: Role) {
  return role === "ADMIN";
}

export function needsDeleteConfirm(role: Role) {
  return role === "MEMBER";
}

export function canExport(role: Role) {
  return role === "ADMIN" || role === "MEMBER" || role === "VIEWER";
}

export function canSoftDelete(role: Role) {
  return canWrite(role);
}
