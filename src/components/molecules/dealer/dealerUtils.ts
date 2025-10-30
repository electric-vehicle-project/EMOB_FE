// Utils chuẩn hóa & so sánh để dùng chung

export interface DealerFormValues {
  name: string;
  contactInfo: string;
  country: string;
  address: string;
}

export const trimEdges = (s: string) => (s ?? "").replace(/^\s+|\s+$/g, "");
export const stripPhone = (s: string) => (s ?? "").replace(/[^\d+]/g, "");

export const toLocalPhone = (s: string) => {
  const raw = stripPhone(s);
  if (raw.startsWith("+84")) return `0${raw.slice(3)}`;
  return raw;
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeDealerValues(
  values: Partial<DealerFormValues> = {}
): DealerFormValues {
  const name = trimEdges(values.name || "");
  const country = trimEdges(values.country || "");
  const address = trimEdges(values.address || "");
  const rawContact = trimEdges(values.contactInfo || "");
  const contactInfo = emailRegex.test(rawContact.toLowerCase())
    ? rawContact.toLowerCase()
    : toLocalPhone(rawContact);
  return { name, country, address, contactInfo };
}

export function isSameDealerValues(
  a: DealerFormValues,
  b: DealerFormValues
): boolean {
  return (
    a.name === b.name &&
    a.country === b.country &&
    a.address === b.address &&
    a.contactInfo === b.contactInfo
  );
}
