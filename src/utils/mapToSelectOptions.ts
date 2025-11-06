export function mapToSelectOptions<T>(
  data: T[] | undefined,
  labelKey: keyof T,
  valueKey: keyof T
) {
  if (!data) return [];
  return data.map((item) => ({
    label: String(item[labelKey]),
    value: String(item[valueKey]),
  }));
}

// ==========================================================
// ENTITY-SPECIFIC MAPPERS
// ==========================================================

// ========== Dealer ==========
export const mapDealerOptions = (
  dealersData: any
): { label: string; value: string }[] => {
  const dealers =
    dealersData?.result?.data ?? dealersData?.result ?? dealersData ?? [];
  return mapToSelectOptions(dealers, "name", "id");
};

// ========== Vehicle ==========
export const mapVehicleOptions = (
  vehiclesData: any
): { label: string; value: string }[] => {
  const vehicles =
    vehiclesData?.result?.data ?? vehiclesData?.result ?? vehiclesData ?? [];
  return vehicles.map((v: { id: string; brand: string; model: string }) => ({
    label: `${v.brand} ${v.model}`, // ví dụ: "VinFast VF8"
    value: v.id,
  }));
};

// ========== Customer ==========
export const mapCustomerOptions = (
  customersData: any
): { label: string; value: string }[] => {
  const customers =
    customersData?.result?.data ?? customersData?.result ?? customersData ?? [];
  return mapToSelectOptions(customers, "fullName", "id");
};

// ========== Promotion ==========
export const mapPromotionOptions = (
  promotionsData: any
): { label: string; value: string }[] => {
  const promotions =
    promotionsData?.result?.data ??
    promotionsData?.result ??
    promotionsData ??
    [];
  return mapToSelectOptions(promotions, "name", "id");
};
