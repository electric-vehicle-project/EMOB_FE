import api from "../config/api";

export interface AccountProfile {
  accountID: string;
  role: string;
  email: string;
  phone: string;
  fullName: string;
  gender: "Male" | "Female" | "Other" | string;
  address: string;
  dateOfBirth: string; // ISO string
  status: "Active" | "Inactive" | string;
}

// Mock profile để hiển thị dữ liệu trên giao diện khi API backend chưa sẵn sàng
let mockProfile: AccountProfile = {
  accountID: "acc-EMOB-0001",
  role: "Customer",
  email: "khachhang.emob@example.com",
  phone: "0901 234 567",
  fullName: "Nguyễn Văn A",
  gender: "Male",
  address: "Số 123, Đường Hoa Sen, Quận 7, TP. Hồ Chí Minh",
  dateOfBirth: "1995-06-15",
  status: "Active",
};

export const accountService = {
  async getAccountProfile(): Promise<AccountProfile> {
    try {
      const res = await api.get("/Account/profile");
      return (res?.data as AccountProfile) || mockProfile;
    } catch {
      return mockProfile;
    }
  },
  async updateAccountProfile(data: Partial<AccountProfile>): Promise<AccountProfile> {
    try {
      const res = await api.put("/Account/profile", data);
      return (res?.data as AccountProfile) || { ...(mockProfile = { ...mockProfile, ...data }) };
    } catch {
      mockProfile = { ...mockProfile, ...data } as AccountProfile;
      return mockProfile;
    }
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean }> {
    try {
      const res = await api.put("/Account/change-password", { currentPassword, newPassword });
      return (res?.data as { ok: boolean }) || { ok: true };
    } catch {
      // Mock: coi như thay đổi mật khẩu luôn thành công để test UI
      return { ok: true };
    }
  },
};

