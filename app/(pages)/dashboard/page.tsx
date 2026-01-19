// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.email}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Account Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Account Type:</span>
                  <p className="text-gray-900 capitalize">
                    {user.accountType || "FREE"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">User ID:</span>
                  <p className="text-gray-900 font-mono text-xs">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/downloads"
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Download App
                </a>
                <button className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                  View Usage
                </button>
                <button className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                  Settings
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Account Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">App Ready</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">
                    Updates Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
