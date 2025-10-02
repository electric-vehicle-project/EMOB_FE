// src/model/Dealer.ts
export interface IDealer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Inactive";
}
