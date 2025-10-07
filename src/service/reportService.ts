import type { IReport } from "../model/report";

const LS_KEY = "emob_reports";

// Fallback tạo UUID nếu môi trường không có crypto.randomUUID
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "rpt-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const seed: IReport[] = [
  {
    reportID: uid(),
    title: "Lỗi treo màn hình khi đặt lịch lái thử",
    description: "Nhấn Xác nhận thì đứng ~5s.",
    reportType: "SystemBug",
    status: "Pending",
    reportBy: { name: "Nguyễn Văn A", email: "vana@gmail.com" },
    createAt: new Date().toISOString().slice(0, 10),
  },
  {
    reportID: uid(),
    title: "Cải thiện UX trang quản lý đại lý",
    description: "Nút trên mobile hơi nhỏ, nên tăng hit area.",
    reportType: "Suggestion",
    status: "InReview",
    reportBy: { name: "Trần Thị B" },
    createAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  },
];

function load(): IReport[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(seed));
    return [...seed];
  }
  try {
    return JSON.parse(raw) as IReport[];
  } catch {
    localStorage.setItem(LS_KEY, JSON.stringify(seed));
    return [...seed];
  }
}

function save(data: IReport[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export const reportService = {
  async getReports(): Promise<IReport[]> {
    return load();
  },

  async createReport(payload: Omit<IReport, "reportID" | "createAt" | "status"> & { status?: IReport["status"] }): Promise<IReport> {
    const data = load();
    const item: IReport = {
      reportID: uid(),
      createAt: new Date().toISOString().slice(0, 10),
      status: payload.status ?? "Pending",
      ...payload,
    };
    data.unshift(item);
    save(data);
    return item;
  },

  async updateReport(updated: IReport): Promise<void> {
    const data = load().map((r) => (r.reportID === updated.reportID ? { ...updated } : r));
    save(data);
  },

  async deleteReport(reportID: string): Promise<void> {
    const data = load().filter((r) => r.reportID !== reportID);
    save(data);
  },
};
