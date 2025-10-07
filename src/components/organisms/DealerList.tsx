import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { message } from "antd";
import { dealerService } from "../../service/dealerService";
import type { IDealer } from "../../model/Dealer";
import { DealerTable } from "../molecules/DealerTable";
import { SearchBar } from "../molecules/SearchBar";
import { DealerModal } from "./DealerModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import { useDebounce } from "../../hook/useDebounce";

export const DealerList = () => {
  const [dealers, setDealers] = useState<IDealer[]>([]);
  const [filtered, setFiltered] = useState<IDealer[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<IDealer | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /**
   * Tải danh sách đại lý từ server và cập nhật cả danh sách gốc lẫn danh sách đã lọc
   */
  const loadData = async () => {
    const data = await dealerService.getDealers();
    setDealers(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lọc danh sách theo từ khóa đã được debounce để tránh lọc quá thường xuyên
  useEffect(() => {
    const keyword = debouncedSearch.toLowerCase();
    setFiltered(dealers.filter((d) => d.name.toLowerCase().includes(keyword)));
  }, [debouncedSearch, dealers]);

  /**
   * Lưu thông tin đại lý: nếu có "editDealer" thì cập nhật, ngược lại tạo mới
   * Hiển thị thông báo theo kết quả và reload danh sách
   */
  const handleSave = async (values: IDealer) => {
    try {
      if (editDealer) {
        await dealerService.updateDealer({ ...editDealer, ...values });
        message.success("Cập nhật thông tin thành công!");
      } else {
        await dealerService.createDealer(values);
        message.success("Thêm mới thành công!");
      }
      setModalOpen(false);
      setEditDealer(undefined);
      loadData();
    } catch {
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  /**
   * Xóa đại lý theo id đã chọn và hiển thị thông báo kết quả
   */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dealerService.deleteDealer(deleteId);
      message.success("Xóa thành công!");
      setDeleteId(null);
      loadData();
    } catch {
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

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
          className="w-full sm:max-w-[420px] hover:-translate-y-0.5 transition-transform duration-200"
        />

        <Button
          type="primary"
          onClick={() => setModalOpen(true)}
          className="!bg-[#627254] hover:!bg-[#525e46] active:!bg-[#414d38] text-white rounded-xl px-6 py-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Thêm đại lý mới
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-md hover:shadow-lg p-0 transition-all duration-300 ease-out hover:-translate-y-1">
        <DealerTable
          data={filtered}
          onEdit={(d) => {
            setEditDealer(d);
            setModalOpen(true);
          }}
          onDelete={setDeleteId}
        />
      </div>

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
    </motion.div>
  );
};
