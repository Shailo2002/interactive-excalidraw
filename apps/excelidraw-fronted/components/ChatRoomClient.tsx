"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export function ChatRoomClient({
  messages,
  id,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const [chat, setChats] = useState(messages);
  const [currentMessage, setCurrentMessage] = useState("");
  const { socket, loading } = useSocket();
  const router = useRouter();

  // useEffect(() => {
  //   if (loading || !socket) {
  //     // alert("Please sign in first.");
  //     router.push("/signin");
  //   }
  // }, []);

  useEffect(() => {
    console.log("socket :", socket);
    console.log("loading :", loading);
    if (socket && !loading) {
      console.log("join request send from next.js app");
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: id,
        })
      );
      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setChats((c) => [...c, { message: parsedData.message }]);
        }
      };
    }
  }, [socket, loading, id]);

  return (
    <div>
      {chat.map((m) => (
        <div>{m.message}</div>
      ))}
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => {
          setCurrentMessage(e.target.value);
        }}
      ></input>
      <button
        onClick={() => {
          console.log("message send to socket ", currentMessage);
          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage,
            })
          );
          setCurrentMessage("");
        }}
      >
        send
      </button>
    </div>
  );
}
