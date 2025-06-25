import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Eraser,
  Home,
  Minus,
  Pencil,
  RectangleHorizontalIcon,
  Share2,
} from "lucide-react";
import { Game } from "@/draw/Game";
import { ShareModal } from "./ShareModal";

export type Tool = "circle" | "rect" | "pencil" | "line" | "eraser";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);
      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>

      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        setShowShareModal={setShowShareModal}
      />

      {showShareModal && (
        <ShareModal roomId={roomId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
  setShowShareModal,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  setShowShareModal: (show: boolean) => void;
}) {
  return (
    <>
      {/* Tool Icons: Top-Left */}
      <div className="fixed top-4 left-4 flex flex-col gap-3 z-10 bg-white/80 p-3 rounded-lg shadow-md">
        <IconButton
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
          onClick={() => setSelectedTool("pencil")}
        />
        <IconButton
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon />}
          onClick={() => setSelectedTool("rect")}
        />
        <IconButton
          activated={selectedTool === "circle"}
          icon={<Circle />}
          onClick={() => setSelectedTool("circle")}
        />
        <IconButton
          activated={selectedTool === "line"}
          icon={<Minus />}
          onClick={() => setSelectedTool("line")}
        />
        <IconButton
          activated={selectedTool === "eraser"}
          icon={<Eraser />}
          onClick={() => setSelectedTool("eraser")}
        />
      </div>

      {/* Home & Share: Top-Right */}
      <div className="fixed top-6 right-6 flex gap-4 items-center z-10 bg-white/80 p-2 rounded-lg shadow-md text-black">
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          <Home className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
