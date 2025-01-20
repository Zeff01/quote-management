import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, Check, PieChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="py-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              QuoteFlow
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors dark:bg-white dark:text-black"
            >
              Dashboard
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              Quote Management Made Simple
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Streamline your quote process with real-time updates and seamless
              client interaction
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mb-4">
                <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Quotes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Send professional quote confirmations directly to your clients
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mb-4">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Response</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Clients can easily accept or deny quotes with a single click
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mb-4">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Real-time Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track quote statuses instantly with our live dashboard
              </p>
            </div>

            <Link
              href="/quotes/new"
              className="p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-lg hover:shadow-xl transition-all group"
            >
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                Send a Quote
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p>Get started by sending your first quote now</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
