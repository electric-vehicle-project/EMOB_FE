import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// sau dau : là để khai báo kiểu dữ liệu  ( kiểu null nếu chưa login | kiểu User nếu đã login)
export interface UserState {
  role?: string;
  [key: string]: unknown;
}

type UserSliceState = UserState;

const initialState: UserSliceState = {};

export const userSlice = createSlice({
  name: "user",
  initialState, //initialState : initialState, : viết tắt khi tên field và tên biến trùng nhau
  reducers: {
    login: (_, action: PayloadAction<UserState>) => ({ ...action.payload }),
    logout: () => ({}),
  },
});
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
