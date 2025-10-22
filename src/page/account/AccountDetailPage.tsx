// src/page/account/AccountDetailPage.tsx
import { Card, Descriptions, Tag, Avatar, Button, Space } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAccountById } from "../../service/accountService";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { AccountStatus, Gender } from "../../model/Account";
import dayjs from "dayjs";

export const AccountDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetAccountById(id);
  const account = data?.result ?? null;

  return (
    <Card
      loading={isLoading}
      title={
        <Space>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <span>Account Detail</span>
        </Space>
      }
    >
      {account && (
        <div className="flex flex-col items-center mb-6">
          <Avatar
            size={100}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#87d068",
              marginBottom: "1rem",
            }}
          />
          <h2 className="text-xl font-semibold">{account.fullName}</h2>
          <Tag
            color={account.status === AccountStatus.ACTIVE ? "green" : "red"}
          >
            {account.status}
          </Tag>
        </div>
      )}

      {account && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Full Name">
            {account.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{account.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{account.phone}</Descriptions.Item>
          <Descriptions.Item label="Role">{account.role}</Descriptions.Item>
          <Descriptions.Item label="Gender">
            {account.gender === Gender.UNKNOWN
              ? "Unknown"
              : account.gender.charAt(0) +
                account.gender.slice(1).toLowerCase()}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {dayjs(account.dateOfBirth).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {account.address}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};
