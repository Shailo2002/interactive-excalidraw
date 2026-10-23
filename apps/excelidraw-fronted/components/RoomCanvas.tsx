"use client";
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Link from "next/link";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState("Connecting to live board…");

  useEffect(() => {
    let stopped = false;
    let current: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout>;
    let heartbeat: ReturnType<typeof setInterval>;
    let attempts = 0;

    function connect() {
      if (stopped) return;
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Sign in to collaborate on this board.");
        return;
      }
      // Expired sessions must be renewed instead of silently opening a dead canvas.
      try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
          setStatus("Your session expired. Sign in again to collaborate.");
          return;
        }
      } catch { /* Let the server validate opaque or malformed tokens. */ }
      const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
      current = ws;
      ws.onopen = () => {
        if (stopped) { ws.close(); return; }
        attempts = 0;
        ws.send(JSON.stringify({ type: "join_room", roomId }));
        setSocket(ws);
        setStatus("Live");
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
        }, 20000);
      };
      ws.onclose = () => {
        clearInterval(heartbeat);
        if (stopped) return;
        setSocket(null);
        setStatus("Connection lost. Reconnecting to live board…");
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempts++, 10000));
      };
      ws.onerror = () => ws.close();
    }
    function resume() {
      if (document.visibilityState === "visible" && current?.readyState === WebSocket.CLOSED) {
        clearTimeout(retry);
        connect();
      }
    }
    connect();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => {
      stopped = true;
      clearTimeout(retry);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      current?.close();
    };
  }, [roomId]);

  if (!socket) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <p role="status">{status}</p>
      <Link className="text-blue-400 underline" href="/signin">Sign in</Link>
    </div>
  );
  return <Canvas roomId={roomId} socket={socket} />;
}
