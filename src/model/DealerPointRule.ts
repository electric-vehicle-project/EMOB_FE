export const MembershipLevel = {
  NORMAL: "NORMAL",
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
} as const;

export type MembershipLevel =
  (typeof MembershipLevel)[keyof typeof MembershipLevel];

export interface IDealerPointRule {
  membershipLevel: MembershipLevel;
  dealerId: string;
  minPoints: number;
  price: number;
}

export interface DealerPointRuleRequest {
  level: MembershipLevel;
  dealerId: string;
  minPoints: number;
  price: number;
}
