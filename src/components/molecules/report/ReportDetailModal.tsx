import { Modal, Descriptions, Tag, Typography, Skeleton } from "antd";
import { useReportById } from "../../../service/reportService";

const { Paragraph, Text } = Typography;

const typeTag = (t?: string) =>
  t === "COMPLAINT" ? (
    <Tag color="red">Khiếu nại</Tag>
  ) : (
    <Tag color="green">Phản hồi</Tag>
  );

const statusTag = (s?: string) => {
  switch (s) {
    case "PENDING":
      return <Tag color="orange">Đang chờ</Tag>;
    case "IN_PROGRESS":
      return <Tag color="blue">Đang xử lý</Tag>;
    case "RESOLVED":
      return <Tag color="green">Đã giải quyết</Tag>;
    case "DELETED":
      return <Tag color="red">Đã xóa</Tag>;
    default:
      return <Tag>{s || "--"}</Tag>;
  }
};

interface Props {
  open: boolean;
  reportId?: string;
  onClose: () => void;
}

export const ReportDetailModal = ({ open, reportId, onClose }: Props) => {
  const { data, isLoading } = useReportById(reportId ?? "", {
    enabled: open && !!reportId,
  });

  const report = data?.result;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      footer={null}
      destroyOnClose
      title={
        <span className="text-[#627254] text-lg font-semibold">
          Chi tiết Báo cáo
        </span>
      }
    >
      {isLoading || !report ? (
        <Skeleton active />
      ) : (
        <Descriptions
          bordered
          column={2}
          labelStyle={{ width: 180, fontWeight: 500 }}
          className="rounded-lg bg-white"
        >
          <Descriptions.Item label="Tên báo cáo" span={2}>
            <Text strong>{report.title}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Loại báo cáo">
            {typeTag(report.type)}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            {statusTag(report.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Người tạo">
            {report.fullName || "--"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {new Date(report.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Số VIN / VehicleUnitId" span={2}>
            {report.vehicleUnitId || "--"}
          </Descriptions.Item>

          <Descriptions.Item label="Nội dung chi tiết" span={2}>
            <Paragraph>{report.description || "--"}</Paragraph>
          </Descriptions.Item>

          {report.solution && (
            <Descriptions.Item label="Giải pháp" span={2}>
              <Paragraph>{report.solution}</Paragraph>
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Modal>
  );
};
