import { Table, Tooltip, Dropdown, Menu, Tag } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { IContract } from "../../../model/Contract";
import dayjs from "dayjs";

interface Props {
    data: IContract[];
    loading?: boolean;
    page: number;
    size: number;
    total: number;
    onPageChange?: (page: number) => void;
}

export const ContractTable = ({ data }: Props) => {
  const navigate = useNavigate();

  const statusFilters = useMemo(
    () =>
      Array.from(new Set((data || []).map((d) => d.status).filter(Boolean))).map(
        (s) => ({ text: String(s), value: String(s) })
      ),
    [data]
  );

  const columns: ColumnsType<IContract> = [
    {
      title: "Mã hợp đồng",
      dataIndex: "contractNumber",
      key: "contractNumber",
      minWidth: 220,
      width: "22%",
      ellipsis: { showTitle: false },
      sorter: (a, b) =>
        (a.contractNumber || "").localeCompare(b.contractNumber || "", "vi", {
          sensitivity: "base",
        }),
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-semibold text-[#333]">{text}</span>
        </Tooltip>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: statusFilters,
      minWidth: 120,
      width: "12%",
      render: (status: string) => {
        const color =
          status === "SIGNED"
            ? "green"
            : status === "PENDING"
              ? "yellow"
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
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      minWidth: 150,
      width: "15%",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (val: string) => (
        <span>{dayjs(val).format("DD/MM/YYYY HH:mm")}</span>
      ),
    },

    {
      title: "Tổng giá trị (₫)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      minWidth: 140,
      width: "13%",
      
      sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
      render: (val: number) => (
        <span className="font-semibold text-gray-700">
          {val?.toLocaleString("vi-VN")}
        </span>
      ),
    },

    {
      title: "Thuế VAT (₫)",
      dataIndex: "vatAmount",
      key: "vatAmount",
      minWidth: 120,
      width: "12%",
      align: "left",
      sorter: (a, b) => (a.vatAmount || 0) - (b.vatAmount || 0),
      render: (val: number) => (
        <span className="font-semibold text-gray-700">
          {val?.toLocaleString("vi-VN")}
        </span>
      ),
    },

    {
      title: "Tổng số lượng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      minWidth: 100,
      width: "10%",
      align: "center",
      sorter: (a, b) => (a.totalQuantity || 0) - (b.totalQuantity || 0),
      render: (val: number) => <Tag className="font-medium">{val}</Tag>,
    },

    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      minWidth: 100,
      width: "10%",
      render: (_, record) => {
        const menu = (
          <Menu
            items={[
              {
                key: "detail",
                label: <span className="text-[14px] pl-10 pr-10">Chi tiết</span>,
                onClick: () => navigate(record.contractId),
              },
            ]}
          />
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <EllipsisOutlined className="text-5xl cursor-pointer text-gray-600 hover:text-black" />
          </Dropdown>
        );
      },
    },
  ];


  return (
    <div className="bg-white rounded-2xl shadow-sm ">
      <div className="rounded-2xl overflow-hidden">
        <Table<IContract>
          rowKey="contractId"
          dataSource={data}
          columns={columns}
          bordered
          pagination={false}
          scroll={{ x: "100%", y: 560 }}
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
    </div>
  );
};
