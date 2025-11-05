export interface IReport {
  reportId: string;
  title: string;
  description: string;
  type: "FEEDBACK" | "COMPLAINT";
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DELETED";
  customerId: string;
  fullName?: string;
  createdAt: string;
  updatedAt?: string;
  solution?: string;
}
