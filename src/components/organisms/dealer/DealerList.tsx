import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Result, Button, Spin, Empty } from "antd";
import type { IDealer } from "../../../model/Dealer";
import { SearchBar } from "../../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
import { DeleteConfirm } from "../DeleteConfirm";
import { useDebounce } from "../../../hook/useDebounce";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import {
  useDealers,
  useCreateDealer,
  useUpdateDealer,
  useDeleteDealer,
} from "../../../service/dealerService";
import { DealerTable } from "../../molecules/dealer/DealerTable";

export const DealerList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [current, setCurrent] = useState(1); // antd 1-based
  const [pageSize, setPageSize] = useState(10);

  // ===== ROLE =====
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const canView = role === "ADMIN" || role === "EVM_STAFF"; // ✅ ADMIN & EVM_STAFF được xem
  const canModify = role === "ADMIN"; // ✅ chỉ ADMIN được CRUD

  const params = { page: current - 1, size: pageSize }; // server 0-based

  // ===== API (áp dụng useApi) =====
  const { data, refetch, isLoading, isError, error } = useDealers(
    { queryKey: ["dealers", params], enabled: canView }, // ✅ chỉ fetch khi có quyền xem
    params
  );

  const dealers: IDealer[] = useMemo(() => data?.result?.data ?? [], [data]);
  const meta = data?.result?.metadata ?? {};
  const total: number = meta?.totalElements ?? dealers.length;

  // Tìm kiếm cục bộ trong page hiện tại
  const filtered = useMemo(() => {
    const kw = debouncedSearch.toLowerCase().trim();
    if (!kw) return dealers;
    return dealers.filter((d) => (d.name || "").toLowerCase().includes(kw));
  }, [dealers, debouncedSearch]);

  useEffect(() => setCurrent(1), [debouncedSearch]);

  // ===== MUTATIONS (sẽ không lộ UI nếu !canModify) =====
  const createDealer = useCreateDealer();
  const updateDealer = useUpdateDealer();
  const deleteDealer = useDeleteDealer();

  // 🚫 Manager / Dealer_Staff: chặn truy cập hẳn
  if (!canView) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" href="/dashboard">
            Về trang tổng quan
          </Button>
        }
      />
    );
  }

  const handleSave = async (values: IDealer) => {
    if (!canModify) return; // ✅ phòng thủ
    if (editDealer) {
      await updateDealer.mutateAsync({ id: editDealer.id!, data: values });
    } else {
      await createDealer.mutateAsync(values);
    }
    setModalOpen(false);
    setEditDealer(undefined);
    refetch();
  };

  const handleDelete = async () => {
    if (!canModify || !deleteId) return; // ✅ phòng thủ
    await deleteDealer.mutateAsync(deleteId);
    setDeleteId(null);
    refetch();
  };

  // ===== LOADING / ERROR =====
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <Spin size="large" tip="Đang tải danh sách đại lý...">
          <div style={{ minHeight: 160, minWidth: 160 }} />
        </Spin>
      </div>
    );
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Không thể tải danh sách đại lý"
        subTitle={
          (error as { message?: string })?.message || "Vui lòng thử lại."
        }
        extra={
          <Button type="primary" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Search & Add (ẩn nút thêm nếu không có quyền) */}
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

      {/* Table + Pagination */}
      <div className="overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-100">
        {filtered.length > 0 ? (
          <DealerTable
            data={filtered}
            // ✅ Không cho edit nếu không có quyền (không gọi mở modal)
            onEdit={(d) => {
              if (!canModify) return;
              setEditDealer(d);
              setModalOpen(true);
            }}
            // ✅ Không cho delete nếu không có quyền
            onDelete={(id) => {
              if (!canModify) return;
              setDeleteId(id);
            }}
            canModify={canModify} // ✅ EVM_STAFF = false -> ẩn cột thao tác
            pagination={{
              current,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (page, size) => {
                setCurrent(page);
                setPageSize(size || pageSize);
              },
              showTotal: (t) => `Tổng ${t} đại lý`,
            }}
          />
        ) : (
          <Empty
            description="Không tìm thấy đại lý nào"
            className="py-10 text-gray-500"
          />
        )}
      </div>

      {/* Modal + Delete: chỉ render khi ADMIN */}
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
