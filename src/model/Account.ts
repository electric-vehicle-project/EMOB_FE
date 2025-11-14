// src/model/Account.ts

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
} as const;

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  UNKNOWN: "UNKNOWN",
} as const;

export const Role = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  DEALER_STAFF: "DEALER_STAFF",
  EVM_STAFF: "EVM_STAFF",
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
export type Gender = (typeof Gender)[keyof typeof Gender];
export type Role = (typeof Role)[keyof typeof Role];

export interface IAccount {
  id: string;
  dealerId?: string;
  fullName: string;
  gender: Gender;
  status: AccountStatus;
  address: string;
  dateOfBirth: string;
  role: Role;
  phone: string;
  email: string;
  token?: string;
  refreshToken?: string;

  createdAt?: string;
}

export interface AccountResponse {
  code: number;
  message: string;
  result: {
    data: IAccount[];
    metadata: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      last: boolean;
    };
  };
}
