"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyTopupMutation } from "@/lib/services/walletApi";

type Status = "verifying" | "success" | "failed";

export default function WalletCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifyTopup] = useVerifyTopupMutation();
  const [status, setStatus] = useState<Status>("verifying");
  const [parats, setParats] = useState<number | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // Guard against double-fire in React strict mode
    if (ran.current) return;
    ran.current = true;

    // Paystack appends ?reference=xxx&trxref=xxx to the callback URL
    const reference =
      searchParams.get("reference") ??
      searchParams.get("trxref") ??
      sessionStorage.getItem("paystack_ref");

    if (!reference) {
      setStatus("failed");
      return;
    }

    sessionStorage.removeItem("paystack_ref");

    verifyTopup({ reference })
      .unwrap()
      .then(() => {
        // Pull parats from the reference string: sabi_{timestamp}_{userId}
        // The amount is returned by the backend but RTK only exposes { credited, reference }
        // We'll show a generic success message
        setStatus("success");
        setTimeout(() => router.replace("/wallet"), 2500);
      })
      .catch(() => {
        setStatus("failed");
      });
  }, [searchParams, verifyTopup, router]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: "var(--color-surface)" }}
    >
      {status === "verifying" && (
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Spinner */}
          <div
            className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "oklch(40% 0.22 290)", borderTopColor: "transparent" }}
          />
          <p className="font-semibold text-gray-900" style={{ fontSize: "1.1rem" }}>
            Confirming your payment…
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            This only takes a moment.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#ECFDF5" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
              Payment successful!
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Your Parats have been added to your wallet.
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Redirecting you back…
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#FEF2F2" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900" style={{ fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
              Payment not confirmed
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              If your money left your account, don't worry — it will be credited automatically within a few minutes via our webhook.
            </p>
          </div>
          <button
            onClick={() => router.replace("/wallet")}
            className="mt-2 px-6 py-3 rounded-2xl font-semibold text-sm text-white"
            style={{ background: "oklch(40% 0.22 290)" }}
          >
            Back to wallet
          </button>
        </div>
      )}
    </div>
  );
}
