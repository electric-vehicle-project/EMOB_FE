interface SelectBoxProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export default function SelectBox({
  value,
  onChange,
  options,
}: SelectBoxProps) {
  return (
    <select
      className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:shadow focus:outline-none"
      value={value}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}
