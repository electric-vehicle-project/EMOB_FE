import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export const useCurrentUser = () => {
  const user = useSelector((state: RootState) => state.user);
  return user;
};
