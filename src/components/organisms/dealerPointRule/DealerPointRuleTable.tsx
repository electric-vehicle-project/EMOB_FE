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
    if (!onUpdate) {
      toast.error("Không thể cập nhật quyền này");
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
      render: (level: string) => {
        const mapColor: Record<string, string> = {
          BRONZE: "volcano",
          SILVER: "gray",
          GOLD: "gold",
          PLATINUM: "geekblue",
        };
        return <Tag color={mapColor[level] || "default"}>{level}</Tag>;
      },
    },
    {
      title: "Điểm tối thiểu",
      dataIndex: "minPoints",
      key: "minPoints",
      align: "center",
      width: 160,
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
          val.toLocaleString("vi-VN")
        ),
    },
    {
      title: "Giá trị quy đổi (₫)",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 180,
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
        scroll={{ x: "max-content" }}
      />

      {editable && (
        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            onClick={handleSave}
            className="!bg-[#627254] !border-[#627254] !text-white hover:!bg-[#4f6f52]"
          >
            Cập nhật
          </Button>
        </div>
      )}
    </div>
  );
};
