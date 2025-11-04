import { Modal, Table, Tag, Pagination, Typography, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetVehicleUnitsByVehicleIdPaged } from "../../../service/vehicleService";

type Props = {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null;
};

type VehicleUnitRow = {
  vehicleUnitId: string;
  vinNumber: string;
  color: string;
  status:
    | "NORMAL"
    | "SPECIAL"
    | "OLD_STOCK"
    | "TEST_DRIVE"
    | "RESERVED"
    | "SOLD";
  productionYear?: string;
  price?: number;
};

const { Text } = Typography;

export default function VehicleUnitListModal({
  open,
  onClose,
  vehicleId,
}: Props) {
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    if (open) setPage(0);
  }, [open, vehicleId]);

  const query = useGetVehicleUnitsByVehicleIdPaged(
    vehicleId || "",
    { page, size },
    { enabled: open && !!vehicleId, keepPreviousData: true }
  );

  const units = (query.data?.units ?? []) as VehicleUnitRow[];
  const metadata = query.data?.metadata as
    | { totalElements?: number }
    | undefined;
  const { isLoading } = query;
  const total = metadata?.totalElements ?? 0;

  const statusColor: Record<VehicleUnitRow["status"], string> = useMemo(
    () => ({
      NORMAL: "green",
      SPECIAL: "purple",
      OLD_STOCK: "orange",
      TEST_DRIVE: "blue",
      RESERVED: "gold",
      SOLD: "red",
    }),
    []
  );

  // 👇 Bảng đã bỏ Ngày mua / BH bắt đầu / BH kết thúc; Admin không có cột thao tác
  const columns: ColumnsType<VehicleUnitRow> = [
    {
      title: "Số khung (VIN)",
      dataIndex: "vinNumber",
      render: (v: string) => <Text copyable>{v}</Text>,
    },
    { title: "Màu sắc", dataIndex: "color" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: VehicleUnitRow["status"]) => (
        <Tag color={statusColor[status]}>{status}</Tag>
      ),
    },
    {
      title: "Năm SX",
      dataIndex: "productionYear",
      render: (v?: string) => (v ? dayjs(v).format("YYYY") : "—"),
    },
    {
      title: "Giá nhập",
      dataIndex: "price",
      render: (p?: number) =>
        typeof p === "number" ? `${p.toLocaleString("vi-VN")}₫` : "—",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
      title="Danh sách đơn vị xe"
      destroyOnClose
    >
      {isLoading && (units?.length ?? 0) === 0 ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (units?.length ?? 0) === 0 ? (
        <Empty
          description="Không có lô xe nào thuộc xe này."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <Table
            dataSource={(units || []) as VehicleUnitRow[]}
            columns={columns}
            rowKey={(r) => r.vehicleUnitId}
            pagination={false}
            size="middle"
            bordered
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-600">
              Tổng cộng: {(units || []).length} / {total} xe
            </span>
            <Pagination
              current={page + 1}
              total={total}
              pageSize={size}
              onChange={(p) => setPage(p - 1)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
