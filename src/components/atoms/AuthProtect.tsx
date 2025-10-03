import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../utils/getCurrentUser";

interface AuthProtectProps {
  children: React.ReactElement;
}

export function AuthProtect({
  children,
}: AuthProtectProps): React.ReactElement {
  const user = useCurrentUser();
  const location = useLocation();
  const roleFromPath = location.pathname.split("/")[1];
  if (user?.role?.toLowerCase() === roleFromPath.toLowerCase()) {
    return children;
  } else {
    return <Navigate to="/*" replace />;
  }
}
