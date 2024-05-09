import React, { useState, useRef, useEffect } from "react";

interface PanImageProps {
  src: string;
}

const PanImage: React.FC<PanImageProps> = ({ src }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        setPosition({ x: offsetX, y: offsetY });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      setScale((prevScale) => prevScale * delta);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [dragging]);

  const handleMouseDown = () => {
    setDragging(true);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        overflow: "hidden",
        cursor: dragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        ref={imageRef}
        src={src}
        alt="Pannable"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${-position.x}px, ${-position.y}px) scale(${scale})`,
          transition: "transform 0.1s ease-out",
        }}
      />
    </div>
  );
};

export default PanImage;