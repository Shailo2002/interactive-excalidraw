"use client";
import Navbar from "@/components/Navbar";
import { HTTP_BACKEND } from "@/config";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const [slug, setSlug] = useState("");
  const [rooms, setRooms] = useState<{ slug: string; id: string }[]>([]);
  const router = useRouter();

  const createRoom = async () => {
    try {
      const slug = uuidv4().split("-")[0];
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${HTTP_BACKEND}/room`,
        { slug },
        { headers: { authorization: token } }
      );

      const roomId = res.data.roomid;
      toast.success("room created");
      router.push(`/canvas/${roomId}`);
    } catch (e) {
      const err = e as AxiosError;
      if (err.response) {
        if (err.response?.status === 403) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please sign in again.");
          router.push("/signin");
          return;
        }

        const data = err.response.data as { message: string };
        toast.error(data.message);
      }
    }
  };

  const joinRoom = async () => {
    try {
      const res = await axios.get(`${HTTP_BACKEND}/room/${slug}`);
      console.log(res.data.room.id);
      const roomId = res.data.room.id;
      setSlug("");
      toast.success("joining room");
      router.push(`/canvas/${roomId}`);
    } catch (e) {
      const err = e as AxiosError;
      if (err.response) {
        setSlug("");
        const data = err.response.data as { message: string };
        toast.error(data.message);
      }
    }
  };

  useEffect(() => {
    async function getRooms() {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${HTTP_BACKEND}/roomlist`, {
        headers: { authorization: token },
      });
      console.log(res.data);
      setRooms(res.data);
    }
    getRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-slate-300 text-lg">
              Create new rooms or join existing ones to start collaborating
            </p>
          </div>

          {/* Main Actions Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="space-y-6">
              {/* Create Room Section */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Start Something New
                </h2>
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  onClick={createRoom}
                >
                  Create New Room
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800 text-slate-400">OR</span>
                </div>
              </div>

              {/* Join Room Section */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Join Existing Room
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Enter room ID"
                    className="flex-1 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                  <button
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                    onClick={joinRoom}
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rooms Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <h3 className="text-2xl font-bold text-white">Your Rooms</h3>
            </div>

            {rooms.length > 0 ? (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center bg-slate-700/50 border border-slate-600 px-6 py-4 rounded-xl hover:bg-slate-700/70 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-mono text-white text-lg group-hover:text-blue-300 transition-colors">
                        {room.slug}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/canvas/${room.id}`)}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
                    >
                      Enter Room
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg">No rooms found</p>
                <p className="text-slate-500 text-sm mt-2">
                  Create your first room to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
