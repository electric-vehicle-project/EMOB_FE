import React, { useMemo } from "react";
import { Table, Button } from "antd";
import type { SortOrder } from "antd/es/table/interface";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { IDealer } from "../../../model/Dealer";

interface Props {
  data: IDealer[];
  onEdit: (dealer: IDealer) => void;
  onDelete: (id: string) => void;
}

export const DealerTable: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  // ✅ Lấy danh sách quốc gia duy nhất để làm filter
  const countryFilters = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((d) => d.country || "Không xác định"))
    );
    return unique.map((country) => ({
      text: country,
      value: country,
    }));
  }, [data]);

  const columns: ColumnsType<IDealer> = [
    {
      title: "Tên đại lý",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      ellipsis: true,
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "contactInfo",
      ellipsis: true,
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      filters: countryFilters,
      onFilter: (value, record) => record.country === value,
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt ?? "").getTime() -
        new Date(b.createdAt ?? "").getTime(),
      sortDirections: ["descend", "ascend"] as SortOrder[],
      render: (value: string | undefined) =>
        value ? new Date(value).toLocaleString("vi-VN") : "-",
      width: 180,
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_: undefined, record: IDealer) => (
        <div className="flex justify-center items-center gap-2 flex-wrap mx-auto">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="rounded-md bg-[#627254] border-none hover:opacity-90 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sửa
          </Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            className="rounded-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Xóa
          </Button>
        </div>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  return (
    <Table<IDealer>
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      rowClassName={() => "transition-colors duration-200 hover:bg-[#f7f9f4]"}
      scroll={{ x: true }}
      size="middle"
    />
  );
};
