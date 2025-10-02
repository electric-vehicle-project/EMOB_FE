import { useState, useEffect } from "react";
import type { ITestDrive } from "../../model/TestDrive";
import { TestDriveTable } from "../molecules/TestDriveTable";
import { SearchBar } from "../molecules/SearchBar";
import { TestDriveModal } from "./TestDriveModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";
import { testDriveService } from "../../service/testDriveService"; // ✅ import service

export const TestDriveList = () => {
  const [testDrives, setTestDrives] = useState<ITestDrive[]>([]);
  const [filtered, setFiltered] = useState<ITestDrive[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ITestDrive | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ load data từ service
  const loadData = async () => {
    const data = await testDriveService.getTestDrives();
    setTestDrives(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Search handler
  const handleSearch = (value: string) => {
    const keyword = value.toLowerCase();
    setFiltered(
      testDrives.filter(
        (d) =>
          d.customer.toLowerCase().includes(keyword) ||
          d.car.toLowerCase().includes(keyword)
      )
    );
  };

  // ✅ Save (add/edit)
  const handleSave = async (values: ITestDrive) => {
    if (editRecord) {
      await testDriveService.updateTestDrive({ ...editRecord, ...values });
    } else {
      await testDriveService.createTestDrive(values);
    }
    setModalOpen(false);
    setEditRecord(undefined);
    loadData();
  };

  // ✅ Delete
  const handleDelete = async () => {
    if (deleteId) {
      await testDriveService.deleteTestDrive(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm + nút thêm */}
      <div className="flex justify-between items-center">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Tìm kiếm khách hàng hoặc xe..."
        />
        <Button
          type="primary"
          onClick={() => {
            setEditRecord(undefined); // reset về thêm mới
            setModalOpen(true);
          }}
          className="ml-4 px-6"
        >
          Thêm lịch lái thử
        </Button>
      </div>

      {/* Bảng */}
      <TestDriveTable
        data={filtered}
        onEdit={(record) => {
          setEditRecord(record);
          setModalOpen(true);
        }}
        onDelete={setDeleteId}
      />

      {/* Modal thêm/sửa */}
      <TestDriveModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditRecord(undefined);
        }}
        onSubmit={handleSave}
        initialValues={editRecord}
      />

      {/* Xác nhận xóa */}
      <DeleteConfirm
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
