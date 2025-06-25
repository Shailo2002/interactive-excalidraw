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
      const res = await axios.get(`${HTTP_BACKEND}/room/${slug}` );
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
    <>
      <Navbar />

      <div className="flex items-center justify-center h-screen">
        <div>
          <button
            className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
            onClick={createRoom}
          >
            Create Room
          </button>
          <div>
            <input
              type="text"
              placeholder="room Id"
              className="bg-slate-700 p-2 rounded m-2 "
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <button
              className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
              onClick={joinRoom}
            >
              {" "}
              Join room
            </button>
          </div>
          <div className="bg-slate-700 p-4 rounded text-white mt-4">
            <h3 className="font-bold text-lg mb-2 text-center underline">
              Your Rooms
            </h3>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center bg-slate-800 px-4 py-2 rounded shadow-md"
                  >
                    <span className="font-mono">{room.slug}</span>
                    <button
                      onClick={() => router.push(`/canvas/${room.id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">No rooms found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
