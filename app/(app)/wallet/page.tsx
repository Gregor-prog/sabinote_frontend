"use client";

import { useState } from "react";
import { IconCheck } from "@/components/icons";
import {
  useGetPackagesQuery,
  useGetWalletQuery,
  useGetTransactionsQuery,
  useInitiateTopupMutation,
  useVerifyTopupMutation,
} from "@/lib/services/walletApi";

const PACKAGE_META: Record<string, { label: string; note: string; popular?: boolean; save?: string }> = {
  pkg_50:  { label: "Starter", note: "Try it · 2 full notes" },
  pkg_100: { label: "Popular", note: "Most popular · 5 full notes", popular: true },
  pkg_500: { label: "School",  note: "Best value · 25 full notes", save: "Save 20%" },
};

export default function WalletPage() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const { data: pkgData } = useGetPackagesQuery();
  const { data: walletData } = useGetWalletQuery();
  const { data: txData } = useGetTransactionsQuery({ limit: 20 });
  const [initiateTopup, { isLoading: initiating }] = useInitiateTopupMutation();
  const [verifyTopup] = useVerifyTopupMutation();

  const packages = pkgData?.data?.packages ?? [];
  const balance = walletData?.data?.balance ?? "0";
  const transactions = txData?.data?.transactions ?? [];

  async function handlePurchase() {
    if (selectedIdx === null) return;
    const pkg = packages[selectedIdx];
    try {
      const res = await initiateTopup({ packageId: pkg.id }).unwrap();
      window.open(res.data.authorizationUrl, "_blank");
      const handleFocus = async () => {
        try {
          await verifyTopup({ reference: res.data.reference }).unwrap();
        } finally {
          window.removeEventListener("focus", handleFocus);
        }
      };
      window.addEventListener("focus", handleFocus);
    } catch {
      // RTK handles error state
    }
  }

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAFAFA" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Wallet</p>
      </div>

      {/* Balance card */}
      <div className="mx-5 mb-6 rounded-2xl p-6" style={{ background: "linear-gradient(135deg,#7C3AED 0%,#641BC4 60%,#3B0764 100%)" }}>
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Available Balance</p>
        <p className="font-display font-bold text-white mb-1" style={{ fontSize: "3rem", lineHeight: 1 }}>
          ₽<span>{balance}</span>.00
        </p>
        <p className="text-white/60 text-sm mb-5">
          ≈ {Math.floor(Number(balance) / 20)} complete lesson packages
        </p>
      </div>

      {/* Pick a pack */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Top Up</p>
        <h3 className="font-display font-bold text-gray-900 text-xl mb-4" style={{ letterSpacing: "-0.01em" }}>
          Pick a pack
        </h3>

        <div className="space-y-3">
          {packages.map((pkg, i) => {
            const meta = PACKAGE_META[pkg.id] ?? { label: pkg.id, note: `${pkg.parats} Parats` };
            const selected = selectedIdx === i;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedIdx(selected ? null : i)}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left relative transition-all"
                style={
                  selected
                    ? { background: "white", border: "2px solid #641BC4", boxShadow: "0 4px 16px rgba(100,27,196,0.15)" }
                    : { background: "white", border: "1px solid #E5E7EB" }
                }
              >
                {meta.popular && (
                  <span className="absolute -top-3 right-4 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#F97316" }}>
                    ★ POPULAR
                  </span>
                )}

                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                  style={selected ? { background: "#641BC4" } : { background: "#EDE9FE" }}
                >
                  <span className="font-mono font-bold text-lg leading-none" style={{ color: selected ? "white" : "#641BC4" }}>
                    {pkg.parats}
                  </span>
                  <span className="text-xs font-medium" style={{ color: selected ? "rgba(255,255,255,0.7)" : "#A78BFA" }}>₽</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 text-base">₦{pkg.priceNGN.toLocaleString()}</span>
                    {meta.save && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "#ECFDF5", color: "#10B981" }}>
                        {meta.save}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{meta.note}</span>
                </div>

                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={selected ? { borderColor: "#641BC4", background: "#641BC4" } : { borderColor: "#D1D5DB" }}
                >
                  {selected && <IconCheck className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}

          {packages.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center" style={{ border: "1px solid #E5E7EB" }}>
              <p className="text-gray-400 text-sm">Loading packages...</p>
            </div>
          )}
        </div>

        <button
          onClick={handlePurchase}
          disabled={selectedIdx === null || initiating || packages.length === 0}
          className="w-full py-4 mt-4 rounded-2xl font-semibold text-sm text-white transition-opacity disabled:opacity-40"
          style={{ background: "#641BC4" }}
        >
          {initiating
            ? "Processing..."
            : selectedIdx !== null
            ? `Purchase ₦${packages[selectedIdx].priceNGN.toLocaleString()} Pack`
            : "Select a Pack to Continue"}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Secured by Paystack
        </p>
      </div>

      {/* Transaction history */}
      <div className="px-5 pb-4">
        <h3 className="font-display font-semibold text-gray-900 text-base mb-3">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center" style={{ border: "1px solid #E5E7EB" }}>
            <p className="text-gray-400 text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #E5E7EB" }}>
            {transactions.map((tx, i) => (
              <div
                key={tx.transactionId}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < transactions.length - 1 ? "1px solid #F3F4F6" : undefined }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
                  style={
                    tx.type === "credit"
                      ? { background: "#ECFDF5", color: "#10B981" }
                      : { background: "#FEF2F2", color: "#EF4444" }
                  }
                >
                  {tx.type === "credit" ? "↑" : "↓"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.description ?? tx.purpose}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span
                  className="text-sm font-bold shrink-0"
                  style={{ color: tx.type === "credit" ? "#10B981" : "#EF4444" }}
                >
                  {tx.type === "credit" ? "+" : "−"}₽{tx.type === "credit" ? tx.amountAdded : tx.amountDeducted}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
