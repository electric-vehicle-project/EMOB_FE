// src/components/organisms/vehicle/VehicleUnitListModal.tsx

import {
  Modal,
  Table,
  Tag,
  Pagination,
  Typography,
  Empty,
  Spin,
  Select,
  Card,
  Space,
  Popover,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import type { Key, MouseEventHandler } from "react";
import dayjs from "dayjs";
import {
  useGetVehicleUnitsByVehicleIdPaged,
  useDeleteVehicleUnitsBulk,
} from "../../../service/vehicleService";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { Button } from "../../atoms/Button";
import { toast } from "react-toastify";
import { DeleteConfirm } from "../DeleteConfirm";
import {
  DeleteOutlined,
  AppstoreOutlined,
  SlidersOutlined,
} from "@ant-design/icons";

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
  purchaseDate?: string;
  price?: number;
};

const { Text } = Typography;

const STATUS_LABEL_VI: Record<VehicleUnitRow["status"], string> = {
  NORMAL: "Xe mới",
  SPECIAL: "Xe đặc biệt",
  OLD_STOCK: "Xe tồn kho",
  TEST_DRIVE: "Xe lái thử",
  RESERVED: "Xe đã đặt cọc",
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

const SORT_FIELD_OPTIONS = [
  { label: "Ngày nhập", value: "purchaseDate" },
  { label: "Năm SX", value: "productionYear" },
  { label: "Giá bán lẻ", value: "price" },
] as const;

type SortField = (typeof SORT_FIELD_OPTIONS)[number]["value"];

const STATUS_FILTER_OPTIONS: {
  label: string;
  value: Exclude<VehicleUnitRow["status"], "SOLD">;
}[] = [
  { value: "NORMAL", label: STATUS_LABEL_VI.NORMAL },
  { value: "SPECIAL", label: STATUS_LABEL_VI.SPECIAL },
  { value: "OLD_STOCK", label: STATUS_LABEL_VI.OLD_STOCK },
  { value: "TEST_DRIVE", label: STATUS_LABEL_VI.TEST_DRIVE },
  { value: "RESERVED", label: STATUS_LABEL_VI.RESERVED },
];

export default function VehicleUnitListModal({
  open,
  onClose,
  vehicleId,
}: Props) {
  const [page, setPage] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>("purchaseDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statuses, setStatuses] = useState<VehicleUnitRow["status"][]>([]);

  const size = 10;

  const role = (useCurrentUser() as { role?: string } | null)?.role ?? "";
  const isEvmStaff = role === "EVM_STAFF";

  useEffect(() => {
    if (open) {
      setPage(0);
      setSelectedKeys([]);
      setSortField("purchaseDate");
      setSortDir("desc");
      setStatuses([]);
    }
  }, [open, vehicleId]);

  const query = useGetVehicleUnitsByVehicleIdPaged(
    vehicleId || "",
    {
      page,
      size,
      sortField,
      sortDir,
      statuses: statuses.length ? statuses : undefined,
    },
    {
      enabled: open && !!vehicleId,
      keepPreviousData: true,
    }
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

  const columns: ColumnsType<VehicleUnitRow> = [
    {
      title: "Số khung (VIN)",
      dataIndex: "vinNumber",
      width: 240,
      render: (v: string) => (
        <Text
          copyable
          ellipsis={{ tooltip: v }}
          className="inline-block max-w-[200px]"
        >
          {v}
        </Text>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      width: 140,
      render: (c: string) => (
        <span className="text-gray-700 whitespace-nowrap">{c}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 200,
      render: (s: VehicleUnitRow["status"]) => (
        <Tag
          color={STATUS_COLORS[s]}
          className="px-2 py-0.5 rounded-full text-xs border-none"
        >
          {STATUS_LABEL_VI[s]}
        </Tag>
      ),
    },
    {
      title: "Năm SX",
      dataIndex: "productionYear",
      width: 110,
      render: (v?: string) => (
        <span className="text-gray-700">
          {v ? dayjs(v).format("YYYY") : "—"}
        </span>
      ),
    },
    {
      title: "Giá bán lẻ",
      dataIndex: "price",
      align: "right",
      width: 170,
      render: (p?: number) =>
        typeof p === "number" ? `${p.toLocaleString("vi-VN")} ₫` : "—",
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

  const handleInnerClick: MouseEventHandler<HTMLDivElement> = (e) =>
    e.stopPropagation();

  const FilterContent = () => (
    <Card
      onClick={handleInnerClick}
      className="p-4 bg-white rounded-xl shadow-md w-[260px] flex flex-col gap-4 border border-gray-100"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Sắp xếp theo
          </span>
          <Select
            className="w-full mt-2"
            value={sortField}
            onChange={(v: SortField) => {
              setSortField(v);
              setPage(0);
            }}
            size="middle"
          >
            {SORT_FIELD_OPTIONS.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Thứ tự
          </span>
          <Select
            className="w-full mt-2"
            value={sortDir}
            onChange={(v: "asc" | "desc") => {
              setSortDir(v);
              setPage(0);
            }}
            size="middle"
          >
            <Select.Option value="asc">Tăng dần</Select.Option>
            <Select.Option value="desc">Giảm dần</Select.Option>
          </Select>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Lọc trạng thái
          </span>
          <Select
            className="w-full mt-2"
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Chọn trạng thái"
            value={statuses.filter((s) => s !== "SOLD")}
            onChange={(values) => {
              const next = values as VehicleUnitRow["status"][];
              setStatuses(next);
              setPage(0);
            }}
            size="middle"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Space>
    </Card>
  );

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
      <div className="mt-1 space-y-3">
        {/* Thanh filter + thao tác */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs text-gray-500">
              Tổng:{" "}
              <span className="font-medium text-gray-700">{totalLabel}</span>
            </span>

            <Popover
              trigger="click"
              placement="bottomRight"
              content={<FilterContent />}
              overlayInnerStyle={{
                padding: 0,
                background: "transparent",
                boxShadow: "none",
              }}
            >
              <Button
                type="default"
                className="flex items-center gap-2 rounded-full !px-3 !h-9 border-gray-300 bg-white"
              >
                <SlidersOutlined />
                <span className="text-sm">Sắp xếp / Lọc</span>
              </Button>
            </Popover>
          </div>

          {isEvmStaff && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
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
        </div>

        {/* Nội dung bảng / empty / loading */}
        {isLoading && units.length === 0 ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : units.length === 0 ? (
          <div className="py-8">
            <Empty
              description="Không có đơn vị xe nào thuộc mẫu xe này."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <Table<VehicleUnitRow>
              dataSource={units}
              columns={columns}
              rowKey={(r) => r.vehicleUnitId}
              pagination={false}
              size="middle"
              bordered={false}
              rowSelection={rowSelection}
              loading={isLoading}
              className="rounded-xl border border-gray-200 overflow-hidden bg-white"
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
      </div>

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
