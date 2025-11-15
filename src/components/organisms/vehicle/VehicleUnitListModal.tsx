// src/components/organisms/vehicle/VehicleUnitListModal.tsx
import { Modal, Table, Tag, Pagination, Typography, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import dayjs from "dayjs";
import {
  useGetVehicleUnitsByVehicleIdPaged,
  useDeleteVehicleUnitsBulk,
} from "../../../service/vehicleService";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { Button } from "../../atoms/Button";
import { toast } from "react-toastify";
import { DeleteConfirm } from "../DeleteConfirm";
import { DeleteOutlined, AppstoreOutlined } from "@ant-design/icons";

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

const STATUS_LABEL_VI: Record<VehicleUnitRow["status"], string> = {
  NORMAL: "Xe mới (bình thường)",
  SPECIAL: "Trưng bày / đặc biệt",
  OLD_STOCK: "Tồn kho cũ",
  TEST_DRIVE: "Lái thử",
  RESERVED: "Giữ chỗ",
  SOLD: "Đã bán",
};

const STATUS_COLORS: Record<VehicleUnitRow["status"], string> = {
  NORMAL: "green",
  SPECIAL: "purple",
  OLD_STOCK: "orange",
  TEST_DRIVE: "blue",
  RESERVED: "gold",
  SOLD: "red",
};

export default function VehicleUnitListModal({
  open,
  onClose,
  vehicleId,
}: Props) {
  const [page, setPage] = useState(0);
  const size = 10;

  const role = (useCurrentUser() as { role?: string } | null)?.role ?? "";
  const isEvmStaff = role === "EVM_STAFF";

  useEffect(() => {
    if (open) setPage(0);
  }, [open, vehicleId]);

  const query = useGetVehicleUnitsByVehicleIdPaged(
    vehicleId || "",
    { page, size },
    { enabled: open && !!vehicleId, keepPreviousData: true }
  );

  const units = useMemo(
    () => (query.data?.units ?? []) as VehicleUnitRow[],
    [query.data?.units]
  );

  const metadata = query.data?.metadata as
    | { totalElements?: number }
    | undefined;
  const { isLoading } = query;
  const total = metadata?.totalElements ?? 0;

  const { mutateAsync: deleteUnits, isPending: deleting } =
    useDeleteVehicleUnitsBulk();

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const selectedIds = useMemo(
    () => selectedKeys.map((k) => String(k)),
    [selectedKeys]
  );

  const allKeysOnPage = useMemo(
    () => (units || []).map((u) => u.vehicleUnitId),
    [units]
  );

  const allPageSelected =
    allKeysOnPage.length > 0 &&
    allKeysOnPage.every((k) => selectedIds.includes(k));

  const selectAllCurrentPage = () => setSelectedKeys(allKeysOnPage);
  const clearSelection = () => setSelectedKeys([]);

  useEffect(() => {
    if (open) {
      setSelectedKeys([]);
    }
  }, [page, open]);

  const askDeleteBulk = async () => {
    if (!selectedIds.length) return;
    try {
      const willRemoveAllOnPage = selectedIds.length >= (units?.length ?? 0);
      if (willRemoveAllOnPage && page > 0) setPage((p) => p - 1);

      await deleteUnits(selectedIds);
      setSelectedKeys([]);
      toast.success(`Đã xoá ${selectedIds.length} đơn vị xe.`);
    } catch {
      toast.error("Không thể xoá các đơn vị xe đã chọn.");
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);

  const columns: ColumnsType<VehicleUnitRow> = [
    {
      title: "Số khung (VIN)",
      dataIndex: "vinNumber",
      render: (v: string) => <Text copyable>{v}</Text>,
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s: VehicleUnitRow["status"]) => (
        <Tag color={STATUS_COLORS[s]}>{STATUS_LABEL_VI[s]}</Tag>
      ),
    },
    {
      title: "Năm SX",
      dataIndex: "productionYear",
      render: (v?: string) => (v ? dayjs(v).format("YYYY") : "—"),
    },
    {
      title: "Giá bán lẻ",
      dataIndex: "price",
      align: "right",
      render: (p?: number) =>
        typeof p === "number" ? `${p.toLocaleString("vi-VN")}₫` : "—",
    },
  ];

  const rowSelection = isEvmStaff
    ? {
        selectedRowKeys: selectedKeys,
        onChange: (keys: Key[]) => setSelectedKeys(keys),
        getCheckboxProps: () => ({ disabled: deleting }),
        columnTitle: <span />,
        selections: false as const,
      }
    : undefined;

  const currentCount = units.length;
  const totalLabel = `${currentCount.toLocaleString(
    "vi-VN"
  )} / ${total.toLocaleString("vi-VN")} đơn vị xe`;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isEvmStaff ? 1000 : 950}
      destroyOnClose
      title={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-[#627254]" />
            <span className="font-semibold text-[15px]">
              Danh sách đơn vị xe
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Quản lý các đơn vị xe thuộc mẫu xe hiện tại.
          </span>
        </div>
      }
    >
      {isEvmStaff && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-700 border text-xs font-medium">
              Đã chọn:{" "}
              <span className="ml-1 font-semibold">
                {selectedIds.length.toLocaleString("vi-VN")}
              </span>
            </span>

            {!allPageSelected ? (
              <Button
                type="link"
                className="!px-0 !text-[#627254]"
                onClick={selectAllCurrentPage}
                disabled={units.length === 0}
              >
                Chọn tất cả trên trang này
              </Button>
            ) : (
              <Button
                type="link"
                className="!px-0 !text-[#627254]"
                onClick={clearSelection}
              >
                Bỏ chọn trang này
              </Button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <Button
              type="primary"
              danger
              size="middle"
              loading={deleting}
              className="flex items-center gap-2 rounded-full !px-4 !h-9 shadow-sm"
              onClick={() => setConfirmOpen(true)}
            >
              <DeleteOutlined />
              <span className="font-medium">Xoá các mục đã chọn</span>
            </Button>
          )}
        </div>
      )}

      {isLoading && units.length === 0 ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : units.length === 0 ? (
        <Empty
          description="Không có đơn vị xe nào thuộc mẫu xe này."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <Table<VehicleUnitRow>
            dataSource={units}
            columns={columns}
            rowKey={(r) => r.vehicleUnitId}
            pagination={false}
            size="middle"
            bordered
            rowSelection={rowSelection}
            className="rounded-xl overflow-hidden bg-white"
            scroll={{ x: true }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <span className="text-gray-600 text-sm">{totalLabel}</span>
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

      <DeleteConfirm
        open={confirmOpen && selectedIds.length > 0}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await askDeleteBulk();
          setConfirmOpen(false);
        }}
        title="Xoá các đơn vị xe đã chọn?"
        message={`Bạn sắp xoá ${selectedIds.length.toLocaleString(
          "vi-VN"
        )} đơn vị xe. Hành động này không thể hoàn tác.`}
        okText="Xoá"
        danger
      />
    </Modal>
  );
}
