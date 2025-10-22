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
import {
  useDealerList,
  useDealerCreate,
  useDealerUpdate,
  useDealerDelete,
} from "../../service/dealerService";

export const DealerList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ Gọi API thật (GET /dealer)
  const { data, refetch, isLoading, isError, error } = useDealerList(
    {},
    { page: 0, size: 100 }
  );

  // ✅ Chuẩn hóa dữ liệu từ API về model IDealer
  const dealers: IDealer[] = useMemo(() => {
    if (!data?.result?.data) return [];
    return data.result.data.map((d: unknown) => {
      const dealer = d as {
        id: string;
        name: string;
        contactInfo?: string;
        address?: string;
        country?: string;
      };
      return {
        id: dealer.id,
        name: dealer.name,
        email: dealer.contactInfo || "",
        phone: "", // BE chưa có trường phone
        address: dealer.address || dealer.country || "",
        status: "Active",
      };
    });
  }, [data]);

  // ✅ Mutation hooks
  const createDealer = useDealerCreate();
  const updateDealer = useDealerUpdate();
  const deleteDealer = useDealerDelete();

  // ✅ Lọc danh sách theo từ khóa
  const filtered = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();
    return dealers.filter((d) => d.name.toLowerCase().includes(keyword));
  }, [dealers, debouncedSearch]);

  // ✅ Lưu (tạo / cập nhật)
  const handleSave = async (values: IDealer) => {
    try {
      if (editDealer) {
        await updateDealer.mutateAsync({
          id: editDealer.id,
          data: {
            name: values.name,
            contactInfo: values.email,
            country: values.address,
            address: values.address,
          },
        });
        message.success("Cập nhật đại lý thành công!");
      } else {
        await createDealer.mutateAsync({
          name: values.name,
          contactInfo: values.email,
          country: values.address,
          address: values.address,
        });
        message.success("Tạo mới đại lý thành công!");
      }
      setModalOpen(false);
      setEditDealer(undefined);
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  // ✅ Xóa
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDealer.mutateAsync(String(deleteId));
      message.success("Xóa thành công!");
      setDeleteId(null);
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa đại lý, vui lòng thử lại!");
    }
  };

  // ✅ Hiển thị trạng thái tải
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách đại lý..." />
      </div>
    );
  }

  // ✅ Xử lý lỗi API (nếu có)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm đại lý..."
          className="w-full sm:max-w-[420px]"
        />

        <Button
          type="primary"
          onClick={() => setModalOpen(true)}
          className="!bg-[#627254] hover:!bg-[#525e46] text-white rounded-xl px-6 py-2"
        >
          Thêm đại lý mới
        </Button>
      </div>

      {/* ✅ Bảng dữ liệu */}
      <div className="overflow-x-auto rounded-2xl shadow-md hover:shadow-lg p-0 transition-all duration-300 ease-out hover:-translate-y-1">
        {filtered.length > 0 ? (
          <DealerTable
            data={filtered}
            onEdit={(d) => {
              setEditDealer(d);
              setModalOpen(true);
            }}
            onDelete={(id) => setDeleteId(id)}
          />
        ) : (
          <Empty
            description="Không tìm thấy đại lý nào"
            className="py-10 text-gray-500"
          />
        )}
      </div>

      {/* ✅ Modal thêm/sửa */}
      <DealerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditDealer(undefined);
        }}
        onSubmit={handleSave}
        initialValues={editDealer}
      />

      {/* ✅ Modal xác nhận xóa */}
      <DeleteConfirm
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="Bạn có chắc chắn muốn xóa đại lý này?"
      />
    </motion.div>
  );
};
