// import { useState } from "react";
// import { Spin, message, Col, Row, Card } from "antd";

// import { TestDriveCalendar } from "../../components/organisms/test-drive/TestDriveCalendar";
// import { TestDriveFilterBar } from "../../components/organisms/test-drive/TestDriveFilterBar";
// import { TestDriveCreationModal } from "../../components/organisms/test-drive/TestDriveCreationModal";
// import { useGetTestDriveSchedules } from "../../service/testDriveService";
// import { ButtonPrimary } from "../../components/atoms/ButtonPrimary";

// export const TestDriveSchedulePage = () => {
//   const { data, isLoading, refetch } = useGetTestDriveSchedules();
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const schedules = data?.result?.data ?? [];

//   const handleCreated = () => {
//     message.success("Tạo lịch lái thử thành công!");
//     setIsModalOpen(false);
//     refetch();
//   };

//   return (
//     <Card
//       className="h-full flex overflow-hidden justify-center items-center !rounded-2xl shadow-gray-400 shadow-xl"
//     >
//       <Row>
//         <Col span={6}>  <TestDriveFilterBar /> </Col>

//         <Col span={18} >

//           <div className="flex-col pl-5 justify-between">

//             <div className="flex justify-between">
//               <h1 className="text-2xl font-semibold text-primary">Quản lí lịch lái thử</h1>
//               <ButtonPrimary type="primary" onClick={() => setIsModalOpen(true)}>
//                 + Tạo lịch mới
//               </ButtonPrimary>
//             </div>

//             <div>
//               {isLoading ? (
//                 <div className="flex justify-center items-center h-64">
//                   <Spin size="large" />
//                 </div>
//               ) : (
//                 <TestDriveCalendar data={schedules} />
//               )}
//             </div>

//             <TestDriveCreationModal
//               open={isModalOpen}
//               onCancel={() => setIsModalOpen(false)}
//               onCreated={handleCreated}
//             />
//           </div>
//         </Col>
//       </Row >
//     </Card  >

//   );
// };

// export default TestDriveSchedulePage;


import { useState } from "react";
import { Spin, message, Col, Row, Card } from "antd";

import { TestDriveCalendar } from "../../components/organisms/test-drive/TestDriveCalendar";
import { TestDriveFilterBar } from "../../components/organisms/test-drive/TestDriveFilterBar";
import { TestDriveCreationModal } from "../../components/organisms/test-drive/TestDriveCreationModal";
import { useGetTestDriveSchedules } from "../../service/testDriveService";
import { ButtonPrimary } from "../../components/atoms/ButtonPrimary";

export const TestDriveSchedulePage = () => {
  const { data, isLoading, refetch } = useGetTestDriveSchedules();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const schedules = data?.result?.data ?? [];

  const handleCreated = () => {
    message.success("Tạo lịch lái thử thành công!");
    setIsModalOpen(false);
    refetch();
  };

  return (
    <Card className="h-full !rounded-2xl shadow-gray-400 shadow-xl flex items-center"
      style={{ padding: 0 }}
    >
      <Row>
        <Col span={6}> <TestDriveFilterBar /> </Col>

        <Col span={18}>

          <div className="flex flex-col gap-4 pl-5">

            {/* HEADER BAR */}

            <div className="flex justify-between z-10 rounded-xl px-4 py-3">
              <h1 className="text-2xl font-semibold text-primary m-0">
                Quản lí lịch lái thử
              </h1>
              <ButtonPrimary type="primary" onClick={() => setIsModalOpen(true)}>
                + Tạo lịch mới
              </ButtonPrimary>
            </div>

            {/* CALENDAR CONTAINER */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <TestDriveCalendar data={schedules} />
            )}

          </div>

          {/* MODAL giữ nguyên */}
          <TestDriveCreationModal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onCreated={handleCreated}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default TestDriveSchedulePage;
