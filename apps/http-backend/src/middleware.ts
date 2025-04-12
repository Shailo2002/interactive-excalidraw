import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface ExtendedReq extends Request {
  userId?: string;
}

export function middleware(
  req: ExtendedReq,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"] ?? "";

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (decoded && typeof decoded === "object" && "userId" in decoded) {
      req.userId = decoded.userId as string;
      next();
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.error("JWT Verify Error:", err);
    res.status(403).json({ message: "Unauthorized" });
  }
}
