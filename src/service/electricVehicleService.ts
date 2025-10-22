import api from "../config/api";

export interface IElectricVehicle {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  batteryCapacity?: number;
  status?: string;
}

// Mock nhẹ để dev offline / DB trống vẫn chạy
const mockEVs: IElectricVehicle[] = [
  {
    id: "1",
    name: "E-Car Alpha",
    brand: "VinFast",
    model: "VF e34",
    batteryCapacity: 42,
    status: "Available",
  },
  {
    id: "2",
    name: "E-Car Beta",
    brand: "Tesla",
    model: "Model 3",
    batteryCapacity: 60,
    status: "Available",
  },
];

// Gọi API thật, fallback sang mock nếu lỗi hoặc DB rỗng
export const getAllElectricVehicles = async (): Promise<IElectricVehicle[]> => {
  try {
    const res = await api.get("/api/vehicle");
    // giữ đúng format swagger của team: res.data?.result?.data
    const data = res.data?.result?.data ?? [];
    if (Array.isArray(data) && data.length > 0) {
      return data.map((v: Record<string, unknown>) => ({
        id: (v.id as string) ?? "",
        name: (v.name as string) ?? "",
        brand: (v.brand as string) ?? undefined,
        model: (v.model as string) ?? undefined,
        batteryCapacity: Number(v.batteryCapacity ?? 0) || undefined,
        status: (v.status as string) ?? undefined,
      }));
    }
    return []; // DB chưa có EV -> trả mảng rỗng (an toàn)
  } catch {
    console.warn("⚠️ /api/vehicle chưa sẵn sàng → dùng mock EV.");
    return mockEVs;
  }
};
