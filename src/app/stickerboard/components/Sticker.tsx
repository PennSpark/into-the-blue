import { useRef } from "react";

interface StickerProps {
  id: number;
  x: number;
  y: number;
  src: string;
  moveSticker: (id: number, newX: number, newY: number) => void;
  getBoardRef: () => HTMLDivElement | null;
}

const Sticker: React.FC<StickerProps> = ({ id, x, y, src, moveSticker, getBoardRef }) => {
  const stickerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const board = getBoardRef();
    const sticker = stickerRef.current;
    if (!board || !sticker) return;

    isDragging.current = true;
    const stickerRect = sticker.getBoundingClientRect();

    offset.current = {
      x: e.clientX - stickerRect.left,
      y: e.clientY - stickerRect.top,
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const board = getBoardRef();
    if (!board) return;

    const boardRect = board.getBoundingClientRect();

    let newX = ((e.clientX - boardRect.left - offset.current.x) / boardRect.width) * 100;
    let newY = ((e.clientY - boardRect.top - offset.current.y) / boardRect.height) * 100;

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    moveSticker(id, newX, newY);
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={stickerRef}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: "10%",
        aspectRatio: "1 / 1",
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: "grab",
      }}
    />
  );
};

export default Sticker;
