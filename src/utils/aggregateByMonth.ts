/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DealerApiItem } from "../model/Overview";

export const sumBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T
): number => arr.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

export const aggregateByMonth = (rows: DealerApiItem[], months: number[]) => {
  const byMonth = months.map((m) => ({
    month: m,
    revenue: 0,
    contracts: 0,
    vehicles: 0,
  }));

  rows.forEach((r) => {
    const i = months.indexOf(r.month);
    if (i >= 0) {
      byMonth[i].revenue += r.totalRevenue;
      byMonth[i].contracts += r.totalContracts;
      byMonth[i].vehicles += r.totalVehiclesSold;
    }
  });

  return byMonth;
};
