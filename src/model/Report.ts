// Kiểu & enum cho Report (theo ERD)
export type ReportType = "Complaint" | "Suggestion" | "SystemBug" | "ServiceFeedback";
export type ReportStatus = "Pending" | "InReview" | "Resolved" | "Rejected";

export interface CustomerInfo {
  name: string;
  email?: string;
  phone?: string;
}

export interface IReport {
  reportID: string;        // UUID
  title: string;
  description: string;
  reportType: ReportType;
  status: ReportStatus;
  reportBy: CustomerInfo;  // object
  createAt: string;        // ISO date (yyyy-MM-dd)
}
