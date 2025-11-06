// src/components/molecules/dealer/dealerUtils.ts
import type { DealerUpsertPayload } from "../../../model/Dealer";

export type Region = "NORTH" | "CENTRAL" | "SOUTH";

export interface DealerFormValues {
  name: string;
  emailContact: string;
  phoneContact: string;
  country: string;
  address: string;
  region: Region;
}

export const trimEdges = (s: string) => (s ?? "").replace(/^\s+|\s+$/g, "");

export function normalizeDealerValues(
  values: Partial<DealerFormValues> = {}
): DealerFormValues {
  const name = trimEdges(values.name || "");
  const emailContact = trimEdges(values.emailContact || "");
  const phoneContact = trimEdges(values.phoneContact || "");
  const country = trimEdges(values.country || "");
  const address = trimEdges(values.address || "");
  const region = (values.region || "NORTH") as Region;
  return { name, emailContact, phoneContact, country, address, region };
}

export function isSameDealerValues(
  a: DealerFormValues,
  b: DealerFormValues
): boolean {
  return (
    a.name === b.name &&
    a.emailContact === b.emailContact &&
    a.phoneContact === b.phoneContact &&
    a.country === b.country &&
    a.address === b.address &&
    a.region === b.region
  );
}

export function buildDealerPayloadFromForm(
  values: DealerFormValues
): DealerUpsertPayload {
  const n = normalizeDealerValues(values);
  return {
    name: n.name || "-",
    emailContact: n.emailContact || "",
    phoneContact: n.phoneContact || "",
    country: n.country || "-",
    address: n.address || "-",
    region: (n.region || "NORTH") as Region,
  };
}
