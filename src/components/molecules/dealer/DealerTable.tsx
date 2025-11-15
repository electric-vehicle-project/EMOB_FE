import { Table, Pagination, Tag, Menu, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisOutlined } from "@ant-design/icons";
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

  /* vẫn giữ props nhưng table không dùng */
  sortField: string | null;
  sortDir: "asc" | "desc" | null;
  onSortChange: (field: string | null, dir: "asc" | "desc" | null) => void;

  countryOptions: string[];
  activeCountry?: string;
  onFilterCountry: (country: string | undefined) => void;

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
    {
      title: "Tên đại lý",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "emailContact",
      key: "emailContact",
      align: "center",
    },
    {
      title: "Điện thoại",
      dataIndex: "phoneContact",
      key: "phoneContact",
      align: "center",
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      align: "center",
    },
    {
      title: "Khu vực",
      dataIndex: "region",
      key: "region",
      align: "center",
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
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (val: string) => (val ? formatDateTimeVietnam(val) : "-"),
    },
  ];

  if (canModify) {
    columns.push({
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: "6%",
      render: (_, record) => {
        const menuItems = [
          {
            key: "edit",
            label: <span className="text-[14px] pl-10 pr-10">Sửa</span>,
            onClick: () => onEdit(record),
          },
          {
            key: "delete",
            label: (
              <span className="text-[14px] pl-10 pr-10 text-red-500">Xóa</span>
            ),
            onClick: () => onDelete(record.id!),
          },
        ];

        return (
          <Dropdown
            overlay={<Menu items={menuItems} />}
            trigger={["click"]}
            placement="bottomRight"
          >
            <EllipsisOutlined className="text-2xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        );
      },
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
