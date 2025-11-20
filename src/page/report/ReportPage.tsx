import { useMemo, useState } from "react";
import { Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import { ReportTable } from "../../components/molecules/report/ReportTable";
import { ReportFormModal } from "../../components/molecules/report/ReportFormModal";
import { ProcessReportModal } from "../../components/molecules/report/ProcessReportModal";
import { ReportDeleteConfirm } from "../../components/molecules/report/ReportDeleteConfirm";

import {
  useReportList,
  useReportCreate,
  useReportUpdate,
  useReportDelete,
  useReportProcess,
} from "../../service/reportService";

import { useDebounce } from "../../hook/useDebounce";
import useGetParams from "../../hook/useGetParams";
import { CardWrapper } from "../../components/template/CardWrapper";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import type { RootState } from "../../redux/store";
import type { IReport } from "../../model/Report";

interface ReportFormValues {
  title: string;
  description: string;
  type: IReport["type"];
  status?: IReport["status"];
  customerId: string;
  vinNumber?: string;
}

const STATUS_OPTIONS = [
  { label: "Đang chờ", value: "PENDING" },
  { label: "Đang xử lý", value: "IN_PROGRESS" },
  { label: "Đã giải quyết", value: "RESOLVED" },
  { label: "Đã xóa", value: "DELETED" },
];

export const ReportPage = () => {
  const getParam = useGetParams();
  const navigate = useNavigate();
  const role = useSelector((s: RootState) => s.user?.role) ?? "MANAGER";

  /** ========== SEARCH + FILTER ========== */
  const [keyword, setKeyword] = useState(getParam("keyword") ?? "");
  const [status, setStatus] = useState<IReport["status"] | undefined>(
    (getParam("status") as IReport["status"]) || undefined
  );
  const debouncedKeyword = useDebounce(keyword, 400);

  /** ========== PAGINATION ========== */
  const [page, setPage] = useState(Number(getParam("page")) || 0);
  const [size, setSize] = useState(Number(getParam("size")) || 10);

  /** ========== SORT ========== */
  const [sortField, setSortField] = useState<keyof IReport>(
    (getParam("sortField") as keyof IReport) || "createdAt"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    (getParam("sortDir") as "asc" | "desc") || "desc"
  );

  /** ========== API LIST ========== */
  const { data, isLoading, refetch } = useReportList(
    page,
    size,
    debouncedKeyword,
    status,
    sortField,
    sortDir
  );

  const reports = useMemo(() => data?.result?.data ?? [], [data]);
  const totalElements = useMemo(
    () => data?.result?.metadata?.totalElements ?? 0,
    [data]
  );

  /** ========== MUTATIONS ========== */
  const createReport = useReportCreate();
  const updateReport = useReportUpdate();
  const deleteReport = useReportDelete();
  const processReport = useReportProcess();

  /** ========== MODAL STATES ========== */
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IReport | null>(null);

  const [openProcess, setOpenProcess] = useState(false);
  const [processing, setProcessing] = useState<IReport | null>(null);

  const [deleting, setDeleting] = useState<IReport | null>(null);

  /** CREATE / UPDATE */
  const handleSubmit = async (values: ReportFormValues) => {
    try {
      if (editing) {
        await updateReport.mutateAsync({
          id: editing.reportId,
          data: {
            ...values,
            status: editing.status, // giữ nguyên trạng thái hiện tại
          },
        });
        toast.success("Cập nhật báo cáo thành công!");
      } else {
        await createReport.mutateAsync(values);
        toast.success("Tạo báo cáo mới thành công!");
      }

      setOpenForm(false);
      setEditing(null);
      refetch();
    } catch {
      toast.error("Thao tác thất bại, vui lòng thử lại!");
    }
  };

  /** DELETE */
  const handleDelete = async (id: string) => {
    try {
      await deleteReport.mutateAsync(id);
      toast.success("Xóa báo cáo thành công!");
      setDeleting(null);
      refetch();
    } catch {
      toast.error("Không thể xóa báo cáo!");
    }
  };

  /** PROCESS */
  const handleProcess = async (next: IReport["status"], solution?: string) => {
    if (!processing) return;

    try {
      await processReport.mutateAsync({
        id: `process-report/${processing.reportId}?status=${next}`,
        data: next === "RESOLVED" ? { solution } : {},
      });
      toast.success("Cập nhật trạng thái báo cáo thành công!");

      setOpenProcess(false);
      setProcessing(null);
      refetch();
    } catch {
      toast.error("Không thể xử lý báo cáo!");
    }
  };

  /** RESET FILTERS */
  const resetFilters = () => {
    setKeyword("");
    setStatus(undefined);
    setSortField("createdAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
  };

  /** RENDER FILTER UI */
  const filterContent = (
    <div className="flex flex-col gap-4">
      {/* STATUS */}
      <div>
        <b className="text-gray-700">Trạng thái</b>
        <Select
          allowClear
          className="w-full mt-2"
          placeholder="Trạng thái"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(val) => {
            setStatus(val);
            setPage(0);
          }}
        />
      </div>

      {/* SORT FIELD */}
      <div>
        <b className="text-gray-700">Sắp xếp theo</b>
        <Select
          className="w-full mt-2"
          value={sortField}
          onChange={(v) => {
            setSortField(v);
            setPage(0);
          }}
        >
          <Select.Option value="createdAt">Ngày tạo</Select.Option>
          <Select.Option value="title">Tên báo cáo</Select.Option>
        </Select>
      </div>

      {/* SORT DIRECTION */}
      <div>
        <b className="text-gray-700">Thứ tự</b>
        <Select
          className="w-full mt-2"
          value={sortDir}
          onChange={(v) => {
            setSortDir(v);
            setPage(0);
          }}
        >
          <Select.Option value="asc">Tăng dần</Select.Option>
          <Select.Option value="desc">Giảm dần</Select.Option>
        </Select>
      </div>
    </div>
  );

  return (
    <CardWrapper>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quản lý Báo cáo
        </h2>
      </div>

      {/* FILTER BAR */}
      <div className="flex justify-between items-center">
        <EMOBFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          onReset={resetFilters}
          filterDropdown={filterContent}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!bg-[#627254] hover:!bg-[#4f6f52]"
          onClick={() => setOpenForm(true)}
        >
          Thêm báo cáo
        </Button>
      </div>

      {/* TABLE */}
      <ReportTable
        data={reports}
        loading={isLoading}
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={(field, dir) => {
          setSortField(field);
          setSortDir(dir);
          setPage(0);
        }}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: totalElements,
          showSizeChanger: true,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s ?? 10);
          },
          position: ["bottomCenter"],
          showTotal: (t) => `Tổng cộng ${t} báo cáo`,
        }}
        onEdit={(r) => {
          setEditing(r);
          setOpenForm(true);
        }}
        onDelete={(r) => setDeleting(r)}
        onProcess={(r) => {
          setProcessing(r);
          setOpenProcess(true);
        }}
        onViewDetail={(id) => navigate(`/${role.toLowerCase()}/report/${id}`)}
      />

      {/* CREATE / EDIT */}
      <ReportFormModal
        open={openForm}
        initialValues={editing}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* PROCESS */}
      <ProcessReportModal
        open={openProcess}
        onCancel={() => {
          setOpenProcess(false);
          setProcessing(null);
        }}
        onSubmit={handleProcess}
      />

      {/* DELETE */}
      <ReportDeleteConfirm
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting!.reportId)}
      />
    </CardWrapper>
  );
};
