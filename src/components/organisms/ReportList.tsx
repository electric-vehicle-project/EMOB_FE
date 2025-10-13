import { useEffect, useState } from "react";
import type { IReport } from "../../model/report";
import { ReportTable } from "../molecules/ReportTable";
import { ReportModal } from "./ReportModal";
import { DeleteConfirm } from "./DeleteConfirm";
import { SearchBar } from "../molecules/SearchBar";
import { Button } from "../atoms/Button";
import { useDebounce } from "../../hook/useDebounce";
import { reportService } from "../../service/reportService";

export const ReportList = () => {
  const [reports, setReports] = useState<IReport[]>([]);
  const [filtered, setFiltered] = useState<IReport[]>([]);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<IReport | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    const data = await reportService.getReports();
    setReports(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const kw = debounced.toLowerCase();
    setFiltered(
      reports.filter(
        (r) =>
          r.title.toLowerCase().includes(kw) ||
          r.reportBy.name.toLowerCase().includes(kw)
      )
    );
  }, [debounced, reports]);

  const handleSave = async (values: IReport) => {
    if (editRecord) {
      await reportService.updateReport({ ...editRecord, ...values });
    } else {
      await reportService.createReport(values);
    }
    setModalOpen(false);
    setEditRecord(undefined);
    loadData();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await reportService.deleteReport(deleteId);
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
          placeholder="Tìm kiếm theo tiêu đề hoặc khách hàng..."
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
          Thêm phản hồi
        </Button>
      </div>

      <ReportTable
        data={filtered}
        onEdit={(record) => {
          setEditRecord(record);
          setModalOpen(true);
        }}
        onDelete={setDeleteId}
      />

      <ReportModal
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
        message="Bạn có chắc chắn muốn xóa phản hồi này?"
      />
    </div>
  );
};
