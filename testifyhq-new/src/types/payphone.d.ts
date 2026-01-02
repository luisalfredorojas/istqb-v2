// Payphone global type declarations
declare global {
  interface Window {
    PPaymentButtonBox: new (config: PayphoneConfig) => PayphoneButton;
  }
}

export interface PayphoneConfig {
  token: string;
  clientTransactionId: string;
  amount: number;
  amountWithoutTax: number;
  amountWithTax: number;
  tax: number;
  service: number;
  tip: number;
  currency: string;
  storeId: string;
  reference: string;
  responseUrl?: string; // Optional: URL to redirect after payment
  backgroundColor?: string; // Optional
  lang?: string; // Optional: language (es, en)
  defaultMethod?: string; // Optional: card, transfer, etc
  onPayment?: (response: PayphoneResponse) => void; // Optional
  onCancel?: () => void; // Optional
}

export interface PayphoneResponse {
  transactionId: string;
  clientTransactionId: string;
  transactionStatus: 'Approved' | 'Declined' | 'Pending';
  statusCode: number;
  message?: string;
}

export interface PayphoneButton {
  render: (containerId: string) => void;
}

export {};
