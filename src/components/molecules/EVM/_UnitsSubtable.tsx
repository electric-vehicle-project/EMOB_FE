// import { Table, Tag, Empty, Spin } from "antd";
// import dayjs from "dayjs";
// import { useGetVehicleUnitsByVehicleId } from "../../../service/vehicleService";

// interface Props {
//   vehicleId: string;
// }

// type UnitRow = {
//   vehicleUnitId: string;
//   vinNumber: string;
//   color: string;
//   productionYear?: string; // swagger trả date -> hiển thị YYYY
//   purchaseDate?: string; // swagger trả ISO
//   warrantyStart?: string; // swagger trả YYYY-MM-DD
//   warrantyEnd?: string; // swagger trả YYYY-MM-DD
//   status:
//     | "NORMAL"
//     | "SPECIAL"
//     | "OLD_STOCK"
//     | "TEST_DRIVE"
//     | "RESERVED"
//     | "SOLD";
//   price?: number;
// };

// const statusColor: Record<UnitRow["status"], string> = {
//   NORMAL: "green",
//   SPECIAL: "purple",
//   OLD_STOCK: "orange",
//   TEST_DRIVE: "blue",
//   RESERVED: "gold",
//   SOLD: "red",
// };

// const UnitsSubtable = ({ vehicleId }: Props) => {
//   const { units, isLoading } = useGetVehicleUnitsByVehicleId(vehicleId, {
//     // subtable chỉ xem nhanh, không phân trang
//     enabled: !!vehicleId,
//   });

//   const rows: UnitRow[] = Array.isArray(units) ? (units as UnitRow[]) : [];

//   if (isLoading) {
//     return (
//       <div className="py-6 flex justify-center">
//         <Spin tip="Đang tải danh sách lô xe..." />
//       </div>
//     );
//   }

//   if (!rows.length) {
//     return (
//       <div className="py-4">
//         <Empty description="Chưa có đơn vị xe nào trong kho" />
//       </div>
//     );
//   }

//   return (
//     <Table<UnitRow>
//       size="small"
//       rowKey={(r) => r.vehicleUnitId}
//       columns={[
//         { title: "VIN", dataIndex: "vinNumber" },
//         { title: "Màu sắc", dataIndex: "color" },
//         {
//           title: "Năm SX",
//           dataIndex: "productionYear",
//           render: (v?: string) => (v ? dayjs(v).format("YYYY") : "—"),
//         },
//         {
//           title: "Ngày mua",
//           dataIndex: "purchaseDate",
//           render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD") : "—"),
//         },
//         {
//           title: "Bảo hành",
//           render: (r: UnitRow) =>
//             `${
//               r.warrantyStart
//                 ? dayjs(r.warrantyStart).format("YYYY-MM-DD")
//                 : "—"
//             } → ${
//               r.warrantyEnd ? dayjs(r.warrantyEnd).format("YYYY-MM-DD") : "—"
//             }`,
//         },
//         {
//           title: "Trạng thái",
//           dataIndex: "status",
//           render: (s: UnitRow["status"]) => (
//             <Tag color={statusColor[s]}>{s}</Tag>
//           ),
//         },
//         {
//           title: "Giá bán lẻ",
//           dataIndex: "price",
//           render: (p?: number) =>
//             typeof p === "number" ? `${p.toLocaleString("vi-VN")}₫` : "—",
//         },
//       ]}
//       dataSource={rows}
//       pagination={false}
//     />
//   );
// };

// export default UnitsSubtable;
