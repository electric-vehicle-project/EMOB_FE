import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { IAccount } from "../model/Account";

export const useCurrentUser = (): IAccount | null => {
  const user = useSelector((state: RootState) => state.user);
  return user;
};
