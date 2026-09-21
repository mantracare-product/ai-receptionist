"use client";

import ReceptionSettingsTab from "@/components/reception/ReceptionSettingsTab";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Reception & Kiosk Configuration
          </h1>
          <p className="text-sm text-slate-500">
            Manage Aria AI avatar, clinic flow, and front desk devices
          </p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <ReceptionSettingsTab />
      </div>
    </div>
  );
}
