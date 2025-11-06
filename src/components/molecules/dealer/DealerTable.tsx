import { Table, Button, Pagination, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { IDealer } from "../../../model/Dealer";
import { formatDateTimeVietnam } from "../../../utils/timeFeature";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  onChange: (page: number, pageSize?: number) => void;
  showTotal?: (total: number) => string;
}

interface Props {
  data: IDealer[];
  onEdit: (dealer: IDealer) => void;
  onDelete: (id: string) => void;
  canModify?: boolean;
  isLoading?: boolean;
  pagination?: PaginationProps;
}

export const DealerTable = ({
  data,
  onEdit,
  onDelete,
  canModify = false,
  pagination,
  isLoading,
}: Props) => {
  const regionColors: Record<string, string> = {
    NORTH: "green",
    CENTRAL: "blue",
    SOUTH: "volcano",
  };

  const columns: ColumnsType<IDealer> = [
    { title: "Tên đại lý", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "emailContact", key: "emailContact" },
    { title: "Điện thoại", dataIndex: "phoneContact", key: "phoneContact" },
    { title: "Quốc gia", dataIndex: "country", key: "country" },
    {
      title: "Khu vực",
      dataIndex: "region",
      key: "region",
      render: (r?: string) => {
        const regionMap: Record<string, string> = {
          NORTH: "Miền Bắc",
          CENTRAL: "Miền Trung",
          SOUTH: "Miền Nam",
        };
        return r ? (
          <Tag color={regionColors[r] || "default"}>{regionMap[r]}</Tag>
        ) : (
          "-"
        );
      },
    },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (val ? formatDateTimeVietnam(val) : "-"),
    },
  ];

  if (canModify) {
    columns.push({
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id!)}
          >
            Xóa
          </Button>
        </div>
      ),
    });
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <Table<IDealer>
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={isLoading}
        pagination={false}
      />
      {pagination && (
        <div className="p-3 flex justify-center">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};
