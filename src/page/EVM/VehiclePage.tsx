import { useState } from "react";
import { Tag } from "antd";
import { VehicleList } from "../../components/organisms/EVM/VehicleList";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { VehicleUnitListModal } from "./VehicleUnitListModal";

export const VehiclePage = () => {
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Quản lý xe điện
      </h1>

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

      {/* ✅ Truyền callback để mở modal */}
      <VehicleList onViewUnits={setSelectedVehicleId} />

      {/* ✅ Modal xem lô xe */}
      {selectedVehicleId && (
        <VehicleUnitListModal
          key={selectedVehicleId}
          open={!!selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
          vehicleId={selectedVehicleId}
        />
      )}
    </div>
  );
};
