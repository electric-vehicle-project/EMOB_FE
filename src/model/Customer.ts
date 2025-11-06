// CUSTOMER MODEL

export const MembershipLevel = {
  NORMAL: "NORMAL",
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
} as const;

export type MembershipLevel =
  (typeof MembershipLevel)[keyof typeof MembershipLevel];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const CustomerStatus = {
  LEAD: "LEAD",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED",
} as const;

export type CustomerStatus =
  (typeof CustomerStatus)[keyof typeof CustomerStatus];

export interface ICustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  note?: string;
  dateOfBirth: string; // dạng "YYYY-MM-DD"
  gender: Gender;
  loyaltyPoints: number;
  memberShipLevel: MembershipLevel;
  status: CustomerStatus;
}
