"use client";
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import { useRouter } from "next/navigation";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const ws = new WebSocket(
      `${WS_URL}?token=${token}`
    );


    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        })
      );
    };
  }, []);

  if (!socket) {
    console.log("socket ", socket)
    return (
      <div className="flex justify-center items-center h-screen w-full pb-10 pr-10 ">
        <div className="flex justify-center flex-col border-2 shadow-md rounded-md p-20 font-bold">
          <div>
            {" "}
            <span
              className="font-bold text-blue-600 cursor-pointer underline"
              onClick={() => {
                localStorage.clear();
                router.push("/signin");
              }}
            >
              login
            </span>{" "}
            first
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket}></Canvas>
    </div>
  );
}
