import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

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

export const DeliveryTable = ({ data }: Props) => {
    const navigate = useNavigate();

    const columns: ColumnsType<IDelivery> = [
        {
            title: "Mã giao hàng",
            dataIndex: "id",
            key: "id",
            minWidth: 200,
            width: "20%",
            ellipsis: { showTitle: false },
            sorter: (a, b) => a.id.localeCompare(b.id),
            render: (text) => (
                <Tooltip title={text}>
                    <span className="block truncate text-[#627254] font-bold">
                        {text}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            minWidth: 120,
            width: "12%",
            filters: [
                { text: "SUCCESS", value: "SUCCESS" },
                { text: "IN_PROGRESS", value: "IN_PROGRESS" },
                { text: "FAILED", value: "FAILED" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: string) => {
                const color =
                    status === "SUCCESS"
                        ? "green"
                        : status === "IN_PROGRESS"
                            ? "blue"
                            : "red";

                return (
                    <Tooltip title={status}>
                        <Tag color={color} className="uppercase font-semibold">
                            {status}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "Số lượng xe",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            minWidth: 120,
            width: "11%",
            sorter: (a, b) => a.quantity - b.quantity,
            render: (val: number) => (
                <Tooltip title={val}>
                    <Tag className="font-medium">{val}</Tag>
                </Tooltip>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createAt",
            key: "createAt",
            align: "center",
            minWidth: 150,
            width: "14%",
            sorter: (a, b) =>
                dayjs(a.createAt).unix() - dayjs(b.createAt).unix(),
            render: (val: string) => (
                <Tooltip title={dayjs(val).format("DD/MM/YYYY HH:mm")}>
                    {dayjs(val).format("DD/MM/YYYY HH:mm")}
                </Tooltip>
            ),
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "deliveryDate",
            key: "deliveryDate",
            align: "center",
            minWidth: 150,
            width: "16%",
            sorter: (a, b) =>
                dayjs(a.deliveryDate).unix() - dayjs(b.deliveryDate).unix(),
            render: (val: string) => (
                <Tooltip title={dayjs(val).format("DD/MM/YYYY")}>
                    {dayjs(val).format("DD/MM/YYYY")}
                </Tooltip>
            ),
        },
        {
            title: "Ngày hoàn tất",
            dataIndex: "completedAt",
            key: "completedAt",
            align: "center",
            minWidth: 150,
            width: "14%",
            sorter: (a, b) =>
                dayjs(a.completedAt).unix() - dayjs(b.completedAt).unix(),
            render: (val?: string | null) =>
                val ? (
                    <Tooltip title={dayjs(val).format("DD/MM/YYYY HH:mm")}>
                        {dayjs(val).format("DD/MM/YYYY HH:mm")}
                    </Tooltip>
                ) : (
                    "-"
                ),
        },
        {
            title: "Thao tác",
            key: "actions",
            align: "center",
            minWidth: 80,
            width: "9%",
            render: (_, record) => {
                const menu = (
                    <Menu
                        items={[
                            {
                                key: "detail",
                                label: (
                                    <span className="text-[14px] pl-10 pr-10">
                                        Chi tiết
                                    </span>
                                ),
                                onClick: () => navigate(record.id),
                            },
                        ]}
                    />
                );

                return (
                    <Dropdown
                        overlay={menu}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <EllipsisOutlined className="text-5xl cursor-pointer text-gray-600 hover:text-black" />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <Table<IDelivery>
                rowKey="id"
                dataSource={data}
                columns={columns}
                bordered
                pagination={false}
                scroll={{ y: 560 }}
                sticky={{ offsetHeader: 0 }}
                className="
                   bg-white
            [&_.ant-table-tbody>tr:hover>td]:!bg-white
            [&_.ant-table-row]:!transition-none
            [&_.ant-table-thead_th.ant-table-column-sort]:!bg-[#627254]
            [&_.ant-table-thead_th.ant-table-column-sort]:!text-white
                    [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-2xl
                    [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-2xl
                    [&_.ant-table-thead>tr>th]:!border-none
                    [&_.ant-table-container]:!rounded-2xl
                    [&_.ant-table]:!rounded-2xl
                "
                rowClassName={() => "bg-white"}
            />
        </div>
    );
};
