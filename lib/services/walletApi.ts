import { baseApi } from "./baseApi";
import type { Wallet, Transaction, Pagination } from "../types";

export interface WalletPackage {
  id: string;
  parats: number;
  priceNGN: number;
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPackages: build.query<
      { success: boolean; data: { packages: WalletPackage[] } },
      void
    >({
      query: () => "/wallet/packages",
    }),

    getWallet: build.query<{ success: boolean; data: Wallet }, void>({
      query: () => "/wallet",
      providesTags: ["Wallet"],
    }),

    getTransactions: build.query<
      {
        success: boolean;
        data: { transactions: Transaction[]; pagination: Pagination };
      },
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/wallet/transactions", params }),
      providesTags: ["Transactions"],
    }),

    // TODO: TEMPORARY - Manual topup endpoint for testing without Paystack
    // Remove this and uncomment the Paystack flow below when ready to use real payments
    manualTopup: build.mutation<
      { success: boolean; data: { credited: boolean; message: string } },
      { packageId: string }
    >({
      query: (body) => ({ url: "/wallet/topup/manual", method: "POST", body }),
      invalidatesTags: ["Wallet", "Transactions"],
    }),

    // TODO: TEMPORARY - Paystack flow commented out
    // Uncomment these when removing manual topup endpoint
    // initiateTopup: build.mutation<
    //   {
    //     success: boolean
    //     data: {
    //       authorizationUrl: string
    //       reference: string
    //       transactionId: string
    //       package: WalletPackage
    //     }
    //   },
    //   { packageId: string }
    // >({
    //   query: (body) => ({ url: '/wallet/topup/initiate', method: 'POST', body }),
    // }),

    // verifyTopup: build.mutation<
    //   { success: boolean; data: { credited: boolean; reference: string } },
    //   { reference: string }
    // >({
    //   query: (body) => ({ url: '/wallet/topup/verify', method: 'POST', body }),
    //   invalidatesTags: ['Wallet', 'Transactions'],
    // }),
  }),
  overrideExisting: false,
});

export const {
  useGetPackagesQuery,
  useGetWalletQuery,
  useGetTransactionsQuery,
  useManualTopupMutation,
  // TODO: TEMPORARY - Use these when switching back to Paystack
  // useInitiateTopupMutation,
  // useVerifyTopupMutation,
} = walletApi;
