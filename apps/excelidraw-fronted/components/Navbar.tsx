"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="w-full bg-slate-800/30 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-bold text-white">Canvas</h1>
          </div>

          <button
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/signin");
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
