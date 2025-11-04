/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, message } from "antd";
import { ContractTable } from "../../molecules/contract/ContractTable";
import { useContractDeleteMutation, useContractQueryByCurrentDealer, useContractSignMutation } from "../../../service/contractService";

export const ContractList = () => {

  const { data, isLoading, refetch } = useContractQueryByCurrentDealer({}, {});
  const { mutateAsync: signContract, isPending: signing } = useContractSignMutation();
  const { mutateAsync: cancelContract, isPending: cancelling } = useContractDeleteMutation();

  const contracts = data?.result?.data ?? [];

  const handleSign = async () => {
    try {
      await signContract({
        purchaseDate: new Date().toISOString().split("T")[0],
        paymentStatus: "FULL",
      });
      message.success("Contract signed successfully!");
      refetch();
    } catch {
      message.error("Failed to sign contract");
    }
  };

  const handleCancel = async (record: any) => {
    try {
      await cancelContract(record.contractId);
      message.success("Contract cancelled!");
      refetch();
    } catch {
      message.error("Failed to cancel contract");
    }
  };

  return (
    <Card title="Contract Controller (Dealer Manager)">
      <ContractTable
        data={contracts}
        loading={isLoading || signing || cancelling}
        onView={(r) => {
          setSelectedContract(r);
          setOpenDetail(true);
        }}
        onSign={handleSign}
        onCancel={handleCancel}
      />

    </Card>
  );
};
