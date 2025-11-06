// src/model/Dealer.ts
export type Region = "NORTH" | "CENTRAL" | "SOUTH";

export interface DealerApiModel {
  id: string;
  name: string;
  emailContact: string;
  phoneContact: string;
  country: string;
  address: string;
  createdAt: string;
  region: Region;
}

export interface DealerUpsertPayload {
  name: string;
  emailContact: string;
  phoneContact: string;
  country: string;
  address: string;
  region: Region;
}

/** UI model dùng cho form */
export interface IDealer {
  id?: string;
  name: string;
  emailContact: string;
  phoneContact: string;
  country: string;
  address: string;
  region: Region;
  createdAt?: string;
}
