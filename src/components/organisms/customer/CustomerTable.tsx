import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig, TableProps } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import type { RootState } from "../../../redux/store";
import type {
  ICustomer,
  CustomerStatus,
  MembershipLevel,
} from "../../../model/Customer";

import { EMOBTable } from "../../molecules/EMOBTable";
import type { SorterResult } from "antd/es/table/interface";
import type { JSX } from "react";

interface Props {
  data: ICustomer[];
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;

  sortField: string;
  sortDir: "asc" | "desc";
  onChangeSort: (field?: string, order?: "ascend" | "descend") => void;

  pagination?: TablePaginationConfig;
}

const STATUS_COLORS: Record<CustomerStatus, string> = {
  LEAD: "blue",
  ACTIVE: "green",
  INACTIVE: "orange",
  BLOCKED: "volcano",
  DELETED: "red",
};

const STATUS_LABELS: Record<CustomerStatus, string> = {
  LEAD: "Tiềm năng",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BLOCKED: "Bị chặn",
  DELETED: "Đã xoá",
};

const MEMBERSHIP_LABELS: Record<MembershipLevel, string> = {
  NORMAL: "Thường",
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
};

export const CustomerTable = ({
  data,
  loading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  sortField,
  sortDir,
  onChangeSort,
  pagination,
}: Props) => {
  const user = useSelector((s: RootState) => s.user);
  const role =
    (user?.role as "MANAGER" | "DEALER_STAFF" | null) ?? "DEALER_STAFF";

  const rolePrefix = role === "MANAGER" ? "/manager" : "/dealer_staff";
  const order: "ascend" | "descend" = sortDir === "asc" ? "ascend" : "descend";

  const columns: ColumnsType<ICustomer> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: true,
      sortOrder: sortField === "fullName" ? order : null,
      render: (text: string | undefined, record: ICustomer) => (
        <a
          onClick={() =>
            window.open(`${rolePrefix}/customers/${record.id}`, "_self")
          }
          className="text-[#4f6f52] hover:text-[#627254] font-medium transition-colors cursor-pointer"
        >
          {text || "Không xác định"}
        </a>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: sortField === "email" ? order : null,
      render: (email?: string) => email || "—",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
      sortOrder: sortField === "phoneNumber" ? order : null,
      render: (phone?: string) => phone || "—",
    },
    {
      title: "Cấp độ",
      dataIndex: "memberShipLevel",
      key: "memberShipLevel",
      align: "center",
      render: (level?: MembershipLevel) =>
        level ? (
          <Tag color="geekblue">{MEMBERSHIP_LABELS[level]}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      align: "center",
      sorter: true,
      sortOrder: sortField === "dateOfBirth" ? order : null,
      render: (val?: string) => (val ? dayjs(val).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status?: CustomerStatus) =>
        status ? (
          <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  const handleChange: TableProps<ICustomer>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    const s = Array.isArray(sorter)
      ? sorter[0]
      : (sorter as SorterResult<ICustomer>);

    const field = s?.field as string | undefined;
    const orderValue = s?.order as "ascend" | "descend" | undefined;

    onChangeSort(field, orderValue);
  };

  const hasActions = Boolean(canEdit || canDelete);

  const actions = !hasActions
    ? undefined
    : (record: ICustomer): { key: string; label: JSX.Element }[] => {
        const menu: { key: string; label: JSX.Element }[] = [];

        // CHI TIẾT (màu đen)
        menu.push({
          key: "detail",
          label: (
            <div
              className="text-black cursor-pointer hover:text-[#4f6f52]"
              onClick={() =>
                window.open(`${rolePrefix}/customers/${record.id}`, "_self")
              }
            >
              Chi tiết
            </div>
          ),
        });

        // CHỈNH SỬA (màu đen)
        if (canEdit) {
          menu.push({
            key: "edit",
            label: (
              <div
                className="text-black cursor-pointer hover:text-[#4f6f52]"
                onClick={() => onEdit?.(record.id)}
              >
                Chỉnh sửa
              </div>
            ),
          });
        }

        // XOÁ (giữ đỏ)
        if (canDelete) {
          menu.push({
            key: "delete",
            label: (
              <div
                className="text-red-600 cursor-pointer hover:text-red-700"
                onClick={() => onDelete?.(record.id)}
              >
                Xoá
              </div>
            ),
          });
        }

        return menu;
      };

  return (
    <EMOBTable<ICustomer>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={handleChange}
      actions={actions}
    />
  );
};
