import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { ROUTES } from "../../model/routePaths";

interface AuthProtectProps {
  children: ReactElement;
  allowedRoles?: string[]; // thêm props cho phép nhiều role
}

// export function AuthProtect({
//   children,
// }: AuthProtectProps): ReactElement {
//   const user = useCurrentUser();
//   const location = useLocation();
//   const normalizedPathRole =
//     location.pathname.split("/")[1]?.toLowerCase() ?? "";
//   const normalizedUserRole = user?.role?.toLowerCase() ?? "";

//   if (normalizedUserRole && normalizedPathRole) {
//     if (normalizedUserRole === normalizedPathRole) {
//       return children;
//     }
//   }

//   return <Navigate to="/*" replace />;
// }

export function AuthProtect({
  children,
  allowedRoles,
}: AuthProtectProps): ReactElement {
  const user = useCurrentUser();
  const location = useLocation();

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to={ROUTES.AUTH + "/" + ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const normalizedUserRole = user.role?.toLowerCase() ?? "";

  // Nếu có danh sách role được phép
  if (allowedRoles && !allowedRoles.map((r) => r.toLowerCase()).includes(normalizedUserRole)) {
    return <Navigate to={`/${normalizedUserRole}/dashboard`} replace />;
  }

  // Nếu user hợp lệ
  return children;
}

