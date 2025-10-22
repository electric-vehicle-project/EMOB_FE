// REPORT MODEL

// ========== Type & Status ==========
export const ReportType = {
  FEEDBACK: "FEEDBACK",
  COMPLAINT: "COMPLAINT",
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const ReportStatus = {
  PENDING: "PENDING",
  DELETED: "DELETED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

// ========== ReportCustomer ==========
export interface ReportCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  note?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  status?: string;
  loyaltyPoints?: number;
  memberShipLevel?: string;
}

// ========== Main entity ==========
export interface IReport {
  reportId: string;
  accountId: string;
  title: string;
  description: string;
  type: ReportType;
  status: ReportStatus;
  reportBy: ReportCustomer;
  createdAt?: string;
  updatedAt?: string;
}

// ========== DTOs ==========
export interface IReportCreate {
  accountId: string;
  customerId: string;
  title: string;
  description: string;
  status?: ReportStatus;
  type?: ReportType;
}

export interface IReportUpdate {
  title?: string;
  description?: string;
  status?: ReportStatus;
  type?: ReportType;
}

// ========== API Response ==========
export interface IReportResponse {
  code: number;
  message: string;
  result?: IReport;
  data?: IReport[];
}
