import { Table, Pagination, Tag, Menu, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IInstallmentPlan } from "../../../model/InstallmentPlan";
import {
  formatDateTimeVietnam,
  formatDateVietnam,
} from "../../../utils/timeFeature";
import { formatMoney } from "../../../utils/formatMoney";
import { EllipsisOutlined } from "@ant-design/icons";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  onChange: (page: number, pageSize?: number) => void;
  showTotal?: (total: number) => string;
}

interface Props {
  data: IInstallmentPlan[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  onMarkAsPaid?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export const InstallmentPlanTable = ({
  data,
  pagination,
  isLoading,
  onMarkAsPaid,
  onViewDetail,
}: Props) => {
  const statusColors: Record<string, string> = {
    PAID: "green",
    NOT_PAID: "orange",
    OVERDUE: "red",
    CANCELLED: "default",
  };

  const statusMap: Record<string, string> = {
    PAID: "Đã thanh toán",
    NOT_PAID: "Chưa thanh toán",
    OVERDUE: "Quá hạn",
    CANCELLED: "Đã hủy",
  };

  const columns: ColumnsType<IInstallmentPlan> = [
    {
      title: "Ngày đặt cọc",
      dataIndex: "downDate",
      key: "downDate",
      render: (val: string) => (val ? formatDateTimeVietnam(val) : "-"),
    },
    {
      title: "Số tiền đặt cọc",
      dataIndex: "deposit",
      key: "deposit",
      render: (val: number) => formatMoney(val),
      align: "right",
    },
    {
      title: "Tổng số tiền trả góp",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val: number) => formatMoney(val),
      align: "right",
    },
    {
      title: "Số tiền trả hàng tháng",
      dataIndex: "monthlyAmount",
      key: "monthlyAmount",
      render: (val: number) => formatMoney(val),
      align: "right",
    },
    {
      title: "Lãi suất (%)",
      dataIndex: "interestRate",
      key: "interestRate",
      render: (val: number) => `${val}%`,
      align: "right",
    },
    {
      title: "Số tháng",
      dataIndex: "termMonths",
      key: "termMonths",
      render: (val: number) => `${val} tháng`,
      align: "right",
    },
    {
      title: "Ngày đến hạn tiếp theo",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      render: (val: string) => (val ? formatDateVietnam(val) : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status?: string) => {
        return status ? (
          <Tag color={statusColors[status] || "default"}>
            {statusMap[status] || status}
          </Tag>
        ) : (
          "-"
        );
      },
    },

    // =================== THAO TÁC ===================
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: "6%",
      render: (_, record) => {
        const isPaid = record.status === "PAID";
        const canMarkPaid =
          record.status === "NOT_PAID" || record.status === "OVERDUE";

        const menuItems = [
          {
            key: "details",
            label: (
              <span className="text-[14px] pl-10 pr-10">Xem chi tiết</span>
            ),
            onClick: () => onViewDetail?.(record.id),
          },
          {
            key: "markPaid",
            label: (
              <span
                className={`text-[14px] pl-10 pr-10 ${
                  isPaid ? "text-gray-400" : "text-green-600"
                }`}
              >
                Đánh dấu đã đóng
              </span>
            ),
            disabled: isPaid,
            onClick: () => {
              if (canMarkPaid) onMarkAsPaid?.(record.id);
            },
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
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <Table<IInstallmentPlan>
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
