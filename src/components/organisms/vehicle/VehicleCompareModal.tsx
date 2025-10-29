// src/components/organisms/vehicle/VehicleCompareModal.tsx
import { Modal, Select, Table, Tag, Typography, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  useCompareModels,
  useGetComparableModels,
} from "../../../service/vehicleService";
import type { VehicleComparisonField } from "../../../model/ElectricVehicle";

interface Props {
  open: boolean;
  leftId: string; // model hiện tại
  onClose: () => void;
}

export const VehicleCompareModal = ({ open, leftId, onClose }: Props) => {
  const [rightId, setRightId] = useState<string | undefined>();
  const { data: rawOptions } = useGetComparableModels(
    { baseModelId: leftId },
    { enabled: open }
  );
  const { data, refetch, isFetching } = useCompareModels(
    { leftId, rightId: rightId || "" },
    { enabled: false }
  );

  useEffect(() => {
    if (!open) setRightId(undefined);
  }, [open]);

  const columns = useMemo(
    () => [
      {
        title: "Thuộc tính",
        dataIndex: "label",
        key: "label",
        width: 220,
        render: (v: string, row: VehicleComparisonField) => {
          if (!row.different)
            return <span className="text-neutral-500">{v}</span>;
          return <span>{v}</span>;
        },
      },
      {
        title: "Model trái",
        dataIndex: "left",
        key: "left",
        render: (v: unknown, row: VehicleComparisonField) => {
          const display = String(v ?? "-");
          if (!row.different)
            return <span className="text-neutral-500">{display}</span>;
          if (row.betterFor === "left") return <Tag>{display}</Tag>;
          return <Tag color="error">{display}</Tag>;
        },
      },
      {
        title: "Model phải",
        dataIndex: "right",
        key: "right",
        render: (v: unknown, row: VehicleComparisonField) => {
          const display = String(v ?? "-");
          if (!row.different)
            return <span className="text-neutral-500">{display}</span>;
          if (row.betterFor === "right") return <Tag>{display}</Tag>;
          return <Tag color="error">{display}</Tag>;
        },
      },
    ],
    []
  );

  const options = useMemo(() => {
    if (Array.isArray(rawOptions)) {
      return (rawOptions as Array<{ id: string; name: string }>).map((m) => ({
        value: m.id,
        label: m.name,
      }));
    }
    const result = (
      rawOptions as { result?: Array<{ id: string; name: string }> }
    )?.result;
    if (Array.isArray(result)) {
      return result.map((m) => ({ value: m.id, label: m.name }));
    }
    return [] as Array<{ value: string; label: string }>;
  }, [rawOptions]);

  const tableData = useMemo(() => {
    const rows = (data as { rows?: VehicleComparisonField[] })?.rows;
    const fields = (data as { fields?: VehicleComparisonField[] })?.fields;
    return (rows ?? fields ?? []) as VehicleComparisonField[];
  }, [data]);

  const handleCompare = async () => {
    if (!rightId) return;
    await refetch();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleCompare}
      okText="Bắt đầu so sánh"
      title="So sánh mẫu xe"
      width={900}
      destroyOnClose
      confirmLoading={isFetching}
    >
      <Space direction="vertical" className="w-full">
        <div>
          <Typography.Text>
            Chọn mẫu xe để so sánh với mẫu hiện tại:
          </Typography.Text>
          <Select
            className="w-full mt-2"
            placeholder="Chọn mẫu xe"
            options={options}
            value={rightId}
            onChange={setRightId}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>

        {tableData && tableData.length > 0 && (
          <div className="mt-2">
            <Table
              rowKey={(r) => r.key}
              columns={columns as unknown as []}
              dataSource={tableData}
              pagination={false}
              size="small"
            />
            <div className="text-xs text-neutral-500 mt-2">
              Màu <span className="text-neutral-500">xám</span>: ngang nhau ·
              <span className="mx-2">Màu</span>
              <span> xanh</span>: tốt hơn ·
              <span className="mx-2 text-red-500">đỏ</span>: kém hơn
            </div>
          </div>
        )}
      </Space>
    </Modal>
  );
};
