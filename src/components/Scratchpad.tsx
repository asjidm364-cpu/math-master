import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, RotateCcw, X, Grid, Download } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#3b82f6');
  const [penSize, setPenSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : penColor;
    ctx.lineWidth = tool === 'eraser' ? penSize * 4 : penSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `math-scratchpad-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div
      id="scratchpad-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5"
    >
      <div
        id="scratchpad-container"
        className="w-full max-w-3xl h-[80vh] flex flex-col bg-white rounded-[2rem] shadow-pop-amber border-4 border-amber-400 overflow-hidden"
      >
        {/* Header Toolbar */}
        <div
          id="scratchpad-header"
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-amber-50/90 border-b-3 border-amber-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-amber-900 text-amber-950 flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]">
              ✏️
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight uppercase tracking-tight">Student Scratchpad</h3>
              <p className="text-xs text-slate-600 font-medium">Solve calculations, sketch diagrams & step-by-step notes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Pen / Eraser toggles */}
            <div className="flex items-center bg-white border-2 border-slate-300 p-1 rounded-xl shadow-2xs">
              <button
                id="btn-scratchpad-pen"
                onClick={() => setTool('pen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                  tool === 'pen' ? 'bg-amber-400 text-amber-950 border border-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pen className="w-3.5 h-3.5" />
                <span>Pen</span>
              </button>
              <button
                id="btn-scratchpad-eraser"
                onClick={() => setTool('eraser')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                  tool === 'eraser' ? 'bg-amber-400 text-amber-950 border border-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>
            </div>

            {/* Colors */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1.5 bg-white border-2 border-slate-300 px-2 py-1.5 rounded-xl shadow-2xs">
                {['#2563eb', '#dc2626', '#16a34a', '#d97706', '#1e293b'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPenColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      penColor === c ? 'scale-125 ring-2 ring-amber-500 ring-offset-1' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Grid toggle */}
            <button
              id="btn-scratchpad-grid"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid Lines"
              className={`p-2 rounded-xl border-2 text-xs font-black transition ${
                showGrid ? 'bg-indigo-100 border-indigo-400 text-indigo-900' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Clear button */}
            <button
              id="btn-scratchpad-clear"
              onClick={clearCanvas}
              title="Clear Pad"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-xs font-black text-slate-800 uppercase tracking-wider transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            {/* Download sketch */}
            <button
              id="btn-scratchpad-download"
              onClick={downloadCanvas}
              title="Save Drawing"
              className="p-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              id="btn-scratchpad-close"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-amber-100 text-slate-600 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className={`relative flex-1 w-full h-full cursor-crosshair overflow-hidden ${
            showGrid
              ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-white'
              : 'bg-white'
          }`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full touch-none block"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-amber-50/60 border-t-2 border-amber-200 flex items-center justify-between text-xs text-slate-600 font-bold">
          <span>Tip: Work out regrouping, fraction simplifying, and algebraic steps here!</span>
          <span className="font-mono text-amber-900">100% Offline Scratchpad</span>
        </div>
      </div>
    </div>
  );
};
