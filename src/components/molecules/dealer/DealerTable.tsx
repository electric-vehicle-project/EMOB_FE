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

  // FIX: toggle đúng hành vi AntD
  const toggleSort = (field: string) => {
    if (sortField !== field) {
      onSortChange(field, "asc");
      return;
    }
    if (sortDir === "asc") {
      onSortChange(field, "desc");
      return;
    }
    if (sortDir === "desc") {
      onSortChange(null, null); // back to default
      return;
    }
    onSortChange(field, "asc");
  };

  const columns: ColumnsType<IDealer> = [
    {
      title: "Tên đại lý",
      dataIndex: "name",
      key: "name",
      align: "center",
      sorter: { multiple: 1 }, // ⭐ bắt buộc
      sortOrder:
        sortField === "name"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      onHeaderCell: () => ({
        onClick: () => toggleSort("name"),
      }),
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
      filters: countryOptions.map((c) => ({ text: c, value: c })),
      filterMultiple: false,
      filteredValue: activeCountry ? [activeCountry] : null,
      onFilter: () => true,
      onHeaderCell: () => ({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
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
      sorter: { multiple: 1 }, // ⭐ bắt buộc
      sortOrder:
        sortField === "createdAt"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      onHeaderCell: () => ({
        onClick: () => toggleSort("createdAt"),
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
        sortDirections={["ascend", "descend"]} // ⭐ bắt buộc, KHÔNG dùng null
      />

      {pagination && (
        <div className="p-3 flex justify-center">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};
