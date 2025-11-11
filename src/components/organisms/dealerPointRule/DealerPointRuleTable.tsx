import { Table, InputNumber, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SaveOutlined } from "@ant-design/icons";
import type { IDealerPointRule } from "../../../model/DealerPointRule";
import React from "react";

interface Props {
  data: IDealerPointRule[];
  loading?: boolean;
  editable?: boolean; // ✅ true: cho Manager chỉnh sửa, false: chỉ đọc (Dealer_Staff)
  onUpdate?: (updatedData: IDealerPointRule[]) => void;
}

const headerStyle: React.CSSProperties = {
  backgroundColor: "#394e31",
  color: "#fff",
  ["--ant-table-header-sort-active-bg" as unknown as string]: "#394e31",
};

export const DealerPointRuleTable: React.FC<Props> = ({
  data,
  loading,
  editable = false,
  onUpdate,
}) => {
  const [editableData, setEditableData] = React.useState<IDealerPointRule[]>(
    []
  );

  React.useEffect(() => {
    setEditableData(data);
  }, [data]);

  const handleValueChange = (
    level: string,
    field: keyof Pick<IDealerPointRule, "minPoints" | "price">,
    value: number | null
  ) => {
    setEditableData((prev) =>
      prev.map((item) =>
        item.membershipLevel === level ? { ...item, [field]: value ?? 0 } : item
      )
    );
  };

  const handleSave = () => {
    onUpdate?.(editableData);
  };

  const columns: ColumnsType<IDealerPointRule> = [
    {
      title: "Cấp độ",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (level: string) => {
        let color: string;
        switch (level) {
          case "BRONZE":
            color = "volcano";
            break;
          case "SILVER":
            color = "gray";
            break;
          case "GOLD":
            color = "gold";
            break;
          case "PLATINUM":
            color = "geekblue";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: "Điểm tối thiểu",
      dataIndex: "minPoints",
      key: "minPoints",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (val: number, record) =>
        editable ? (
          <InputNumber
            min={0}
            value={val}
            onChange={(v) =>
              handleValueChange(record.membershipLevel, "minPoints", v)
            }
          />
        ) : (
          <span className="text-gray-800 font-medium">
            {val?.toLocaleString("vi-VN")}
          </span>
        ),
    },
    {
      title: "Giá trị quy đổi (₫)",
      dataIndex: "price",
      key: "price",
      align: "center",
      onHeaderCell: () => ({ style: headerStyle }),
      render: (val: number, record) =>
        editable ? (
          <InputNumber
            min={0}
            step={100}
            value={val}
            onChange={(v) =>
              handleValueChange(record.membershipLevel, "price", v)
            }
          />
        ) : (
          <span className="text-gray-800 font-medium">
            {val?.toLocaleString("vi-VN")} ₫
          </span>
        ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <Table
        bordered
        rowKey="membershipLevel"
        size="middle"
        columns={columns}
        dataSource={editableData}
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
        sticky={{ offsetHeader: 0 }}
        className="bg-white [&_.ant-table-thead>tr>th]:!text-white"
      />

      {/* Nút cập nhật chỉ hiển thị nếu có quyền chỉnh sửa */}
      {editable && (
        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!onUpdate}
            className={`!border-none ${
              onUpdate
                ? "!bg-[#627254] hover:!bg-[#4f6f52] text-white"
                : "!bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Cập nhật
          </Button>
        </div>
      )}
    </div>
  );
};
