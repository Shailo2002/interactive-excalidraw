import { ChatRoom } from "@/components/ChatRoom";
import { HTTP_BACKEND } from "@/config";
import axios from "axios";


async function getRoomId(slug: string) {
  const response = await axios.get(`${HTTP_BACKEND}/room/${slug}`);
  return response.data.room.id;
}

export default async function Room({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const slug1 = (await params).roomId;
  const roomId = await getRoomId(slug1);
  console.log(`roomid from backend: ${roomId}`);
  if (roomId) {
    return <ChatRoom id={roomId}></ChatRoom>;
  } else {
    return <div>loading ...</div>;
  }
}
