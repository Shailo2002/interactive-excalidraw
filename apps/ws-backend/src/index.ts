import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: User[] = [];

const wss = new WebSocketServer({ port: 8080 });

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);
  if (userId === null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === "join_room") {
      ws.send("new person joined room");
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      console.log("message in websocket : ", message);
      try {
        await prismaClient.chat.create({
          data: {
            roomId: roomId,
            message,
            userId,
          },
        });
      } catch (e) {
        console.log("not able to add chat in db");
        console.log("error : ", e);
      }

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
    }

   if (parsedData.type === "erase") {
     const shapeId = parsedData.shapeId;
     const roomId = parsedData.roomId;

     try {
       const allMessages = await prismaClient.chat.findMany({
         where: { roomId },
       });

       const msgToDelete = allMessages.find((msg) => {
         try {
           const parsed = JSON.parse(msg.message);
           return parsed.shape?.id === shapeId;
         } catch {
           return false;
         }
       });

       if (msgToDelete) {
         await prismaClient.chat.delete({
           where: { id: msgToDelete.id },
         });
       }
     } catch (e) {
       console.log("DB deletion error:", e);
     }

     users.forEach((user) => {
       if (user.rooms.includes(roomId)) {
         user.ws.send(
           JSON.stringify({
             type: "erase",
             shapeId: shapeId,
             roomId,
           })
         );
       }
     });
   }


  });
});
