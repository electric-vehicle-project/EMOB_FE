import { ButtonLink } from "../components/atoms/BackHomeLink";

import { ErrorTemplate } from "../components/template/ErrorTemplate";

export const NotFoundPage = () => (
  <ErrorTemplate>
    {/* Nội dung căn giữa */}
    <div className="relative flex flex-col items-center justify-center flex-1 overflow-hidden">
      {/* Nền khói */}
      <img
        src="/Frame_27.png"
        alt="Background"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   w-[700px] md:w-[1200px] opacity-80 object-contain"
      />

      {/* Số 404 */}
      <img
        src="/404.png"
        alt="404"
        className="relative z-10 max-w-[60%] h-auto"
      />

      {/* Link */}
      <div className="relative z-10 mt-6">
        <ButtonLink to="/">Quay Về Trang Chủ</ButtonLink>
      </div>
    </div>
  </ErrorTemplate>
);
