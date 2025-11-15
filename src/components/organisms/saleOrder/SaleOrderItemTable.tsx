import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SaleOrderItemResponse } from "../../../model/SaleOrder";
import { useGetVehicles } from "../../../service/vehicleService";
import { useMemo } from "react";

interface Props {
  items: SaleOrderItemResponse[];
}

type VehicleItem = {
  id: string;
  brand: string;
  model: string;
};

export const SaleOrderItemTable = ({ items }: Props) => {
  const { vehicles } = useGetVehicles();

  const vehicleMap = useMemo(() => {
    const map: Record<string, string> = {};

    const list = Array.isArray(vehicles) ? (vehicles as VehicleItem[]) : [];

    list.forEach((v) => {
      if (v.id) {
        map[v.id] = `${v.brand} ${v.model}`;
      }
    });

    return map;
  }, [vehicles]);

  const columns: ColumnsType<SaleOrderItemResponse> = [
    {
      title: "Xe điện",
      dataIndex: "vehicleId",
      key: "vehicleId",
      align: "left",
      width: 260,
      render: (_: string, record) => {
        const id = record.vehicleId;
        const label = vehicleMap[id] || record.vehicleName || "Không xác định";

        return (
          <span className="font-medium text-gray-800 whitespace-nowrap">
            {label}
          </span>
        );
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      align: "center",
      width: 120,
      render: (color?: string) => color ?? "-",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Đơn giá (VNĐ)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "center",
      width: 150,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price?: number) => (price ? price.toLocaleString("vi-VN") : "0"),
    },
    {
      title: "Giảm giá (VNĐ)",
      dataIndex: "discountPrice",
      key: "discountPrice",
      align: "center",
      width: 150,
      render: (discount?: number) =>
        discount ? discount.toLocaleString("vi-VN") : "0",
    },
    {
      title: "Thành tiền (VNĐ)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      width: 160,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (price?: number) =>
        price ? (
          <span className="font-semibold text-green-700">
            {price.toLocaleString("vi-VN")}
          </span>
        ) : (
          "0"
        ),
    },
    {
      title: "Khuyến mãi",
      dataIndex: "promotionName",
      key: "promotionName",
      align: "center",
      width: 150,
      render: (text?: string) => text ?? "-",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={items.map((item) => ({
        ...item,
        key: item.id,
      }))}
      pagination={false}
      bordered
      className="rounded-xl shadow-sm bg-white"
      locale={{
        emptyText: "Không có sản phẩm nào trong đơn hàng",
      }}
      scroll={{ x: "max-content" }}
    />
  );
};
