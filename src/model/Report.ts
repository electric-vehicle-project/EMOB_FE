export interface IReport {
  reportId: string;
  vehicleUnitId?: string | null;

  title: string;
  description: string;

  type: "FEEDBACK" | "COMPLAINT" | "DAMAGE" | "MAINTENANCE" | "PERFORMANCE";

  status: "PENDING" | "DELETED" | "IN_PROGRESS" | "RESOLVED";

  customerId: string;
  fullName?: string;

  createdAt: string;
  updatedAt?: string;
  solution?: string;
}
