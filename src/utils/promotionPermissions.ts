export type Role = "DEALER_STAFF" | "MANAGER" | "EVM_STAFF" | "ADMIN";
export type Scope = "LOCAL" | "GLOBAL";

export const canCreate = (role: Role, scope: Scope) => {
  if (scope === "LOCAL") return role === "DEALER_STAFF";
  return role === "EVM_STAFF";
};

export const canEdit = (role: Role, scope: Scope) => {
  // Staff 2 bên chỉ được sửa field “an toàn” (không phải value) – ràng buộc ở Form.
  if (scope === "LOCAL") return role === "DEALER_STAFF" || role === "MANAGER";
  return role === "EVM_STAFF" || role === "ADMIN";
};

export const canEditValue = (role: Role) => {
  // chỉ manager/admin mới sửa value (duyệt)
  return role === "MANAGER" || role === "ADMIN";
};

export const canDelete = (role: Role, scope: Scope) => {
  if (scope === "LOCAL") return role === "MANAGER"; // chỉ dealer manager
  return role === "ADMIN"; // chỉ admin với GLOBAL
};
