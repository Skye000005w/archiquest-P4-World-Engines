import React, { useState, useRef } from "react";

interface SelectionArea {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

const SelectImageRegion = ({
  img,
  onSelect,
  onCancel,
}: {
  img: string;
  onSelect: (imgUrl: string) => void;
  onCancel: () => void;
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea>({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startSelection = (event: React.MouseEvent) => {
    event.preventDefault();
    const rect = imgRef.current!.getBoundingClientRect();
    setSelectionArea({
      startX: event.clientX - rect.left,
      startY: event.clientY - rect.top,
      width: 0,
      height: 0,
    });
    setIsSelecting(true);
  };

  const updateSelection = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isSelecting) return;
    const rect = imgRef.current!.getBoundingClientRect();
    setSelectionArea((prev) => ({
      ...prev,
      width: event.clientX - rect.left - prev.startX,
      height: event.clientY - rect.top - prev.startY,
    }));
  };

  const endSelection = () => {
    if (canvasRef.current && imgRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      canvasRef.current.width = Math.abs(selectionArea.width);
      canvasRef.current.height = Math.abs(selectionArea.height);
      ctx.drawImage(
        imgRef.current,
        selectionArea.startX,
        selectionArea.startY,
        selectionArea.width,
        selectionArea.height,
        0,
        0,
        Math.abs(selectionArea.width),
        Math.abs(selectionArea.height)
      );
      onSelect(canvasRef.current.toDataURL("image/png"));
    }
    setIsSelecting(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative">
        <img
          ref={imgRef}
          src={img}
          crossOrigin="anonymous"
          onMouseDown={startSelection}
          onMouseMove={updateSelection}
          onMouseUp={endSelection}
          style={{ cursor: isSelecting ? "crosshair" : "default" }}
        />
        <canvas ref={canvasRef} className="hidden"></canvas>
        {isSelecting && (
          <div
            className="absolute border-2 border-white border-dashed pointer-events-none"
            style={{
              left:
                selectionArea.width > 0
                  ? selectionArea.startX + "px"
                  : selectionArea.startX + selectionArea.width + "px",
              top:
                selectionArea.height > 0
                  ? selectionArea.startY + "px"
                  : selectionArea.startY + selectionArea.height + "px",
              width: Math.abs(selectionArea.width) + "px",
              height: Math.abs(selectionArea.height) + "px",
            }}
          ></div>
        )}
      </div>
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default SelectImageRegion;