"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  function shailesh() {
    router.push(`/room/${roomId}`);
  }

  return (
    <div className={styles.page}>
      <input
        value={roomId}
        onChange={(e) => {
          setRoomId(e.target.value);
        }}
        type="text"
        placeholder="Room id"
      ></input>

      <button onClick={shailesh}>Join room</button>
    </div>
  );
}
