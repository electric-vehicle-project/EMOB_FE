import { useEffect } from "react";
import { supabase } from "../config/supabase";

export const GoogleCallback = () => {
  useEffect(() => {
    const handleAuth = async () => {
      await supabase.auth.getSession();
      window.opener?.postMessage({ type: "GOOGLE_SIGNED_IN" }, window.location.origin);
      window.close();
    };
    handleAuth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <p className="text-lg text-[var(--primary-color)] font-medium">
        Đang xử lý đăng nhập Google...
      </p>
    </div>
  );
};

export default GoogleCallback;
