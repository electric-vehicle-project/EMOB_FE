import { useState, useEffect } from "react";
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
  const [search, setSearch] = useState(""); // raw input
  const debouncedSearch = useDebounce(search, 300); // ✅ debounce
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ITestDrive | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = async () => {
    const data = await testDriveService.getTestDrives();
    setTestDrives(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Filter khi debouncedSearch thay đổi
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

  const handleDelete = async () => {
    if (deleteId) {
      await testDriveService.deleteTestDrive(deleteId);
      setDeleteId(null);
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm khách hàng hoặc xe..."
          className="w-full sm:max-w-[420px]"
        />
        <Button
          type="primary"
          onClick={() => {
            setEditRecord(undefined);
            setModalOpen(true);
          }}
          className="w-full sm:w-auto sm:ml-4 px-6"
        >
          Thêm lịch lái thử
        </Button>
      </div>

      <TestDriveTable
        data={filtered}
        onEdit={(record) => {
          setEditRecord(record);
          setModalOpen(true);
        }}
        onDelete={setDeleteId}
      />

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
    </div>
  );
};
