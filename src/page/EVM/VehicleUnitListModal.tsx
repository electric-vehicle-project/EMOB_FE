import { Modal, Table, Tag, Pagination, Typography, Empty, Spin } from "antd";
import { useState, useEffect, useCallback } from "react";
import api from "../../config/api";
import dayjs from "dayjs";

const { Text } = Typography;

interface VehicleUnit {
  vehicleUnitId: string;
  vinNumber: string;
  color: string;
  status: string;
  price: number;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  vehicleId?: string; // ✅ thêm để đón dữ liệu mới từ BE
}

export const VehicleUnitListModal = ({
  open,
  onClose,
  vehicleId,
}: {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
}) => {
  const [units, setUnits] = useState<VehicleUnit[]>([]);
  const [meta, setMeta] = useState<{ totalElements?: number }>({});
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(0);
  const size = 10;

  // ✅ Hàm fetch dữ liệu (sẵn sàng cho khi BE thêm vehicleId)
  const fetchUnits = useCallback(async () => {
    if (!open) return;
    setIsFetching(true);
    try {
      const res = await api.get("/vehicle/unit/view-all", {
        params: { page, size },
      });

      const allData: VehicleUnit[] = res?.data?.result?.data ?? [];
      const meta = res?.data?.result?.metadata ?? {};

      // ✅ Khi BE chưa có vehicleId → fallback tạm theo VIN prefix
      // ✅ Khi BE đã có vehicleId → FE tự hoạt động chính xác
      const filtered = allData.filter((u) => {
        if (u.vehicleId) return u.vehicleId === vehicleId;
        // fallback: lọc bằng prefix VIN của modelId
        return u.vinNumber?.includes(vehicleId.slice(0, 5));
      });

      setUnits(filtered);
      setMeta(meta);
    } catch (err) {
      console.error("❌ Lỗi khi gọi API Vehicle Units:", err);
      setUnits([]);
    } finally {
      setIsFetching(false);
    }
  }, [open, page, size, vehicleId]);

  // 🔁 Gọi API khi mở modal hoặc đổi trang
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // 🔁 Reset page khi đổi xe
  useEffect(() => {
    setPage(0);
  }, [vehicleId]);

  const columns = [
    {
      title: "VIN Number",
      dataIndex: "vinNumber",
      render: (v: string) => <Text copyable>{v}</Text>,
    },
    { title: "Màu sơn", dataIndex: "color" },
    {
      title: "Tình trạng",
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={
            v === "SOLD"
              ? "red"
              : v === "TEST_DRIVE"
              ? "orange"
              : v === "RESERVED"
              ? "blue"
              : "green"
          }
        >
          {v ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Giá nhập",
      dataIndex: "price",
      render: (p: number) =>
        p ? (
          `${p.toLocaleString("vi-VN")}₫`
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Ngày mua",
      dataIndex: "purchaseDate",
      render: (d: string) =>
        d ? (
          dayjs(d).format("YYYY-MM-DD")
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Bảo hành",
      render: (r: VehicleUnit) =>
        `${
          r.warrantyStart ? dayjs(r.warrantyStart).format("YY-MM-DD") : "—"
        } → ${r.warrantyEnd ? dayjs(r.warrantyEnd).format("YY-MM-DD") : "—"}`,
    },
  ];

  return (
    <Modal
      key={vehicleId}
      title="📦 Danh sách lô xe (Vehicle Units)"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      {isFetching ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : units.length === 0 ? (
        <Empty
          description="Không có lô xe nào thuộc xe này."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <Table
            dataSource={units}
            columns={columns}
            rowKey={(r) => r.vehicleUnitId ?? r.vinNumber}
            pagination={false}
            bordered
            size="middle"
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-600">
              Tổng cộng: {units.length} / {meta?.totalElements ?? 0} xe
            </span>
            <Pagination
              current={page + 1}
              total={meta?.totalElements ?? 0}
              pageSize={size}
              onChange={(p) => setPage(p - 1)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </Modal>
  );
};
