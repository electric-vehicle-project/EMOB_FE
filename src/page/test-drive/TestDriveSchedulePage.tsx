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


    <Card
      className="h-full flex overflow-hidden justify-center items-center !rounded-2xl shadow-2xl"
    >
      <Row className="flex justify-between pb-">
        <h1 className="text-2xl font-semibold text-primary">Quản lí lịch lái thử</h1>
        <ButtonPrimary type="primary" onClick={() => setIsModalOpen(true)}>
          + Tạo lịch mới
        </ButtonPrimary>
      </Row>


      <Row className="flex-col items-end">
        <Col span={6}>  <TestDriveFilterBar /> </Col>
        <Col span={18} className="pl-5">


          <div className="flex-col items-center ">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <TestDriveCalendar data={schedules} />
            )}
          </div>

          <TestDriveCreationModal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onCreated={handleCreated}
          />
        </Col>

      </Row >
    </Card  >

  );
};

export default TestDriveSchedulePage;
