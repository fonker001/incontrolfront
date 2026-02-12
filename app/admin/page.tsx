"use client";

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default function AdminIndex() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border">
          {/* Accent header */}
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-600" />

          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Shield className="h-7 w-7" />
            </div>

            <h1 className="text-3xl font-semibold text-emerald-900">
              Admin Console
            </h1>
            <p className="mt-2 text-gray-600">
              Incontrol-lite
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/admin/dashboard/overview"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white shadow hover:bg-emerald-800 transition"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Restricted access · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
