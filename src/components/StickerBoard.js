'use client';

import { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

// List of images in your src/images folder (replace these with actual images in your project)
const imageList = [
  "ani.png",
  "april.png",
  "estelle.png",
  "joyce.png",
  "mei.png",
  "nick.png",
  "ruth.png",
  "xue.png",
];

const StickerBoard = () => {
  const [stickers, setStickers] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Generate random positions for the stickers
  const getRandomPosition = () => {
    const x = Math.floor(Math.random() * window.innerWidth); // Random X position within window width
    const y = Math.floor(Math.random() * window.innerHeight); // Random Y position within window height
    return { x, y };
  };

  // Initialize stickers with random positions and images from imageList
  useEffect(() => {
    const randomStickers = imageList.map((image, index) => ({
      id: index + 1,
      src: `/images/${image}`, // Assuming images are in the 'public/images' folder
      ...getRandomPosition(),
    }));
    setStickers(randomStickers);
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a loading spinner, etc.
  }

  // Dragging logic
  const moveSticker = (id, x, y) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, x, y } : sticker
      )
    );
  };

  return (
    <div className="stickerboard" style={{ position: "relative", height: "100vh" }}>
      {stickers.map((sticker) => (
        <Sticker
          key={sticker.id}
          id={sticker.id}
          x={sticker.x}
          y={sticker.y}
          src={sticker.src}
          moveSticker={moveSticker}
        />
      ))}
    </div>
  );
};

const Sticker = ({ id, x, y, src, moveSticker }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "STICKER",
    item: { id, x, y, src },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "STICKER",
    hover: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        moveSticker(item.id, item.x + delta.x, item.y + delta.y);
      }
    },
  }));

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "100px",
        height: "100px",
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: isDragging ? 0.5 : 1,
      }}
    />
  );
};

export default StickerBoard;
