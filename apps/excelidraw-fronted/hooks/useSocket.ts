import { WS_URL } from "@/config";
import { useEffect, useState } from "react";


export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      // alert("try after login your account");

      return;
    }
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setLoading(true);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
}
