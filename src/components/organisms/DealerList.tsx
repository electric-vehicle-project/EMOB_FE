import { useState } from "react";
import { Spin } from "antd";
import { toast } from "react-toastify";
import type { IDealer } from "../../model/Dealer";
import { DealerTable } from "../molecules/DealerTable";
import { SearchBar } from "../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import { useDebounce } from "../../hook/useDebounce";
import {
  useGetDealers,
  useCreateDealer,
  useUpdateDealer,
  useDeleteDealer,
} from "../../service/dealerService";

export const DealerList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ===== API HOOKS =====
  const { data: dealers = [], refetch, isLoading } = useGetDealers();
  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer();
  const deleteDealer = useDeleteDealer();

  // ===== FILTER TÌM KIẾM (client-side) =====
  const filtered = dealers.filter((d: IDealer) =>
    d.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // ✅ Lưu (thêm hoặc sửa)
  const handleSave = async (values: IDealer) => {
    try {
      if (editDealer?.id) {
        await updateDealer.mutateAsync({
          id: editDealer.id,
          data: {
            name: values.name,
            contactInfo: values.contactInfo,
            country: values.country,
          },
        });
        toast.success("Cập nhật đại lý thành công!");
      } else {
        await createDealer.mutateAsync({
          name: values.name,
          contactInfo: values.contactInfo,
          country: values.country,
        });
        toast.success("Thêm đại lý mới thành công!");

        // 🟢 Đồng bộ lại danh sách
        refetch();
      }

      setModalOpen(false);
      setEditDealer(undefined);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Lỗi khi lưu thông tin đại lý!"
      );
    }
  };

  // ✅ Xóa
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDealer.mutateAsync(deleteId);
      toast.success("Xóa đại lý thành công!");
      refetch();
      setDeleteId(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể xóa đại lý!");
    }
  };

  return (
    <Spin
      spinning={
        isLoading ||
        createDealer.isPending ||
        updateDealer.isPending ||
        deleteDealer.isPending
      }
      tip="Đang xử lý..."
      size="large"
    >
      <div className="space-y-4">
        {/* Thanh tìm kiếm + nút thêm */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm đại lý..."
            className="w-full sm:max-w-[420px] hover-lift"
          />

          <Button
            type="primary"
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto sm:ml-4 px-6 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Thêm đại lý mới
          </Button>
        </div>

        {/* Bảng đại lý (đã có sort & filter trong bảng) */}
        <DealerTable
          data={filtered}
          onEdit={(d) => {
            setEditDealer(d);
            setModalOpen(true);
          }}
          onDelete={(id) => setDeleteId(id)}
        />

        {/* Modal thêm/sửa */}
        <DealerModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditDealer(undefined);
          }}
          onSubmit={handleSave}
          initialValues={editDealer}
        />

        {/* Xác nhận xóa */}
        <DeleteConfirm
          open={!!deleteId}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          message="Bạn có chắc chắn muốn xóa đại lý này không?"
        />
      </div>
    </Spin>
  );
};
