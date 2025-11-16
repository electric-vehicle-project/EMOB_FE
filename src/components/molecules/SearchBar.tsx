// // src/components/molecules/SearchBar.tsx
// import { Input } from "antd";

// interface Props {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
// }

// export const SearchBar = ({ value, onChange, placeholder, className }: Props) => {
//   return (
//     <Input
//       value={value}
//       placeholder={placeholder || "Tìm kiếm..."}
//       onChange={(e) => onChange(e.target.value)}
//       allowClear
//       className={`transition-all duration-200 focus-glow-primary ${className || ""}`}
//     />
//   );
// };

// src/components/molecules/SearchBar.tsx
import { Input } from "antd";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: number | string; // thêm width
}

export const SearchBar = ({
  value,
  onChange,
  placeholder,
  className,
  width = 320, // mặc định 320px
}: Props) => {
  return (
    <Input
      value={value}
      allowClear
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Tìm kiếm..."}
      className={`          /* chiều cao chuẩn */
        rounded-md
        border border-gray-300
        shadow-sm
        px-3 py-2
        text-[14px]

        transition-all duration-200
        focus:border-green-600
        focus:ring-1 focus:ring-green-600

        ${className || ""}
      `}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
      }}
    />
  );
};
