import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export const useCurrentUser = (): RootState["user"] => {
  const user = useSelector((state: RootState) => state.user);
  return user;
};
