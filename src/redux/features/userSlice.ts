import {
  createSlice,
  type PayloadAction,
  type SliceSelectors,
} from "@reduxjs/toolkit";
import type { IAccount } from "../../model/Account";

const initialState: IAccount | null = null;

export const userSlice = createSlice<
  IAccount | null,
  {
    login: (
      _state: IAccount | null,
      action: PayloadAction<IAccount>
    ) => IAccount | null;
    logout: (_state: IAccount | null) => null;
  },
  "user",
  SliceSelectors<IAccount | null>
>({
  name: "user",
  initialState,
  reducers: {
    login: (_state, action) => action.payload,
    logout: () => null,
  },
});
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
