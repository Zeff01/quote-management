"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function QuoteSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Quote Sent Successfully!</h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The recipient will receive an email with the quote details and
            response options.
          </p>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium hover:from-blue-600 hover:to-teal-500 transition-all"
            >
              View Dashboard
            </Link>

            <Link
              href="/quotes/new"
              className="block w-full px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Send Another Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
