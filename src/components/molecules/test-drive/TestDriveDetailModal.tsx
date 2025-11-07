
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Descriptions, Tag, Button, Space, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";

import {
  useTestDriveDetailQuery,
  useDeleteTestDriveMutation,
} from "../../../service/testDriveService";
import { DeleteConfirm } from "../../organisms/DeleteConfirm";
import { TestDriveEditModal } from "./TestDriveEditModal";
import { toast } from "react-toastify";

const { Title } = Typography;

interface Props {
  open: boolean;
  testDriveId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const TestDriveDetailModal = ({
  open,
  testDriveId,
  onClose,
  onUpdated,
}: Props) => {
  const { data, isLoading } = useTestDriveDetailQuery(testDriveId || undefined, {
    enabled: !!testDriveId && open,
  });
  const detail = data?.result;

  const { mutateAsync: deleteTestDrive } = useDeleteTestDriveMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTestDrive(testDriveId!);
      toast.success("Đã xóa lịch lái thử!");
      setConfirmOpen(false);
      onUpdated?.();
      onClose();
    } catch {
      toast.error("Không thể xóa lịch lái thử!");
    }
  };

  const status = detail?.status;
  const isCompletedOrCanceled = status === "COMPLETED" || status === "CANCELLED";
  const isConfirmed = status === "CONFIRMED";

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={800}
        destroyOnClose
        title={
          <Space align="center">
            <Title level={4} style={{ margin: 0, color: "#627254" }}>
              Chi tiết lịch lái thử
            </Title>
            <Tag
              color={
                status === "CANCELED"
                  ? "red"
                  : status === "COMPLETED"
                  ? "green"
                  : status === "CONFIRMED"
                  ? "blue"
                  : "gold"
              }
            >
              {status || "—"}
            </Tag>
          </Space>
        }
      >
        {isLoading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : detail ? (
          <Descriptions bordered column={1} size="middle" labelStyle={{ width: 200 }}>
            <Descriptions.Item label="Mã lịch lái thử">
              {detail.testDriveId}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng ID">
              {detail.customerId}
            </Descriptions.Item>
            <Descriptions.Item label="Xe lái thử ID">
              {detail.testDriveVehicleUnitId}
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên phụ trách ID">
              {detail.salePersonId}
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              {detail.location}
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng">
              {detail.duration} phút
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian lái thử">
              {dayjs(detail.scheduledAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(detail.createAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {dayjs(detail.updateAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-center text-gray-500 italic mt-3">
            Không có dữ liệu lịch lái thử
          </p>
        )}

        <div className="flex justify-end mt-5 gap-2">
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={isCompletedOrCanceled} 
            onClick={() => setConfirmOpen(true)}
          >
            Xóa
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            disabled={isCompletedOrCanceled || isConfirmed} // ❌ Không sửa nếu COMPLETED/CANCELED/CONFIRMED
            onClick={() => setEditOpen(true)}
          >
            Chỉnh sửa
          </Button>
        </div>
      </Modal>

      <DeleteConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa lịch lái thử này không?"
        okText="Xóa"
        danger
        title="Xác nhận xóa lịch lái thử"
      />

      <TestDriveEditModal
        open={editOpen}
        testDriveId={testDriveId}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          onUpdated?.();
          onClose();
        }}
      />
    </>
  );
};