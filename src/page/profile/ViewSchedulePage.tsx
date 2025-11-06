// import React, { useEffect, useMemo, useState } from "react";
// import { DatePicker, Table, Tag, Input } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import {
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   ClockCircleOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import { testDriveService } from "../../service/testDriveService";
// import { useCurrentUser as getCurrentUser } from "../../utils/getCurrentUser";
// import CardWrapper from "../../components/template/CardWrapper";

// import type { Dayjs } from "dayjs";

// interface ScheduleItem {
//   id: number;
//   car: string;
//   date: string; // ISO
//   status: string;
//   accountId?: string;
//   duration?: number;
//   startTime?: string;
//   endTime?: string;
// }

// const ViewSchedulePage: React.FC = () => {
//   const user = getCurrentUser() as { accountId?: string | number } | null;
//   const [rawData, setRawData] = useState<ScheduleItem[]>([]);
//   const [query, setQuery] = useState<string>("");
//   const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       const svc = testDriveService as unknown as {
//         getByAccountId?: (id: string | number) => Promise<ScheduleItem[]>;
//         getTestDrives?: () => Promise<ScheduleItem[]>;
//       };
//       let list: ScheduleItem[] = [];
//       if (typeof svc.getByAccountId === "function" && user?.accountId) {
//         list = await svc.getByAccountId(user.accountId);
//       } else if (typeof svc.getTestDrives === "function") {
//         const all = await svc.getTestDrives();
//         list = Array.isArray(all)
//           ? all.filter((d) =>
//               user?.accountId ? d.accountId === String(user.accountId) : true
//             )
//           : [];
//       }
//       if (mounted) setRawData(list);
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [user]);

//   const filtered = useMemo<ScheduleItem[]>(() => {
//     let data = rawData;
//     if (query.trim()) {
//       const q = query.toLowerCase();
//       data = data.filter(
//         (d) => d.car.toLowerCase().includes(q) || String(d.id).includes(q)
//       );
//     }
//     if (range && range[0] && range[1]) {
//       const start = range[0]!.startOf("day").toDate().getTime();
//       const end = range[1]!.endOf("day").toDate().getTime();
//       data = data.filter((d) => {
//         const t = new Date(d.date).getTime();
//         return t >= start && t <= end;
//       });
//     }
//     return data;
//   }, [rawData, query, range]);

//   const columns: ColumnsType<ScheduleItem> = [
//     { title: "Mã lịch hẹn", dataIndex: "id", width: 120 },
//     { title: "Mẫu xe", dataIndex: "car" },
//     { title: "Ngày giờ", dataIndex: "date" },
//     {
//       title: "Thời lượng lái thử",
//       dataIndex: "duration",
//       render: (_: unknown, record: ScheduleItem) => {
//         if (record.startTime && record.endTime) {
//           return `${record.startTime} - ${record.endTime}`;
//         }
//         if (typeof record.duration === "number") {
//           return `${record.duration} phút`;
//         }
//         return "-";
//       },
//     },
//     // Thêm cột thời gian nếu dữ liệu có startTime/endTime trong tương lai
//     {
//       title: "Trạng thái",
//       dataIndex: "status",
//       render: (status: string) => {
//         switch (status) {
//           case "Pending":
//             return (
//               <Tag color="gold" icon={<ClockCircleOutlined />}>
//                 Pending
//               </Tag>
//             );
//           case "Completed":
//             return (
//               <Tag color="green" icon={<CheckCircleOutlined />}>
//                 Completed
//               </Tag>
//             );
//           case "Cancelled":
//             return (
//               <Tag color="red" icon={<CloseCircleOutlined />}>
//                 Cancelled
//               </Tag>
//             );
//           default:
//             return <Tag>{status}</Tag>;
//         }
//       },
//     },
//   ];

//   return (
//     <CardWrapper title="" maxWidth="max-w-6xl" variant="profile">
//       <div className="mb-6">
//         <div className="border-l-4 border-[#627254] pl-3 mb-4">
//           <h1 className="text-2xl font-bold text-[#414d38]">Lịch lái thử xe</h1>
//           <p className="text-gray-500 text-base">
//             Theo dõi lịch lái thử xe của bạn
//           </p>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
//         <Input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           prefix={<SearchOutlined className="text-gray-400" />}
//           placeholder="Tìm theo mã lịch hoặc mẫu xe"
//           className="w-full lg:w-80 rounded-full h-10 shadow-sm"
//           allowClear
//         />
//         <DatePicker.RangePicker
//           className="w-full lg:w-auto"
//           onChange={(v) =>
//             setRange((v as [Dayjs | null, Dayjs | null]) || null)
//           }
//         />
//       </div>
//       <div className="mt-4">
//         <div className="overflow-x-auto rounded-2xl shadow-md hover:shadow-lg p-0 transition-all duration-300 ease-out hover:-translate-y-1">
//           <Table
//             bordered
//             className="rounded-2xl overflow-hidden"
//             rowKey="id"
//             dataSource={filtered}
//             columns={columns}
//             pagination={{ pageSize: 5, position: ["bottomRight"] }}
//             scroll={{ x: true }}
//             size="middle"
//           />
//         </div>
//       </div>
//     </CardWrapper>
//   );
// };

// export default ViewSchedulePage;
