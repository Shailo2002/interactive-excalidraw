"use client";
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDYyNjUxNS1kM2QwLTQ3ZDUtOTY3ZS05ODQ5NjQzM2Y5NWMiLCJpYXQiOjE3NTA2MDQ4OTcsImV4cCI6MTc1MDYwODQ5N30.keA1FmLwY8MHdUaO7jGCgjJHHp9_aHJWHAQAyzBS0vc`
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
