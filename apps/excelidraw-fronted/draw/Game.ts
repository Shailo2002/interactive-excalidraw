

import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { v4 as uuidv4 } from "uuid";

export type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color?: string;
    }
  | {
      id: string;
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color?: string;
    }
  | {
      id: string;
      type: "pencil";
      color?: string;
      points: { x: number; y: number }[];
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      text: string;
      color?: string;
    };

export class Game {
  static setColor(value: string): void {
    throw new Error("Method not implemented.");
  }
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private selectedColor: string = "white";
  private pencilPoints: { x: number; y: number }[] = [];

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

  setColor(color: string){
    console.log("color in GAme:", color)
    this.selectedColor = color
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
        console.log("pased shape :", parsedShape);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      } else if (message.type === "erase") {
        const shapeIdToDelete = message.shapeId;
        this.existingShapes = this.existingShapes.filter(
          (shape) => shape.id !== shapeIdToDelete
        );
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = shape.color || "white";
      this.ctx.lineWidth = 2;
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
          this.ctx.strokeStyle = shape.color || "white";
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
          this.ctx.strokeStyle = shape.color || "white";
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
          this.ctx.strokeStyle = shape.color || "white";
        const [first, ...rest] = shape.points;
        this.ctx.moveTo(first.x, first.y);
        for (const point of rest) {
          this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "text") {
        this.ctx.fillStyle = shape.color || "white";
        this.ctx.font = "20px sans-serif";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (this.selectedTool === "eraser") {
      const shapeIndex = this.existingShapes.findIndex((shape) => {
        if (shape.type === "rect") {
          return (
            clickX >= shape.x &&
            clickX <= shape.x + shape.width &&
            clickY >= shape.y &&
            clickY <= shape.y + shape.height
          );
        } else if (shape.type === "circle") {
          const dist = Math.sqrt(
            (clickX - shape.centerX) ** 2 + (clickY - shape.centerY) ** 2
          );
          return dist <= shape.radius;
        } else if (shape.type === "line") {
          const dist = this.pointToLineDistance(
            { x: clickX, y: clickY },
            { x: shape.startX, y: shape.startY },
            { x: shape.endX, y: shape.endY }
          );
          return dist < 5;
        } else if (shape.type === "pencil") {
          const points = shape.points;
          for (let i = 0; i < points.length - 1; i++) {
            const dist = this.pointToLineDistance(
              { x: clickX, y: clickY },
              points[i],
              points[i + 1]
            );
            if (dist < 5) return true;
          }
          return false;
        } else if (shape.type === "text") {
          // Check click within text bounding box
          this.ctx.font = "20px sans-serif"; // match drawing style
          const textWidth = this.ctx.measureText(shape.text).width;
          const textHeight = 20; // approx font height
          return (
            clickX >= shape.x &&
            clickX <= shape.x + textWidth &&
            clickY >= shape.y - textHeight &&
            clickY <= shape.y
          );
        }

        return false;
      });

      if (shapeIndex !== -1) {
        const shape = this.existingShapes[shapeIndex];
        this.existingShapes.splice(shapeIndex, 1);
        this.clearCanvas();

        this.socket.send(
          JSON.stringify({
            type: "erase",
            shapeId: shape.id,
            roomId: this.roomId,
          })
        );
      }

      return;
    }

    if (this.selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const shape: Shape = {
          id: uuidv4(),
          type: "text",
          x: clickX,
          y: clickY,
          text,
          color: this.selectedColor,
        };
        this.existingShapes.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
        this.clearCanvas();
      }
      return;
    }

    // for drawing tools
    this.clicked = true;
    this.startX = clickX;
    this.startY = clickY;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.ctx.strokeStyle = this.selectedColor;

    if (!this.clicked || this.selectedTool === "eraser") return;

    let shape: Shape | null = null;
    const endX = e.clientX;
    const endY = e.clientY;

    const id = uuidv4();

    if (this.selectedTool === "rect") {
      console.log("color :", this.selectedColor);
      shape = {
        id,
        type: "rect",
        x: this.startX,
        y: this.startY,
        width: endX - this.startX,
        height: endY - this.startY,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(endX - this.startX, endY - this.startY) / 2;
      shape = {
        id,
        type: "circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "line") {
      shape = {
        id,
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX,
        endY,
        color: this.selectedColor,
      };
    } else if (this.selectedTool === "pencil" && this.pencilPoints.length > 1) {
      const shape: Shape = {
        id: uuidv4(),
        type: "pencil",
        color: this.selectedColor,
        points: [...this.pencilPoints],
      };

      this.existingShapes.push(shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        })
      );

      this.clearCanvas();
      this.clicked = false;
      this.pencilPoints = [];
      return;
    }

    if (!shape) return;

    this.existingShapes.push(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );

    this.clearCanvas();
    this.clicked = false;
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked || this.selectedTool === "eraser") return;

    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    const endX = e.clientX;
    const endY = e.clientY;

    this.clearCanvas();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      const centerX = this.startX + radius;
      const centerY = this.startY + radius;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "pencil" && this.clicked) {
      const newPoint = { x: e.clientX, y: e.clientY };
      this.pencilPoints.push(newPoint);

      this.clearCanvas();

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      const [first, ...rest] = this.pencilPoints;
      this.ctx.moveTo(first.x, first.y);
      for (const point of rest) {
        this.ctx.lineTo(point.x, point.y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  pointToLineDistance(
    p: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) {
    const A = p.x - a.x;
    const B = p.y - a.y;
    const C = b.x - a.x;
    const D = b.y - a.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq ? dot / lenSq : -1;
    let xx, yy;
    if (param < 0) {
      xx = a.x;
      yy = a.y;
    } else if (param > 1) {
      xx = b.x;
      yy = b.y;
    } else {
      xx = a.x + param * C;
      yy = a.y + param * D;
    }
    const dx = p.x - xx;
    const dy = p.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
