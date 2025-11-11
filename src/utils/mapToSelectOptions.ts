// ==========================================================
// Generic mapper

import type { IAccount } from "../model/Account";

// ==========================================================
export function mapToSelectOptions<T extends object>(
  data: T[] | undefined,
  labelKey: keyof T,
  valueKey: keyof T
): { label: string; value: string }[] {
  if (!data) return [];
  return data.map((item) => ({
    label: String(item[labelKey]),
    value: String(item[valueKey]),
  }));
}

// ==========================================================
// Common type guards
// ==========================================================
function hasResultArray<T>(obj: unknown): obj is { result?: { data?: T[] } } {
  return typeof obj === "object" && obj !== null && "result" in obj;
}

function hasResultList<T>(obj: unknown): obj is { result?: T[] } {
  return typeof obj === "object" && obj !== null && "result" in obj;
}

// ==========================================================
// Dealer
// ==========================================================
interface Dealer extends Record<string, unknown> {
  id: string;
  name: string;
}

export const mapDealerOptions = (
  dealersData?:
    | { result?: { data?: Dealer[] } }
    | { result?: Dealer[] }
    | Dealer[]
): { label: string; value: string }[] => {
  let dealers: Dealer[] = [];

  if (hasResultArray<Dealer>(dealersData)) {
    dealers = dealersData.result?.data ?? [];
  } else if (hasResultList<Dealer>(dealersData)) {
    dealers = dealersData.result ?? [];
  } else if (Array.isArray(dealersData)) {
    dealers = dealersData;
  }

  return mapToSelectOptions(dealers, "name", "id");
};

// ==========================================================
// Vehicle
// ==========================================================
interface Vehicle extends Record<string, unknown> {
  id: string;
  brand: string;
  model: string;
}

export const mapVehicleOptions = (
  vehiclesData?:
    | { result?: { data?: Vehicle[] } }
    | { result?: Vehicle[] }
    | Vehicle[]
): { label: string; value: string }[] => {
  let vehicles: Vehicle[] = [];

  if (hasResultArray<Vehicle>(vehiclesData)) {
    vehicles = vehiclesData.result?.data ?? [];
  } else if (hasResultList<Vehicle>(vehiclesData)) {
    vehicles = vehiclesData.result ?? [];
  } else if (Array.isArray(vehiclesData)) {
    vehicles = vehiclesData;
  }

  return vehicles.map((v) => ({
    label: `${v.brand} ${v.model}`,
    value: v.id,
  }));
};

// ==========================================================
// Customer
// ==========================================================
interface Customer extends Record<string, unknown> {
  id: string;
  fullName: string;
}

export const mapCustomerOptions = (
  customersData?:
    | { result?: { data?: Customer[] } }
    | { result?: Customer[] }
    | Customer[]
): { label: string; value: string }[] => {
  let customers: Customer[] = [];

  if (hasResultArray<Customer>(customersData)) {
    customers = customersData.result?.data ?? [];
  } else if (hasResultList<Customer>(customersData)) {
    customers = customersData.result ?? [];
  } else if (Array.isArray(customersData)) {
    customers = customersData;
  }

  return mapToSelectOptions(customers, "fullName", "id");
};

// ==========================================================
// Promotion
// ==========================================================
interface PromotionBasic extends Record<string, unknown> {
  id: string;
  name: string;
}

export const mapPromotionOptions = (
  promotionsData?:
    | { result?: { data?: PromotionBasic[] } }
    | { result?: PromotionBasic[] }
    | PromotionBasic[]
): { label: string; value: string }[] => {
  let promotions: PromotionBasic[] = [];

  if (hasResultArray<PromotionBasic>(promotionsData)) {
    promotions = promotionsData.result?.data ?? [];
  } else if (hasResultList<PromotionBasic>(promotionsData)) {
    promotions = promotionsData.result ?? [];
  } else if (Array.isArray(promotionsData)) {
    promotions = promotionsData;
  }

  return mapToSelectOptions(promotions, "name", "id");
};

export const mapDealerOptionsFromAccounts = (accounts: IAccount[]) =>
  accounts.map((a) => ({
    label: a.fullName || a.email || "Tên không xác định",
    value: a.id,
  }));
