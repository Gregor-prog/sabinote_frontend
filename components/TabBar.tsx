"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconLibrary, IconBolt, IconWallet, IconUser } from "./icons";

const tabs = [
  { href: "/dashboard", label: "Home", icon: IconHome },
  { href: "/notes", label: "Library", icon: IconLibrary },
  { href: "/generate", label: "", icon: IconBolt, isCenter: true },
  { href: "/wallet", label: "Wallet", icon: IconWallet },
  { href: "/settings", label: "You", icon: IconUser },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center -mt-5"
              >
                <span
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-brand"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg,#7C3AED,#641BC4)"
                      : "linear-gradient(135deg,#7C3AED,#641BC4)",
                    boxShadow: "0 4px 20px rgba(100,27,196,0.4)",
                  }}
                >
                  <tab.icon className="w-6 h-6" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[48px]"
            >
              <span
                className={`transition-colors duration-150 ${
                  isActive ? "text-brand-600" : "text-gray-400"
                }`}
              >
                <tab.icon />
              </span>
              <span
                className={`text-[10px] font-medium transition-colors duration-150 ${
                  isActive ? "text-brand-600" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
