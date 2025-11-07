import { useEffect } from "react";
import { supabase } from "../config/supabase";

export const GoogleCallback = () => {
  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      window.opener?.postMessage(
        { access_token: data.session?.access_token },
        window.location.origin
      );
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
