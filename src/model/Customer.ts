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
  customerID: string;
  note?: string;
  membershipLevel: MembershipLevel;
  loyaltyPoints: number;
  email: string;
  phone: string;
  fullName: string;
  gender: Gender;
  address: string;
  dateOfBirth: string; // YYYY-MM-DD
  status: CustomerStatus;
}
