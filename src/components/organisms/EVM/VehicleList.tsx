import { useState } from "react";
import { Spin } from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { VehicleTable } from "../../molecules/VehicleTable";
import { SearchBar } from "../../molecules/SearchBar";
import { VehicleModal } from "./VehicleModal";
import { DeleteConfirm } from "../DeleteConfirm";
import { Button } from "../../atoms/Button";
import { useDebounce } from "../../../hook/useDebounce";
import {
  useGetVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "../../../service/vehicleService";
import type { IVehicle } from "../../../model/Vehicle";
import { ROUTES } from "../../../model/routePaths";

export const VehicleList = ({
  canEditPrices = false,
}: {
  canEditPrices?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<IVehicle | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const navigate = useNavigate();

  const { data: vehicles = [], refetch, isLoading } = useGetVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const filtered = vehicles.filter(
    (v: IVehicle) =>
      v.brand.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.model.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleSave = async (values: IVehicle) => {
    try {
      if (editVehicle?.id) {
        await updateVehicle.mutateAsync({ id: editVehicle.id, data: values });
        toast.success("Cập nhật xe thành công!");
      } else {
        await createVehicle.mutateAsync(values);
        toast.success("Thêm xe mới thành công!");
      }
      refetch();
      setModalOpen(false);
      setEditVehicle(undefined);
    } catch {
      toast.error("Lỗi khi lưu thông tin xe!");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle.mutateAsync(deleteId);
      toast.success("Xoá xe thành công!");
      refetch();
      setDeleteId(null);
    } catch {
      toast.error("Không thể xoá xe!");
    }
  };

  // 👉 Khi bấm “Thêm đơn vị” → chuyển hướng sang trang Bulk
  const onAddUnit = (vehicleId: string) => {
    navigate(
      `/${ROUTES.DASHBOARD}/${ROUTES.EVM_VEHICLE_BULK}?vehicleId=${vehicleId}`
    );
  };

  return (
    <Spin spinning={isLoading} tip="Đang tải..." size="large">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm theo hãng xe hoặc mẫu xe..."
            className="w-full sm:max-w-[420px]"
          />
          <Button type="primary" onClick={() => setModalOpen(true)}>
            ➕ Thêm xe mới
          </Button>
        </div>

        <VehicleTable
          data={filtered}
          onEdit={(v) => {
            setEditVehicle(v);
            setModalOpen(true);
          }}
          onDelete={(id) => setDeleteId(id)}
          onAddUnit={onAddUnit}
          canEditPrices={canEditPrices}
        />

        <VehicleModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditVehicle(undefined);
          }}
          onSubmit={handleSave}
          initialValues={editVehicle}
          canEditPrices={canEditPrices}
        />

        <DeleteConfirm
          open={!!deleteId}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          message="Bạn có chắc chắn muốn xoá xe này không?"
        />
      </div>
    </Spin>
  );
};
