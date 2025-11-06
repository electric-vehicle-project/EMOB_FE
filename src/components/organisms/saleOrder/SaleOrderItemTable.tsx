import { Table, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SaleOrderItemResponse } from "../../../model/SaleOrder";
import { useGetVehicles } from "../../../service/vehicleService";
import { mapVehicleOptions } from "../../../utils/mapToSelectOptions";
import { useMemo } from "react";

interface Props {
  items: SaleOrderItemResponse[];
}

export const SaleOrderItemTable = ({ items }: Props) => {
  // ==============================
  // 🔍 Prefetch toàn bộ danh sách xe điện
  // ==============================
  const { data: vehicleData, isLoading: loadingVehicles } = useGetVehicles();
  const vehicleOptions = useMemo(
    () => mapVehicleOptions(vehicleData),
    [vehicleData]
  );

  // ==============================
  // 🧩 Hàm map vehicleId → Tên xe (brand + model)
  // ==============================
  const getVehicleLabel = (vehicleId: string, fallback?: string) => {
    const found = vehicleOptions.find((v) => v.value === vehicleId);
    return found ? found.label : fallback ?? "Không xác định";
  };

  // ==============================
  // 🧾 Cấu hình cột
  // ==============================
  const columns: ColumnsType<SaleOrderItemResponse> = useMemo(
    () => [
      {
        title: "Xe điện",
        dataIndex: "vehicleId",
        key: "vehicleId",
        width: "22%",
        sorter: (a, b) =>
          getVehicleLabel(a.vehicleId).localeCompare(
            getVehicleLabel(b.vehicleId)
          ),
        render: (vehicleId: string, record) =>
          loadingVehicles ? (
            <Spin size="small" />
          ) : (
            <span className="font-medium text-gray-800">
              {getVehicleLabel(vehicleId, record.vehicleName)}
            </span>
          ),
      },
      {
        title: "Màu sắc",
        dataIndex: "color",
        key: "color",
        width: "12%",
        render: (color?: string) => color ?? "-",
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: "10%",
        sorter: (a, b) => a.quantity - b.quantity,
        align: "center",
      },
      {
        title: "Đơn giá (VNĐ)",
        dataIndex: "unitPrice",
        key: "unitPrice",
        align: "right",
        sorter: (a, b) => a.unitPrice - b.unitPrice,
        render: (price?: number) =>
          price ? price.toLocaleString("vi-VN") : "-",
      },
      {
        title: "Giảm giá (VNĐ)",
        dataIndex: "discountPrice",
        key: "discountPrice",
        align: "right",
        render: (discount?: number) =>
          discount ? discount.toLocaleString("vi-VN") : "-",
      },
      {
        title: "Thành tiền (VNĐ)",
        dataIndex: "totalPrice",
        key: "totalPrice",
        align: "right",
        sorter: (a, b) => a.totalPrice - b.totalPrice,
        render: (price?: number) =>
          price ? (
            <span className="font-semibold text-green-700">
              {price.toLocaleString("vi-VN")}
            </span>
          ) : (
            "-"
          ),
      },
      {
        title: "Khuyến mãi",
        dataIndex: "promotionName",
        key: "promotionName",
        width: "15%",
        render: (text?: string) => text ?? "-",
      },
    ],
    [vehicleOptions, loadingVehicles]
  );

  // ==============================
  // 💅 Render Table
  // ==============================
  return (
    <Table
      columns={columns}
      dataSource={items.map((item) => ({ ...item, key: item.id }))}
      pagination={false}
      bordered
      className="rounded-xl overflow-hidden shadow-sm"
      locale={{
        emptyText: "Không có sản phẩm nào trong đơn hàng",
      }}
    />
  );
};
