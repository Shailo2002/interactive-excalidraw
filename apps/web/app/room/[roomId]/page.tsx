import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
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
