declare module '@paystack/inline-js' {
  interface TransactionOptions {
    key: string;
    email: string;
    amount: number;
    reference?: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: { id: number; reference: string; message: string }) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
    onLoad?: (data: { id: number; customer: object; accessCode: string }) => void;
  }

  class PaystackPop {
    newTransaction(options: TransactionOptions): void;
    isLoaded(): boolean;
    cancelTransaction(): void;
  }

  export default PaystackPop;
}
