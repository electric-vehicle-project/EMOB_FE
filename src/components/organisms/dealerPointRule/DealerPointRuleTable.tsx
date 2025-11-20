import { InputNumber, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IDealerPointRule } from "../../../model/DealerPointRule";
import React from "react";
import { toast } from "react-toastify";
import { EMOBTable } from "../../molecules/EMOBTable";

interface Props {
  data: IDealerPointRule[];
  loading?: boolean;
  editable?: boolean;
  onUpdate?: (updatedData: IDealerPointRule[]) => void;
}

const getLevelColor = (level: string): string => {
  switch (level) {
    case "NORMAL":
      return "green";
    case "BRONZE":
      return "volcano";
    case "SILVER":
      return "gray";
    case "GOLD":
      return "gold";
    case "PLATINUM":
      return "geekblue";
    default:
      return "default";
  }
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
    field: "minPoints" | "price",
    value: number | null
  ) => {
    setEditableData((prev) =>
      prev.map((item) =>
        item.membershipLevel === level ? { ...item, [field]: value ?? 0 } : item
      )
    );
  };

  const handleSave = () => {
    if (!onUpdate) {
      toast.error("Không thể cập nhật");
      return;
    }
    onUpdate(editableData);
    toast.success("Cập nhật thành công");
  };

  const columns: ColumnsType<IDealerPointRule> = [
    {
      title: "Cấp độ",
      dataIndex: "membershipLevel",
      key: "membershipLevel",
      align: "center",
      width: 160,
      render: (level: string) => (
        <Tag color={getLevelColor(level)} className="font-medium">
          {level}
        </Tag>
      ),
    },
    {
      title: "Điểm tối thiểu",
      dataIndex: "minPoints",
      key: "minPoints",
      align: "center",
      width: 170,
      render: (val, record) =>
        editable ? (
          <InputNumber
            min={0}
            value={val}
            onChange={(v) =>
              handleValueChange(record.membershipLevel, "minPoints", v)
            }
          />
        ) : (
          val.toLocaleString("vi-VN")
        ),
    },
    {
      title: "Giá trị quy đổi (₫)",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 180,
      render: (val, record) =>
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
          `${val.toLocaleString("vi-VN")} ₫`
        ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <EMOBTable
        rowKey="membershipLevel"
        columns={columns}
        dataSource={editableData}
        loading={loading}
        pagination={false}
      />

      {editable && (
        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            onClick={handleSave}
            className="!bg-[#627254] hover:!bg-[#4f6f52]"
          >
            Cập nhật
          </Button>
        </div>
      )}
    </div>
  );
};
