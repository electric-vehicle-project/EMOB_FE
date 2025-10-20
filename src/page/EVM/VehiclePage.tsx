import { VehicleList } from "../../components/organisms/EVM/VehicleList";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";

export const VehiclePage = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const canCreate = role === "EVM_STAFF"; // chỉ EVM_STAFF được thêm

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Quản lý xe điện</h1>
        {canCreate && (
          <Button
            type="primary"
            onClick={() => navigate("/dashboard/evm/vehicle/new")}
          >
            ➕ Thêm xe mới
          </Button>
        )}
      </div>

      <p className="text-gray-600 mb-6">
        <Tag color={role === "ADMIN" ? "green" : "blue"} className="text-base font-medium px-4 py-1">
          {role}
        </Tag>
      </p>

      <VehicleList />
    </div>
  );
};
