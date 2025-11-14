import { Table, Button, Pagination, Tag } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
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

  /** sort hiện tại */
  sortField: string;
  sortDir: "asc" | "desc";
  onSortChange: (field: string, dir: "asc" | "desc") => void;

  /** filter quốc gia */
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

  sortField,
  sortDir,
  onSortChange,

  countryOptions,
  activeCountry,
  onFilterCountry,
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
      sorter: true,
      sortOrder:
        sortField === "name"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : null,
      onHeaderCell: () => ({
        onClick: () =>
          onSortChange(
            "name",
            sortField === "name" && sortDir === "asc" ? "desc" : "asc"
          ),
      }),
    },

    {
      title: "Email",
      dataIndex: "emailContact",
      key: "emailContact",
    },

    {
      title: "Điện thoại",
      dataIndex: "phoneContact",
      key: "phoneContact",
    },

    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
      filters: countryOptions.map((c) => ({ text: c, value: c })),
      filteredValue: activeCountry ? [activeCountry] : null,
      onFilter: () => true, // BẮT BUỘC để antd hiện UI, filter thực tế do backend xử lý
      onHeaderCell: () => ({
        // disable click sort khi filter
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
    },

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

    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder:
        sortField === "createdAt"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : null,
      onHeaderCell: () => ({
        onClick: () =>
          onSortChange(
            "createdAt",
            sortField === "createdAt" && sortDir === "asc" ? "desc" : "asc"
          ),
      }),
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

  const handleChange: TableProps<IDealer>["onChange"] = (_, filters) => {
    const countryVal = filters.country?.[0] as string | undefined;
    onFilterCountry(countryVal);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <Table<IDealer>
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={isLoading}
        pagination={false}
        onChange={handleChange}
      />

      {pagination && (
        <div className="p-3 flex justify-center">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};
