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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isSoftLoading, setIsSoftLoading] = useState(false);
  const size = 10;

  const fetchUnits = useCallback(
    async (silent = false) => {
      if (!open || !vehicleId) return;
      if (!silent) setIsSoftLoading(true);
      try {
        const res = await api.get(
          `/vehicle/unit/view-all-by-model/${vehicleId}`,
          { params: { page, size } }
        );
        const result = res?.data?.result;
        setUnits(result?.data ?? []);
        setTotal(result?.metadata?.totalElements ?? 0);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách Vehicle Units:", err);
        setUnits([]);
      } finally {
        setTimeout(() => setIsSoftLoading(false), 250);
      }
    },
    [open, vehicleId, page, size]
  );

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);
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
      destroyOnHidden
      maskClosable
    >
      {units.length === 0 && !isSoftLoading ? (
        <Empty
          description="Không có lô xe nào thuộc xe này."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <div
            className={`transition-all duration-300 ${
              isSoftLoading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            <Table
              dataSource={units}
              columns={columns}
              rowKey={(r) => r.vehicleUnitId}
              pagination={false}
              bordered
              size="middle"
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-600">
              Tổng cộng: {units.length} / {total} xe
            </span>
            <Pagination
              current={page + 1}
              total={total}
              pageSize={size}
              onChange={(p) => {
                setPage(p - 1);
                fetchUnits(true);
              }}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      {isSoftLoading && units.length === 0 && (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      )}
    </Modal>
  );
};
