export interface ITestDrive {
  id: number;
  customer: string;     // Tên khách hàng
  car: string;          // Tên xe
  date: string;         // Ngày (ISO string)
  duration: number;     // Thời lượng (phút)
  status: "Pending" | "Completed" | "Cancelled"; 
}
