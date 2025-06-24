// Game.ts
import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private tempPoints: { x: number; y: number }[] = [];
  private selectedTool: Tool = "circle";
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
      if (message.type === "erase") {
        const shapeToDelete = JSON.parse(message.message).shape;
        this.existingShapes = this.existingShapes.filter(
          (shape) => JSON.stringify(shape) !== JSON.stringify(shapeToDelete)
        );
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const shape of this.existingShapes) {
      this.ctx.strokeStyle = "white";
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (const point of shape.points) {
          this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    if (this.selectedTool === "pencil") {
      this.tempPoints = [{ x: e.clientX, y: e.clientY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const endX = e.clientX;
    const endY = e.clientY;
    const width = endX - this.startX;
    const height = endY - this.startY;
    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = { type: "rect", x: this.startX, y: this.startY, width, height };
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    } else if (this.selectedTool === "line") {
      shape = {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX,
        endY,
      };
    } else if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        points: this.tempPoints,
      };
    }

    if (!shape || this.selectedTool === "eraser") return;

    this.existingShapes.push(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;
    const endX = e.clientX;
    const endY = e.clientY;
    const width = endX - this.startX;
    const height = endY - this.startY;

    this.clearCanvas();
    this.ctx.strokeStyle = this.selectedTool === "eraser" ? "black" : "white";

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      this.ctx.beginPath();
      this.ctx.arc(
        this.startX + radius,
        this.startY + radius,
        Math.abs(radius),
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "pencil") {
      this.tempPoints.push({ x: e.clientX, y: e.clientY });
      this.ctx.beginPath();
      this.ctx.moveTo(this.tempPoints[0].x, this.tempPoints[0].y);
      for (const point of this.tempPoints) {
        this.ctx.lineTo(point.x, point.y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "eraser") {
      this.ctx.lineWidth = 12;
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.closePath();
      this.startX = endX;
      this.startY = endY;
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
