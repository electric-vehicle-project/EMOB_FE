import { useMemo, useState } from "react";
import { Button, Input, Select, Space, message } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
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
import type { IReport } from "../../model/Report";
import useGetParams from "../../hook/useGetParams";
import { CardWrapper } from "../../components/template/CardWrapper";

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

  // --- Search & Filter
  const [keyword, setKeyword] = useState(getParam("keyword") ?? "");
  const [status, setStatus] = useState<IReport["status"] | undefined>(
    (getParam("status") as IReport["status"]) || undefined
  );
  const debouncedKeyword = useDebounce(keyword, 400);

  // --- Pagination
  const [page, setPage] = useState(Number(getParam("page")) || 0);
  const [size, setSize] = useState(Number(getParam("size")) || 10);

  // --- Sort (server-based)
  const [sortField, setSortField] = useState(
    getParam("sortField") || "createdAt"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    (getParam("sortDir") as "asc" | "desc") || "desc"
  );

  // --- Query: Fetch report list
  const { data, isLoading } = useReportList(
    page,
    size,
    debouncedKeyword,
    status,
    sortField,
    sortDir
  );

  // --- Mutations
  const createReport = useReportCreate();
  const updateReport = useReportUpdate();
  const deleteReport = useReportDelete();
  const processReport = useReportProcess();

  // --- Modal state
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IReport | null>(null);
  const [openProcess, setOpenProcess] = useState(false);
  const [processing, setProcessing] = useState<IReport | null>(null);
  const [deleting, setDeleting] = useState<IReport | null>(null);

  /**
   * Handle create or update report
   */
  const handleSubmit = async (values: ReportFormValues): Promise<void> => {
    try {
      if (editing) {
        const mergedValues: ReportFormValues = {
          title: values.title ?? editing.title,
          description: values.description ?? editing.description,
          type: values.type ?? editing.type,
          status: values.status ?? editing.status,
          customerId: values.customerId ?? editing.customerId,
          vinNumber: values.vinNumber ?? undefined,
        };

        await updateReport.mutateAsync({
          id: editing.reportId,
          data: mergedValues,
        });
        message.success("Cập nhật báo cáo thành công!");
      } else {
        await createReport.mutateAsync(values);
        message.success("Tạo báo cáo mới thành công!");
      }

      setOpenForm(false);
      setEditing(null);
    } catch {
      message.error("Thao tác thất bại, vui lòng thử lại!");
    }
  };

  /**
   * Handle delete report
   */
  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteReport.mutateAsync(id);
      message.success("Xóa báo cáo thành công!");
      setDeleting(null);
    } catch {
      message.error("Không thể xóa báo cáo này!");
    }
  };

  /**
   * Handle process report (change status)
   */
  const handleProcess = async (
    nextStatus: IReport["status"],
    solution?: string
  ): Promise<void> => {
    if (!processing) return;
    try {
      await processReport.mutateAsync({
        id: `process-report/${processing.reportId}?status=${nextStatus}`,
        data: nextStatus === "RESOLVED" ? { solution } : {},
      });
      message.success("Cập nhật trạng thái báo cáo thành công!");
      setOpenProcess(false);
      setProcessing(null);
    } catch {
      message.error("Không thể xử lý báo cáo!");
    }
  };

  // --- Derived data
  const reports = useMemo(() => data?.result?.data ?? [], [data]);
  const totalElements = useMemo(
    () => data?.result?.metadata?.totalElements ?? 0,
    [data]
  );

  /**
   * Reset filters and sort state
   */
  const resetFilters = (): void => {
    setKeyword("");
    setStatus(undefined);
    setSortField("createdAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
  };

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quản lý Báo cáo
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!bg-[#627254] hover:!bg-[#4f6f52]"
          onClick={() => setOpenForm(true)}
        >
          Thêm báo cáo
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-4">
        <Space wrap size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo tiêu đề hoặc người tạo…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 200 }}
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPage(0);
            }}
            options={STATUS_OPTIONS}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={resetFilters}
            type="primary"
          >
            Reset
          </Button>
        </Space>
      </div>

      {/* Data Table */}
      <ReportTable
        loading={isLoading}
        data={reports}
        sortField={sortField}
        sortDir={sortDir}
        onChangeSort={(field, dir) => {
          setSortField(field || "createdAt");
          setSortDir(dir === "ascend" ? "asc" : "desc");
          setPage(0);
        }}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: totalElements,
          showSizeChanger: true,
          onChange: (p: number, s?: number) => {
            setPage(p - 1);
            setSize(s ?? 10);
          },
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
      />

      {/* Create / Edit Modal */}
      <ReportFormModal
        open={openForm}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        initialValues={editing}
        onSubmit={handleSubmit}
      />

      {/* Process Modal */}
      <ProcessReportModal
        open={openProcess}
        onCancel={() => {
          setOpenProcess(false);
          setProcessing(null);
        }}
        onSubmit={handleProcess}
      />

      {/* Delete Confirmation */}
      <ReportDeleteConfirm
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting!.reportId)}
      />
    </CardWrapper>
  );
};
