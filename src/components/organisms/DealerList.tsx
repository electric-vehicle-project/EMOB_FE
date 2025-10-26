import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { message, Spin, Empty } from "antd";
import type { IDealer } from "../../model/Dealer";
import { DealerTable } from "../molecules/DealerTable";
import { SearchBar } from "../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import { useDebounce } from "../../hook/useDebounce";
import { useCurrentUser } from "../../utils/getCurrentUser";
import {
  useDealers,
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
  const { data, refetch, isLoading, isError, error } = useDealers();
  const dealers: IDealer[] = useMemo(() => data?.result?.data ?? [], [data]);

  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer();
  const deleteDealer = useDeleteDealer();

  // ===== ROLE CONTROL =====
  const user = useCurrentUser();
  const canModify = ["ADMIN", "EVM_STAFF"].includes(
    (user as { role?: string } | null)?.role || ""
  );

  // ===== SEARCH =====
  const filtered = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();
    return dealers.filter((d) => d.name.toLowerCase().includes(keyword));
  }, [dealers, debouncedSearch]);

  // ===== SAVE =====
  const handleSave = async (values: IDealer) => {
    try {
      if (editDealer) {
        await updateDealer.mutateAsync({ id: editDealer.id!, data: values });
        message.success("Cập nhật đại lý thành công!");
      } else {
        await createDealer.mutateAsync(values);
        message.success("Tạo mới đại lý thành công!");
      }
      setModalOpen(false);
      setEditDealer(undefined);
      refetch();
    } catch {
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  // ===== DELETE =====
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDealer.mutateAsync(deleteId);
      message.success("Xóa thành công!");
      setDeleteId(null);
      refetch();
    } catch {
      message.error("Không thể xóa đại lý, vui lòng thử lại!");
    }
  };

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách đại lý..." />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium mb-4">
          Không thể tải danh sách đại lý.
        </p>
        <p className="text-gray-500">{error?.message || "Vui lòng thử lại."}</p>
        <Button
          type="primary"
          onClick={() => refetch()}
          className="mt-4 !bg-[#627254] hover:!bg-[#525e46]"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // ===== MAIN CONTENT =====
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* --- Search & Add Button --- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm đại lý..."
          className="w-full sm:max-w-[420px]"
        />

        {canModify && (
          <Button
            type="primary"
            onClick={() => setModalOpen(true)}
            className="!bg-[#627254] hover:!bg-[#525e46] text-white rounded-xl px-6 py-2"
          >
            Thêm đại lý mới
          </Button>
        )}
      </div>

      {/* --- Table Wrapper (no hover, static) --- */}
      <div className="overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-100">
        {filtered.length > 0 ? (
          <DealerTable
            data={filtered}
            onEdit={(d) => {
              setEditDealer(d);
              setModalOpen(true);
            }}
            onDelete={(id) => setDeleteId(id)}
            canModify={canModify}
          />
        ) : (
          <Empty
            description="Không tìm thấy đại lý nào"
            className="py-10 text-gray-500"
          />
        )}
      </div>

      {/* --- Modal Thêm/Sửa --- */}
      {canModify && (
        <>
          <DealerModal
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditDealer(undefined);
            }}
            onSubmit={handleSave}
            initialValues={editDealer}
          />

          <DeleteConfirm
            open={!!deleteId}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
            message="Bạn có chắc chắn muốn xóa đại lý này?"
          />
        </>
      )}
    </motion.div>
  );
};
