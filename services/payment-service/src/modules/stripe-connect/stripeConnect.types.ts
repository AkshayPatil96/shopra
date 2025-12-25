export interface StripeConnectResultDTO {
  accountId?: string;
  onboardingUrl: string;
  status: "pending" | "connected";
  alreadyConnected?: boolean;
  usedCache?: boolean;
}

export interface StripeConnectResponse {
  success: boolean;
  data: StripeConnectResultDTO;
  message: string;
}
