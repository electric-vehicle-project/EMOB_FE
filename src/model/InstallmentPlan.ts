// src/model/InstallmentPlan.ts
export type InstallmentPlanStatus =
  | "PAID"
  | "PENDING"
  | "OVERDUE"
  | "CANCELLED";

export interface InstallmentPlanApiModel {
  id: string;
  downDate: string;
  deposit: number;
  totalAmount: number;
  monthlyAmount: number;
  interestRate: number;
  termMonths: number;
  nextDueDate: string;
  status: InstallmentPlanStatus;
}

/** UI model dùng cho hiển thị */
export interface IInstallmentPlan {
  id: string;
  downDate: string;
  deposit: number;
  totalAmount: number;
  monthlyAmount: number;
  interestRate: number;
  termMonths: number;
  nextDueDate: string;
  status: InstallmentPlanStatus;
}
