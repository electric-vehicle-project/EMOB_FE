// src/components/organisms/vehicle/VehicleUnitListModal.tsx
import {
  Modal,
  Table,
  Tag,
  Pagination,
  Typography,
  Empty,
  Spin,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  useGetVehicleUnitsByVehicleIdPaged,
  useDeleteVehicleUnitsBulk,
} from "../../../service/vehicleService";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { Button } from "../../atoms/Button"; // ✅ dùng Button tuỳ biến
import { toast } from "react-toastify";

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
  price?: number; // hiển thị là "Giá bán lẻ"
};

const { Text } = Typography;

// ✅ label tiếng Việt cho trạng thái
const STATUS_LABEL_VI: Record<VehicleUnitRow["status"], string> = {
  NORMAL: "Xe mới (bình thường)",
  SPECIAL: "Trưng bày / đặc biệt",
  OLD_STOCK: "Tồn kho cũ",
  TEST_DRIVE: "Lái thử",
  RESERVED: "Giữ chỗ",
  SOLD: "Đã bán",
};

// màu Tag giữ như cũ
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

  // ✅ Chỉ EVM_STAFF được xoá
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const units = (query.data?.units ?? []) as VehicleUnitRow[];
  const metadata = query.data?.metadata as
    | { totalElements?: number }
    | undefined;
  const { isLoading } = query;
  const total = metadata?.totalElements ?? 0;

  // ===== Xoá hàng loạt =====
  const { mutateAsync: deleteUnits, isPending: deleting } =
    useDeleteVehicleUnitsBulk();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
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

  // ===== Cột hiển thị =====
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
      // 🔁 ĐỔI NHÃN CỘT
      title: "Giá bán lẻ",
      dataIndex: "price",
      render: (p?: number) =>
        typeof p === "number" ? `${p.toLocaleString("vi-VN")}₫` : "—",
    },
  ];

  // ===== rowSelection (ẩn checkbox ở header + UI gọn) =====
  const rowSelection = isEvmStaff
    ? {
        selectedRowKeys: selectedKeys,
        onChange: (keys: React.Key[]) => setSelectedKeys(keys),
        getCheckboxProps: () => ({ disabled: deleting }),
        columnTitle: <span />, // ẩn checkbox header
        selections: false as const,
      }
    : undefined;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isEvmStaff ? 1000 : 950}
      title="📦 Danh sách đơn vị xe"
      destroyOnClose
    >
      {/* ===== Toolbar tinh gọn, đẹp hơn ===== */}
      {isEvmStaff && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 border text-xs font-medium">
              Đã chọn: {selectedIds.length}
            </span>

            {!allPageSelected ? (
              <Button
                type="link"
                className="!px-0 !text-[#627254]"
                onClick={selectAllCurrentPage}
                disabled={units.length === 0}
              >
                Chọn tất cả trang này
              </Button>
            ) : (
              <Button
                type="link"
                className="!px-0 !text-[#627254]"
                onClick={clearSelection}
              >
                Bỏ chọn
              </Button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <Popconfirm
              title="Xoá các đơn vị xe đã chọn?"
              description={`Bạn sắp xoá ${selectedIds.length} đơn vị xe. Không thể hoàn tác.`}
              okText="Xoá"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: deleting }}
              onConfirm={askDeleteBulk}
            >
              <Button
                type="primary"
                danger
                size="small"
                loading={deleting}
                className="!px-3"
              >
                🗑️ Xoá đã chọn
              </Button>
            </Popconfirm>
          )}
        </div>
      )}

      {/* ===== Bảng ===== */}
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
            rowSelection={rowSelection}
            scroll={{ x: true }}
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
