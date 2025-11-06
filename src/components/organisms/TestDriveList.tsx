import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { message } from "antd";
import type { ITestDrive } from "../../model/TestDrive";
import { TestDriveTable } from "../molecules/TestDriveTable";
import { SearchBar } from "../molecules/SearchBar";
import { TestDriveModal } from "./TestDriveModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import { testDriveService } from "../../service/testDriveService";
import { useDebounce } from "../../hook/useDebounce";

export const TestDriveList = () => {
  const [testDrives, setTestDrives] = useState<ITestDrive[]>([]);
  const [filtered, setFiltered] = useState<ITestDrive[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ITestDrive | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /**
   * Tải danh sách lịch lái thử từ server và cập nhật cả danh sách gốc lẫn danh sách đã lọc
   */
  const loadData = async () => {
    const data = await testDriveService.getTestDrives();
    setTestDrives(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  //  Filter khi debouncedSearch thay đổi
  useEffect(() => {
    const keyword = debouncedSearch.toLowerCase();
    setFiltered(
      testDrives.filter(
        (d) =>
          d.customer.toLowerCase().includes(keyword) ||
          d.car.toLowerCase().includes(keyword)
      )
    );
  }, [debouncedSearch, testDrives]);

  /**
   * Lưu lịch lái thử: nếu có bản ghi đang sửa thì cập nhật, ngược lại tạo mới
   * Hiển thị thông báo theo kết quả và reload danh sách
   */
  const handleSave = async (values: ITestDrive) => {
    try {
      if (editRecord) {
        await testDriveService.updateTestDrive({ ...editRecord, ...values });
        message.success("Cập nhật thông tin thành công!");
      } else {
        await testDriveService.createTestDrive(values);
        message.success("Thêm mới thành công!");
      }
      setModalOpen(false);
      setEditRecord(undefined);
      loadData();
    } catch {
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  /**
   * Xóa lịch lái thử theo id đã chọn và hiển thị thông báo kết quả
   */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await testDriveService.deleteTestDrive(deleteId);
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
          placeholder="Tìm kiếm khách hàng hoặc xe..."
          className="w-full sm:max-w-[420px] hover:-translate-y-0.5 transition-transform duration-200"
        />
        <Button
          type="primary"
          onClick={() => {
            setEditRecord(undefined);
            setModalOpen(true);
          }}
          className="!bg-[#627254] hover:!bg-[#525e46] active:!bg-[#414d38] text-white rounded-xl px-6 py-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Thêm lịch lái thử
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-md hover:shadow-lg p-0 transition-all duration-300 ease-out hover:-translate-y-1">
        <TestDriveTable
          data={filtered}
          onEdit={(record) => {
            setEditRecord(record);
            setModalOpen(true);
          }}
          onDelete={setDeleteId}
        />
      </div>

      <TestDriveModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditRecord(undefined);
        }}
        onSubmit={handleSave}
        initialValues={editRecord}
      />

      <DeleteConfirm
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="Bạn có chắc chắn muốn xóa khách hàng này?"
      />
    </motion.div>
  );
};
