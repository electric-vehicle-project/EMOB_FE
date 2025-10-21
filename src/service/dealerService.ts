import api from "../config/api";
import type { IDealer } from "../model/Dealer";

let dealers: IDealer[] = [
  {
    id: "1",
    name: "Dealer A",
    email: "a@mail.com",
    phone: "0123456789",
    address: "Hà Nội",
    status: "Active",
  },
  {
    id: "2",
    name: "Dealer B",
    email: "b@mail.com",
    phone: "0987654321",
    address: "TP.HCM",
    status: "Active",
  },
];

export const dealerService = {
  getDealers: async (): Promise<IDealer[]> => {
    return Promise.resolve(dealers);
  },
  createDealer: async (dealer: IDealer): Promise<void> => {
    dealers.push({ ...dealer, id: Date.now().toString() });
    return Promise.resolve();
  },
  updateDealer: async (dealer: IDealer): Promise<void> => {
    dealers = dealers.map((d) => (d.id === dealer.id ? dealer : d));
    return Promise.resolve();
  },
  deleteDealer: async (id: string): Promise<void> => {
    dealers = dealers.filter((d) => d.id !== id);
    return Promise.resolve();
  },
};

// ⚙️ Wrapper gọi API thật, fallback sang mock khi lỗi
export const getAllDealers = async (): Promise<IDealer[]> => {
  try {
    const res = await api.get("/api/dealer", {
      params: { page: 0, size: 1000 },
    });

    // Dữ liệu dealer trong swagger nằm ở res.data.result.data
    const data = res.data?.result?.data ?? [];

    if (Array.isArray(data) && data.length > 0) {
      return data.map(
        (d: Record<string, unknown>): IDealer => ({
          id: (d.id as string) ?? "",
          name: (d.name as string) ?? "",
          email: (d.contactInfo as string) ?? "",
          phone: "",
          address: (d.country as string) ?? "",
          status: "Active",
        })
      );
    }

    // Nếu không có dealer nào trong DB
    return [];
  } catch {
    console.warn("⚠️ API /api/dealer chưa sẵn sàng, fallback sang mock data.");
    return dealerService.getDealers();
  }
};
