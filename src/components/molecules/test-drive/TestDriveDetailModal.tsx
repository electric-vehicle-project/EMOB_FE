/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
} from "antd";
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
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useCustomerById } from "../../../service/customerService";
import { useGetAccountById } from "../../../service/accountService";

const { Title, Text } = Typography;

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
  const { data, isLoading } = useTestDriveDetailQuery(
    testDriveId || undefined,
    { enabled: !!testDriveId && open }
  );

  const detail = data?.result;

  const { mutateAsync: deleteTestDrive } = useDeleteTestDriveMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  const customer = useCustomerById(detail?.customerId).data?.result;
  const dealerStaff = useGetAccountById(detail?.salePersonId).data?.result.fullName;

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
  const isCompletedOrCanceled =
    status === "COMPLETED" || status === "CANCELLED";
  const isConfirmed = status === "CONFIRMED";

  // ==== UI Helper row ====
  const RowItem = ({
    label,
    value,
  }: {
    label: string;
    value: any;
  }) => (
    <div className="flex flex-col py-2">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-[15px] font-medium text-gray-800 mt-1">
        {value || "—"}
      </Text>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={800}
        className="rounded-xl"
        destroyOnClose
        title={
          <Space align="center">
            <Title level={4} style={{ margin: 0, color: "#627254" }}>
              Chi tiết lịch lái thử
            </Title>
            <Tag
              color={
                status === "CANCELLED"
                  ? "red"
                  : status === "COMPLETED"
                    ? "green"
                    : status === "CONFIRMED"
                      ? "blue"
                      : "gold"
              }
              className="font-semibold"
            >
              {status}
            </Tag>
          </Space>
        }
      >
        {isLoading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : !detail ? (
          <p className="text-center text-gray-500 italic mt-3">
            Không có dữ liệu lịch lái thử
          </p>
        ) : (
          <div className="mt-2">
            {/* SECTION 1 */}
            <div className="grid grid-cols-2 gap-x-10">
              <RowItem label="Mã lịch lái thử" value={detail.testDriveId} />
              <RowItem label="Khách hàng" value={customer?.fullName} />

              <RowItem
                label="Xe lái thử ID"
                value={detail.testDriveVehicleUnitId}
              />
              <RowItem label="Địa điểm" value={detail.location} />

              {role === "MANAGER" && (
                <RowItem label="Nhân viên phụ trách" value={dealerStaff} />
              )}

              <RowItem label="Thời lượng" value={`${detail.duration} phút`} />
              <RowItem
                label="Thời gian lái thử"
                value={dayjs(detail.scheduledAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              />
            </div>

            <Divider />

            {/* SECTION 2 */}
            <div className="grid grid-cols-2 gap-x-10">
              <RowItem
                label="Ngày tạo"
                value={dayjs(detail.createAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              />
              <RowItem
                label="Cập nhật lần cuối"
                value={dayjs(detail.updateAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              />
            </div>
          </div>
        )}

        {role === "DEALER_STAFF" && (
          <div className="flex justify-end mt-6 gap-2">
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
              disabled={isCompletedOrCanceled || isConfirmed}
              onClick={() => setEditOpen(true)}
            >
              Chỉnh sửa
            </Button>
          </div>
        )}
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
