import { useState, useEffect } from "react";
import type { ITestDrive } from "../../model/TestDrive";
import { TestDriveTable } from "../molecules/TestDriveTable";
import { SearchBar } from "../molecules/SearchBar";
import { TestDriveModal } from "./TestDriveModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { Button } from "../atoms/Button";

export const TestDriveList = () => {
  const [testDrives, setTestDrives] = useState<ITestDrive[]>([]);
  const [filtered, setFiltered] = useState<ITestDrive[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ITestDrive | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ fake load data ban đầu
  useEffect(() => {
    const initData: ITestDrive[] = [
      {
        id: 1,
        customer: "Nguyễn Văn A",
        car: "VinFast VF8",
        date: "2025-10-05",
        duration: 30,
        status: "Pending",
      },
      {
        id: 2,
        customer: "Trần Thị B",
        car: "Toyota Vios",
        date: "2025-10-06",
        duration: 25,
        status: "Completed",
      },
      {
        id: 3,
        customer: "Lê Văn C",
        car: "Honda City",
        date: "2025-10-07",
        duration: 15,
        status: "Cancelled",
      },
    ];
    setTestDrives(initData);
    setFiltered(initData);
  }, []);

  // ✅ Search handler
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
  const handleSave = (values: ITestDrive) => {
    if (editRecord) {
      // sửa
      setTestDrives((prev) =>
        prev.map((d) => (d.id === editRecord.id ? { ...d, ...values } : d))
      );
    } else {
      // thêm mới
      setTestDrives((prev) => [
        ...prev,
        { ...values, id: prev.length + 1 }, // fake id
      ]);
    }

    setFiltered((prev) =>
      editRecord
        ? prev.map((d) => (d.id === editRecord.id ? { ...d, ...values } : d))
        : [...prev, { ...values, id: prev.length + 1 }]
    );

    setModalOpen(false);
    setEditRecord(undefined);
  };

  // ✅ Delete
  const handleDelete = () => {
    if (deleteId) {
      setTestDrives((prev) => prev.filter((d) => d.id !== deleteId));
      setFiltered((prev) => prev.filter((d) => d.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm + nút thêm */}
      <div className="flex justify-between items-center">
        <SearchBar onSearch={handleSearch} />
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
