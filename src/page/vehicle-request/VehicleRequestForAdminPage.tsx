import VehicleRequestForAdminList from "../../components/organisms/vehicleRequest/VehicleRequestForAdminList";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const VehicleRequestForAdminPage = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  // Admin mới có quyền xem
  const canAccess = ["ADMIN", "EVM_STAFF"].includes(role);

  return (
    <CardWrapper
      title="Quản lý yêu cầu xe"
      subtitle={
        canAccess
          ? "Theo dõi, xem và duyệt các yêu cầu xe từ toàn bộ đại lý"
          : "Bạn không có quyền truy cập trang này"
      }
      variant="dashboard"
    >
      {canAccess ? (
        <VehicleRequestForAdminList />
      ) : (
        <p className="text-center text-red-500 py-10 font-medium">
          Access Denied
        </p>
      )}
    </CardWrapper>
  );
};

export default VehicleRequestForAdminPage;
