import { VehicleList } from "../../components/organisms/EVM/VehicleList";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { Tag } from "antd";

export const VehiclePage = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* Tiêu đề trang */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Quản lý xe điện
        </h1>
      </div>

      {/* Thẻ hiển thị vai trò */}
      <p className="text-gray-600 mb-6">
        {role === "ADMIN" ? (
          <Tag color="green" className="text-base font-medium px-4 py-1">
            ADMIN
          </Tag>
        ) : (
          <Tag color="blue" className="text-base font-medium px-4 py-1">
            EVM STAFF
          </Tag>
        )}
      </p>

      {/* Hiển thị VehicleList theo quyền */}
      <VehicleList
        canEditPrices={role === "ADMIN"} // ADMIN: chỉ chỉnh giá
        canAddUnit={role === "EVM_STAFF"} // STAFF: thêm lô xe
      />
    </div>
  );
};
