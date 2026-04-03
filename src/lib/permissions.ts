export function hasPermission(
  ownedPermissions: string[],
  permission?: string,
) {
  if (!permission) return true;
  return ownedPermissions.includes(permission);
}

export function hasAnyPermission(
  ownedPermissions: string[],
  requiredPermissions?: string[],
) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some((permission) =>
    ownedPermissions.includes(permission),
  );
}
