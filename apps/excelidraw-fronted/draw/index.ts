import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      CenterX: number;
      CenterY: number;
      radius: number;
    }
  | {
    type: "pencil";
    points: { x: number; y: number }[];
  }
|{
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");

  let existingShapes: Shape[] = await getExistingShapes(roomId);
  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type == "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);
  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });
  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    // @ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shape | null = null;
    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;

      let CenterX = startX + radius;
      let CenterY = startY + radius;

      if (width < 0 && height < 0) {
        CenterX = startX - radius;
        CenterY = startY - radius;
      } else if (width < 0) {
        CenterX = startX - radius;
        CenterY = startY + radius;
      } else if (height < 0) {
        CenterX = startX + radius;
        CenterY = startY - radius;
      } else {
        CenterX = startX + radius;
        CenterY = startY + radius;
      }

      shape = {
        type: "circle",
        CenterX: CenterX,
        CenterY: CenterY,
        radius: Math.abs(radius),
      };
    }

    if (!shape) {
      return;
    }

    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId: roomId,
      })
    );
  });
  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255,255,255)";

      // @ts-ignore
      const selectedTool = window.selectedTool;
      if (selectedTool == "rect") {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool == "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        let CenterX = startX + radius;
        let CenterY = startY + radius;

        if (width < 0 && height < 0) {
          CenterX = startX - radius;
          CenterY = startY - radius;
        } else if (width < 0) {
          CenterX = startX - radius;
          CenterY = startY + radius;
        } else if (height < 0) {
          CenterX = startX + radius;
          CenterY = startY - radius;
        } else {
          CenterX = startX + radius;
          CenterY = startY + radius;
        }

        ctx.beginPath();
        ctx.arc(CenterX, CenterY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if (shape.type === "rect") {
      console.log("inside map");

      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type == "circle") {
      ctx.beginPath();
      ctx.arc(
        shape.CenterX,
        shape.CenterY,
        Math.abs(shape.radius),
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();
    }
  });
}

