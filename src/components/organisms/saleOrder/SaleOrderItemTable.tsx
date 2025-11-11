import { Table, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SaleOrderItemResponse } from "../../../model/SaleOrder";
import { useGetVehicles } from "../../../service/vehicleService";
import { useVehicleUnitById as fetchVehicleUnitById } from "../../../service/vehicleUnitService";
import { mapVehicleOptions } from "../../../utils/mapToSelectOptions";
import { useMemo, useState, useEffect } from "react";

interface VehicleUnitResponse {
  id: string;
  vehicle: {
    id: string;
    brand: string;
    modelName: string;
  };
}

interface Props {
  items: SaleOrderItemResponse[];
}

export const SaleOrderItemTable = ({ items }: Props) => {
  const { data: vehicleData, isLoading: loadingVehicles } = useGetVehicles();
  const vehicleOptions = useMemo(
    () => mapVehicleOptions(vehicleData),
    [vehicleData]
  );

  const [unitMap, setUnitMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUnits = async () => {
      const map: Record<string, string> = {};
      const allUnitIds = items.flatMap((i) => i.vehicleUnitIds || []);
      const uniqueUnitIds = Array.from(new Set(allUnitIds));

      for (const id of uniqueUnitIds) {
        try {
          const data: VehicleUnitResponse = await fetchVehicleUnitById(id);
          if (data?.vehicle?.id && data?.vehicle?.modelName) {
            map[id] = `${data.vehicle.brand} ${data.vehicle.modelName}`;
          }
        } catch {
          map[id] = "Không xác định";
        }
      }
      setUnitMap(map);
    };

    if (items.some((i) => i.vehicleUnitIds?.length)) fetchUnits();
  }, [items]);

  const getVehicleLabel = (vehicleId?: string, fallback?: string) => {
    if (!vehicleId) return fallback ?? "Không xác định";
    const found = vehicleOptions.find((v) => v.value === vehicleId);
    return found ? found.label : fallback ?? "Không xác định";
  };

  const columns: ColumnsType<SaleOrderItemResponse> = useMemo(
    () => [
      {
        title: "Xe điện",
        dataIndex: "vehicleId",
        key: "vehicleId",
        width: "22%",
        render: (_: string, record) => {
          const vehicleId = record.vehicleId || record.vehicleUnitIds?.[0];
          const fallbackName =
            record.vehicleName ||
            (record.vehicleUnitIds?.[0]
              ? unitMap[record.vehicleUnitIds[0]]
              : "Không xác định");

          if (loadingVehicles && !unitMap[vehicleId ?? ""]) {
            return <Spin size="small" />;
          }

          return (
            <span className="font-medium text-gray-800">
              {getVehicleLabel(vehicleId, fallbackName)}
            </span>
          );
        },
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
    [vehicleOptions, unitMap, loadingVehicles]
  );

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
