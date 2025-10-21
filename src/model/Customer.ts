export const MembershipLevel = {
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
} as const;

export type MembershipLevel =
  (typeof MembershipLevel)[keyof typeof MembershipLevel];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const CustomerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
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
  dateOfBirth: string; // hoặc Date nếu bạn xử lý qua dayjs
  gender: "MALE" | "FEMALE";
  loyaltyPoints: number;
  memberShipLevel: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  status?: "ACTIVE" | "INACTIVE" | "BANNED";
}
