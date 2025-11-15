// src/pages/VehicleRequestPage.tsx

import VehicleRequestList from "../../components/organisms/vehicleRequest/VehicleRequestList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const VehicleRequestPage = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  // Quyền: chỉ MANAGER hoặc ADMIN được xem
  const canAccess = ["MANAGER", "ADMIN", "EVM_STAFF", "DEALER_STAFF"].includes(
    role
  );

  return (
    <CardWrapper
      title="Quản lý yêu cầu xe"
      subtitle={
        canAccess
          ? "Theo dõi và quản lý các yêu cầu xe từ đại lý"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <VehicleRequestList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};

export default VehicleRequestPage;
