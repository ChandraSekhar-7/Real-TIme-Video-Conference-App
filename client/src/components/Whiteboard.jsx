import { useEffect, useRef, useState, useCallback } from "react";

const COLORS = ["#EDEFF3", "#F0A868", "#4FD1C5", "#9F87F5", "#F27D7D"];

export default function Whiteboard({ socketRef, roomCode, initialSnapshot, onClose }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const canvas = canvasRef.current;
      ctxRef.current = canvas.getContext("2d");
      ctxRef.current.lineCap = "round";
      ctxRef.current.lineJoin = "round";
    }
    return ctxRef.current;
  }, []);

  // Fit canvas to its container, restoring content on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    function resize() {
      const parent = canvas.parentElement;
      const snapshot = canvas.toDataURL();
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const ctx = getCtx();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = snapshot;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load any previously saved snapshot once on mount
  useEffect(() => {
    if (initialSnapshot) {
      const img = new Image();
      img.onload = () => getCtx().drawImage(img, 0, 0);
      img.src = initialSnapshot;
    }
  }, [initialSnapshot, getCtx]);

  // Listen for remote strokes / clears
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function drawStroke({ x0, y0, x1, y1, color: c, width: w }) {
      const ctx = getCtx();
      ctx.strokeStyle = c;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    function handleClear() {
      const canvas = canvasRef.current;
      getCtx().clearRect(0, 0, canvas.width, canvas.height);
    }

    socket.on("whiteboard:draw", drawStroke);
    socket.on("whiteboard:clear", handleClear);
    return () => {
      socket.off("whiteboard:draw", drawStroke);
      socket.off("whiteboard:clear", handleClear);
    };
  }, [socketRef, getCtx]);

  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    return {
      x: (touch ? touch.clientX : e.clientX) - rect.left,
      y: (touch ? touch.clientY : e.clientY) - rect.top,
    };
  }

  function startDraw(e) {
    drawing.current = true;
    lastPoint.current = getPoint(e);
  }

  function draw(e) {
    if (!drawing.current) return;
    const point = getPoint(e);
    const ctx = getCtx();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    socketRef.current?.emit("whiteboard:draw", {
      roomCode,
      stroke: { x0: lastPoint.current.x, y0: lastPoint.current.y, x1: point.x, y1: point.y, color, width },
    });

    lastPoint.current = point;
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    const snapshot = canvasRef.current.toDataURL();
    socketRef.current?.emit("whiteboard:save", { roomCode, snapshot });
  }

  function clearBoard() {
    const canvas = canvasRef.current;
    getCtx().clearRect(0, 0, canvas.width, canvas.height);
    socketRef.current?.emit("whiteboard:clear", { roomCode });
    socketRef.current?.emit("whiteboard:save", { roomCode, snapshot: canvas.toDataURL() });
  }

  return (
    <div className="absolute inset-0 z-20 bg-void flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-surface">
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold text-sm">Whiteboard</span>
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform ${
                  color === c ? "scale-110 border-ink" : "border-transparent"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
          <input
            type="range"
            min="1"
            max="12"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="accent-amber w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearBoard} className="btn-ghost text-xs px-3 py-1.5">
            Clear board
          </button>
          <button onClick={onClose} className="btn-ghost text-xs px-3 py-1.5">
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 relative bg-[#0E1219]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </div>
  );
}
