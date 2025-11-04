// EMOB-2025 - ReportPage (bỏ thanh filter ngoài)
import { useState } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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

export const ReportPage = () => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<IReport["status"] | undefined>();
  const debouncedKeyword = useDebounce(keyword, 500);
  const getParam = useGetParams();
  const [page, setPage] = useState(Number(getParam("page")) || 0);
  const [size, setSize] = useState(Number(getParam("size")) || 10);

  const { data, isLoading } = useReportList(
    page,
    size,
    debouncedKeyword,
    status
  );

  const createReport = useReportCreate();
  const updateReport = useReportUpdate();
  const deleteReport = useReportDelete();
  const processReport = useReportProcess();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IReport | null>(null);
  const [openProcess, setOpenProcess] = useState(false);
  const [processing, setProcessing] = useState<IReport | null>(null);
  const [deleting, setDeleting] = useState<IReport | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateReport.mutateAsync({
          id: editing.reportId,
          data: values,
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

  const handleDelete = async (id: string) => {
    try {
      await deleteReport.mutateAsync(id);
      message.success("Xóa báo cáo thành công!");
      setDeleting(null);
    } catch {
      message.error("Không thể xóa báo cáo này!");
    }
  };

  const handleProcess = async (status: string, solution?: string) => {
    if (!processing) return;
    try {
      await processReport.mutateAsync({
        id: `process-report/${processing.reportId}?status=${status}`,
        data: status === "RESOLVED" ? { solution } : {},
      });
      message.success("Đã cập nhật trạng thái báo cáo!");
      setOpenProcess(false);
      setProcessing(null);
    } catch {
      message.error("Không thể xử lý báo cáo!");
    }
  };

  const reports = data?.result?.data || [];
  const totalElements = data?.result?.metadata?.totalElements || 0;

  return (
    <CardWrapper>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#627254] text-xl font-semibold">
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

      {/* ❌ Bỏ ReportFilterBar */}

      <ReportTable
        loading={isLoading}
        data={reports}
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

      <ReportFormModal
        open={openForm}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        initialValues={editing}
        onSubmit={handleSubmit}
      />

      <ProcessReportModal
        open={openProcess}
        onCancel={() => {
          setOpenProcess(false);
          setProcessing(null);
        }}
        onSubmit={handleProcess}
      />

      <ReportDeleteConfirm
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting!.reportId)}
      />
    </CardWrapper>
  );
};
