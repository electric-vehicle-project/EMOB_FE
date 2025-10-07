import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { UserState } from "../redux/features/userSlice";

export const useCurrentUser = (): UserState => {
  const user = useSelector((state: RootState) => state.user);
  return user;
};
