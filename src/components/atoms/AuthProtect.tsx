import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";

interface AuthProtectProps {
  children: ReactElement;
}

export function AuthProtect({
  children,
}: AuthProtectProps): ReactElement {
  const user = useCurrentUser();
  const location = useLocation();
  const normalizedPathRole =
    location.pathname.split("/")[1]?.toLowerCase() ?? "";
  const normalizedUserRole = user?.role?.toLowerCase() ?? "";

  if (normalizedUserRole && normalizedPathRole) {
    if (normalizedUserRole === normalizedPathRole) {
      return children;
    }
  }

  return <Navigate to="/*" replace />;
}
