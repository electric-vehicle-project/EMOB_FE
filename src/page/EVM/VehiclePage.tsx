import { VehicleList } from "../../components/organisms/EVM/VehicleList";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { Tag } from "antd";

export const VehiclePage = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* ✅ Tiêu đề */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Quản lý xe điện
      </h1>

      {/* ✅ Thẻ role */}
      <p className="text-gray-600 mb-6">
        <Tag
          color={
            role === "ADMIN"
              ? "green"
              : role === "EVM_STAFF"
              ? "blue"
              : "default"
          }
          className="text-base font-medium px-4 py-1"
        >
          {role}
        </Tag>
      </p>

      {/* ✅ Danh sách xe - VehicleList xử lý nút Thêm xe */}
      <VehicleList />
    </div>
  );
};
