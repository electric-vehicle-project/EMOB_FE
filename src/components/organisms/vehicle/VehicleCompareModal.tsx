// src/components/organisms/vehicle/VehicleCompareModal.tsx
import {
  Modal,
  Select,
  Typography,
  Space,
  Table,
  Tag,
  Empty,
  Spin,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useGetVehicles } from "../../../service/vehicleService";
import api from "../../../config/api";
import type { IVehicle } from "../../../model/Vehicle";

interface Props {
  open: boolean;
  onClose: () => void;
  leftId: string; // xe hiện tại
}

type CompareRow = {
  keyName: string;
  left?: number | string | null;
  right?: number | string | null;
  different: boolean;
  betterFor?: "left" | "right" | string | null;
};

export const VehicleCompareModal = ({ open, onClose, leftId }: Props) => {
  const [rightId, setRightId] = useState<string>();
  const [rows, setRows] = useState<CompareRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const { vehicles } = useGetVehicles({ size: 50 }, { enabled: open });
  const options = useMemo(
    () =>
      (Array.isArray(vehicles) ? (vehicles as IVehicle[]) : [])
        .filter((v) => v.id !== leftId)
        .map((v) => ({
          value: v.id,
          label: `${v.brand ?? ""} ${v.model ?? ""}`.trim() || v.id,
        })),
    [vehicles, leftId]
  );

  useEffect(() => {
    if (!open) {
      setRightId(undefined);
      setRows(null);
    }
  }, [open]);

  const handleOk = async () => {
    if (!rightId) return;
    try {
      setLoading(true);
      const res = await api.get(`/vehicle/${leftId}/vs/${rightId}`);
      const list = (res?.data?.result || []) as Array<{
        keyName: string;
        vehicleValue: number | string | null;
        different: boolean;
        betterFor?: string | null;
      }>;
      // API mẫu trả 1 phía; ta map thành bảng hai phía (đơn giản hoá)
      // Trong thực tế nếu BE trả cả left/right thì chỉ cần gán trực tiếp.
      const mapped: CompareRow[] = list.map(
        (x: {
          keyName: string;
          vehicleValue: number | string | null;
          different: boolean;
          betterFor?: string | null;
        }) => ({
          keyName: x.keyName,
          left: undefined, // BE hiện chưa cung cấp chi tiết; để trống
          right: x.vehicleValue,
          different: !!x.different,
          betterFor: x.betterFor ?? null,
        })
      );
      setRows(mapped);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      okText="Bắt đầu so sánh"
      title="So sánh mẫu xe"
      width={900}
      destroyOnClose
      onOk={handleOk}
    >
      <Space direction="vertical" className="w-full">
        <div>
          <Typography.Text>
            Chọn mẫu xe để so sánh với mẫu hiện tại:
          </Typography.Text>
          <Select
            className="w-full mt-2"
            placeholder="Chọn mẫu xe"
            value={rightId}
            onChange={setRightId}
            showSearch
            options={options}
            optionFilterProp="label"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : rows && rows.length > 0 ? (
          <Table
            pagination={false}
            rowKey={(r) => r.keyName}
            dataSource={rows}
            columns={[
              { title: "Thông số", dataIndex: "keyName" },
              {
                title: "Hiện tại (Left)",
                dataIndex: "left",
                render: (v) => v ?? "—",
              },
              {
                title: "So sánh (Right)",
                dataIndex: "right",
                render: (v) => v ?? "—",
              },
              {
                title: "Khác biệt",
                dataIndex: "different",
                render: (b: boolean) =>
                  b ? <Tag color="orange">Khác</Tag> : <Tag>Giống</Tag>,
              },
              {
                title: "Tối ưu",
                dataIndex: "betterFor",
                render: (v: string | null | undefined) =>
                  v ? (
                    <Tag color={v === "left" ? "green" : "blue"}>{v}</Tag>
                  ) : (
                    "—"
                  ),
              },
            ]}
          />
        ) : (
          <Empty description="Chưa có dữ liệu so sánh" />
        )}
      </Space>
    </Modal>
  );
};
