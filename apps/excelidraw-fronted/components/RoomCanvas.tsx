"use client";
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YzVjOWUzNi1mYTA1LTQzYTUtOWEzMi1kM2JkNmM1ZmQ2NmYiLCJpYXQiOjE3NDU2MDI3OTcsImV4cCI6MTc0NTYwNjM5N30.0xIDKXIqtPRB-uOmfygDBdPsfXpsW73nkRyYIOADnns`
    );

    console.log("roomId ", roomId);

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
    return <div>Connecting to server ...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket}></Canvas>
    </div>
  );
}
