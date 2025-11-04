// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Input, Select, Button, Space } from "antd";
// import { useState } from "react";

// interface Props {
//   onFilter: (filters: any) => void;
// }

// export const ContractFilter = ({ onFilter }: Props) => {
//   const [keyword, setKeyword] = useState("");
//   const [statuses, setStatuses] = useState<string[]>([]);
//   return (
//     <Space wrap>
//       <Input.Search
//         placeholder="Search by customer name or code"
//         allowClear
//         value={keyword}
//         onChange={(e) => setKeyword(e.target.value)}
//         onSearch={() => onFilter({ keyword, statuses })}
//         style={{ width: 240 }}
//       />

//       <Select
//         mode="multiple"
//         allowClear
//         placeholder="Select statuses"
//         value={statuses}
//         onChange={(v) => setStatuses(v)}
//         options={[
//           { value: "PENDING", label: "Pending" },
//           { value: "SIGNED", label: "Signed" },
//           { value: "TERMINATED", label: "Terminated" },
//         ]}
//         style={{ width: 220 }}
//       />

//       <Button type="primary" onClick={() => onFilter({ keyword, statuses })}>
//         Apply
//       </Button>
//     </Space>
//   );
// };
