import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import bcrypt from "bcrypt";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";

import { Request, Response } from "express";
import { ExtendedReq, middleware } from "./middleware";
import cors from "cors";
import dotenv from "dotenv";
import { prismaClient } from "@repo/db/client";

dotenv.config();
const app = express();
const port = 3001;
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTED_URL,
    credentials: true,
  })
);

app.post("/signup", async (req, res) => {
  console.log("signup endpoint hit");
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  const { email, password, name } = parsed.data;

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (user) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prismaClient.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json({ message: "User created successfully" });
    return;
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
});

app.post("/signin", async (req, res) => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
    return;
  } catch (err) {
    console.error("Signin Error:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log("Invalid body format:", req.body);
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  try {
    //db call
    const userId = (req as ExtendedReq).userId || "";
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.slug,
        adminId: userId,
      },
    });

    res.json({
      roomid: room.id,
    });
  } catch (error) {
    res.status(411).json({ message: "room already exist with this name" });
  }
});

//TODO : not authenticated(anyone can see message by roomid)
app.get("/chats/:roomId", async (req, res) => {
  console.log("backend chats/roomid request", req.params.roomId);
  const roomId = req.params.roomId;
  const messages = await prismaClient.chat.findMany({
    where: { roomId: roomId },
    orderBy: {
      id: "desc",
    },
    take: 1000,
  });

  res.json({ messages });
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  console.log("slug detail ", slug);
  const room = await prismaClient.room.findFirst({
    where: { slug },
    select: {
      id: true,
    },
  });
  if (room === null) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  res.json({ room });
});

app.get("/roomlist",middleware,  async (req,res) => {
 try {
   
   const userId = (req as ExtendedReq).userId || "";
   console.log("userId :", userId)
    const rooms = await prismaClient.room.findMany({
      where: { adminId: userId },
      select: { slug: true, id:true }, 
    });
   console.log("roomlist :", rooms)

   res.json(rooms);
 } catch (error) {
   res.status(411).json({ message: "no room exist" });
 }
})

app.listen(port, () => {
  console.log(`"http server running on ${port}"`);
});
