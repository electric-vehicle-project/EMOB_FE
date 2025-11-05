// src/components/molecules/delivery/DeliveryTable.tsx
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Table, Tag, Tooltip, Space, Pagination, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

interface IDelivery {
    id: string;
    deliveryDate: string;
    quantity: number;
    status: string;
    createAt: string;
    completedAt?: string | null;
}

interface Props {
    data: IDelivery[];
    loading?: boolean;
    page: number;
    size: number;
    total: number;
    onPageChange?: (page: number) => void;
    onComplete?: (record: IDelivery) => void;
    onDelete?: (record: IDelivery) => void;
}

export const DeliveryTable = ({
    data,
    loading,
    page,
    size,
    total,
    onPageChange,
    onComplete,
    onDelete,
}: Props) => {
    const columns: ColumnsType<IDelivery> = [
        {
            title: "Mã giao hàng",
            dataIndex: "id",
            key: "id",
            render: (text, record) => (
                <Tooltip title={text}>
                    <Link
                        to={`${record.id}`}
                        className="block truncate text-[#627254] font-semibold hover:underline"
                    >
                        {text}
                    </Link>
                </Tooltip>
            ),
        },
        {
            title: "Ngày giao hàng",
            dataIndex: "deliveryDate",
            key: "deliveryDate",
            align: "center",
            sorter: (a, b) =>
                dayjs(a.deliveryDate).unix() - dayjs(b.deliveryDate).unix(),
            render: (val: string) => dayjs(val).format("DD/MM/YYYY"),
        },
        {
            title: "Số lượng xe",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (val: number) => <span className="font-medium">{val}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status: string) => {
                const color =
                    status === "SUCCESS"
                        ? "green"
                        : status === "IN_PROGRESS"
                            ? "blue"
                            : "red";
                return (
                    <Tag color={color} className="uppercase font-semibold">
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createAt",
            key: "createAt",
            align: "center",
            render: (val: string) => dayjs(val).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Ngày hoàn tất",
            dataIndex: "completedAt",
            key: "completedAt",
            align: "center",
            render: (val?: string | null) =>
                val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-",
        },
        {
            title: "Thao tác",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Space size="middle">
                    {record.status === "IN_PROGRESS" && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => onComplete?.(record)}
                            className="!bg-[#627254] hover:!bg-[#525e46] text-white rounded-md"
                        >
                            Sửa
                        </Button>
                    )}
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete?.(record)}
                        className="rounded-md"
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <Table<IDelivery>
                rowKey="id"
                dataSource={data}
                columns={columns}
                bordered
                loading={false}
                pagination={false} // dùng footer Pagination
                // Cuộn dọc + header sticky (giống Account)
                scroll={{ y: 560 }}
                sticky={{ offsetHeader: 0 }}
                className="
            bg-white
            [&_.ant-table-tbody>tr:hover>td]:!bg-white
            [&_.ant-table-row]:!transition-none

            /* Chỉ khi cột đang sort: nền xanh + chữ/icon trắng (đồng bộ Account) */
            [&_.ant-table-thead_th.ant-table-column-sort]:!bg-[#627254]
            [&_.ant-table-thead_th.ant-table-column-sort]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-column-sorter]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-column-sorter_.anticon]:!text-white
            [&_.ant-table-thead_th.ant-table-column-sort_.ant-table-filter-trigger]:!text-white
          "
                rowClassName={() => "bg-white"}
            />

            <div className="p-3 flex justify-center">
                <Pagination
                    current={page + 1}
                    pageSize={size}
                    total={total}
                    showSizeChanger={false}
                    onChange={onPageChange}
                    showTotal={(total) => `Tổng ${total} đơn giao hàng`}
                />
            </div>
        </div>
    );
};
