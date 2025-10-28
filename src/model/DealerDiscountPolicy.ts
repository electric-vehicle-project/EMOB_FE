export interface IDiscountPolicy {
  id: string;
  customMultiplier: number;
  createAt: string;
  finalPrice: number;
  updateAt: string;
  effectiveDate: string;
  expiryDate: string;
  dealerId: string;
  vehicleId: string;
  status: "UPCOMING" | "ACTIVE" | "EXPIRED" | "INACTIVE";
}
