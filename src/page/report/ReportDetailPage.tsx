import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tag, Descriptions, Button, Typography, Skeleton, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useReportById } from "../../service/reportService";
import { CardWrapper } from "../../components/template/CardWrapper";

const { Title, Paragraph, Text } = Typography;

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

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useReportById(id ?? "", {
    enabled: !!id,
  });
  const report = data?.result;

  const createdAt = useMemo(() => {
    if (!report?.createdAt) return "--";
    return new Date(report.createdAt).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [report?.createdAt]);

  if (isLoading) {
    return (
      <CardWrapper>
        <Skeleton active />
      </CardWrapper>
    );
  }

  if (isError || !report) {
    message.error("Không tải được chi tiết báo cáo");
    return (
      <CardWrapper>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!bg-[#627254] hover:!bg-[#4f6f52] text-white"
        >
          Quay lại
        </Button>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Title
          level={4}
          style={{ color: "#627254", fontWeight: 600, fontSize: "1.25rem" }}
          className="!mb-0"
        >
          Chi tiết Báo cáo
        </Title>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!bg-[#627254] hover:!bg-[#4f6f52] text-white"
        >
          Quay lại
        </Button>
      </div>

      {/* Content */}
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

        <Descriptions.Item label="Ngày tạo">{createdAt}</Descriptions.Item>

        <Descriptions.Item label="Số VIN / VehicleUnitId" span={2}>
          {report.vehicleUnitId || "--"}
        </Descriptions.Item>

        <Descriptions.Item label="Nội dung chi tiết" span={2}>
          <Paragraph className="!mb-0">{report.description || "--"}</Paragraph>
        </Descriptions.Item>

        {report.solution ? (
          <Descriptions.Item label="Giải pháp" span={2}>
            <Paragraph className="!mb-0">{report.solution}</Paragraph>
          </Descriptions.Item>
        ) : null}
      </Descriptions>
    </CardWrapper>
  );
}
