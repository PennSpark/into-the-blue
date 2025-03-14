"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";

import Sticker from "./Sticker";

import StickerModal from "./StickerModal";
import LabelModal from "./LabelModal";
import GridModal from "./GridModal";

import './stickerboard.css'


interface StickerData {
  isLabel: boolean;
  id: number;
  x: number;
  y: number;
  src: string;
  width: number;
  rotation: number;
  moveSticker: (id: number, newX: number, newY: number) => void;
  resizeSticker: (id: number, newWidth: number) => void;
  rotateSticker: (id: number, newRotation: number) => void;
  deleteSticker: (id: number) => void;
  active: boolean;
  setActiveSticker: (id: number) => void;
}

const StickerBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<number | null>(null);
  const [menuSelection, setMenuSelection] = useState<string | null>(null);
  const [gridBg, setGridBg] = useState<string>("#ffffff");

  const addSticker = (stickerId: string, isLabel: boolean) => {
    const newSticker: StickerData = {
      isLabel: isLabel,
      id: stickers.length + 1,
      src: `/images/${stickerId}`,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      width: 10,
      rotation: 0,
      moveSticker: moveSticker,
      resizeSticker: resizeSticker,
      rotateSticker: rotateSticker,
      deleteSticker: deleteSticker,
      active: true,
      setActiveSticker: setActiveStickerId,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const setMenu = (menu: string) => {
    setMenuSelection(menu);
  };

  const moveSticker = (id: number, newX: number, newY: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, x: newX, y: newY } : sticker
      )
    );
  };

  const resizeSticker = (id: number, newWidth: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, width: newWidth } : sticker
      )
    );
  };

  const rotateSticker = (id: number, newRotation: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, rotation: newRotation } : sticker
      )
    );
  };

  const deleteSticker = (id: number) => {
    setStickers((prev) => prev.filter((sticker) => sticker.id !== id));
  };

  const captureStickerboard = async () => {
    if (boardRef.current) {
      //clear active sticker
      setActiveStickerId(null);
  
      //wait for next frame so that active sticker controls aren't in the pic
      requestAnimationFrame(async () => {
        const scaleFactor = 3;
        const canvas = await html2canvas(boardRef.current, {
          backgroundColor: null,
          scale: scaleFactor,
          useCORS: true,
        });
  
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "stickerboard.png";
        link.click();
  
        console.log("Screenshot captured successfully!");
      });
    }
  };
  

  return (
    <div className='h-[100svh] w-[100svw] pt-[5svh] flex flex-col justify-center items-center bg-gray-300 overflow-hidden'>
    <div
      ref={boardRef}
      className='w-[45svh] h-[80svh] grid-bg rounded-[4svh] shadow-lg relative overflow-hidden'
      style={{ backgroundColor: gridBg }}
    >
      {stickers.map((sticker) => (
        <Sticker
        isLabel={sticker.isLabel}
        key={sticker.id}
        id={sticker.id}
        x={sticker.x}
        y={sticker.y}
        src={sticker.src}
        width={sticker.width || 10}
        rotation={sticker.rotation || 0}
        moveSticker={moveSticker}
        resizeSticker={resizeSticker}
        rotateSticker={rotateSticker}
        deleteSticker={deleteSticker}
        active={sticker.id === activeStickerId}
        setActiveSticker={setActiveStickerId}
        />
      ))}
    </div>
    <div className="border-black p-[2svh] min-h-[10svh] flex justify-center items-center">

{/* modals for menu items */}
    {menuSelection === 'sticker' && (<StickerModal setMenuSelection={setMenuSelection} addSticker={addSticker}/>)}

    {menuSelection === 'label' && (<LabelModal setMenuSelection={setMenuSelection} addSticker={addSticker}/>)}

    {menuSelection === 'grid' && (<GridModal setMenuSelection={setMenuSelection} setGridBg={setGridBg}/>)}

  <div id="sticker-bar" className="w-full flex flex-row justify-center items-center border border-[0.2svh] border-[#D7E3FF] p-[2svh] gap-[1.5svh] bg-white shadow-lg rounded-full">
    <button className="flex w-[4svh] h-[4svh]" onClick={() => setMenu('sticker')}>
      <Image
        src={menuSelection === 'sticker' ? 'stickerboard/sticker-button-alt.svg' : 'stickerboard/sticker-button.svg'}
        alt="sticker button"
        width={50}
        height={50}
        className="object-contain"
      />
    </button>

    <button className="flex w-[4svh] h-[4svh]" onClick={() => setMenu('label')}>
      <Image
        src={menuSelection === 'label' ? 'stickerboard/label-button-alt.svg' : 'stickerboard/label-button.svg'}
        alt="label button"
        width={50}
        height={50}
        className="object-contain"
      />
    </button>

    <button className="flex w-[4svh] h-[4svh]" onClick={() => setMenu('grid')}>
      <Image
        src={menuSelection === 'grid' ? 'stickerboard/grid-button-alt.svg' : 'stickerboard/grid-button.svg'}
        alt="grid button"
        width={50}
        height={50}
        className="object-contain"
      />
    </button>

  </div>
  <button onClick={captureStickerboard}>capture image</button>
</div>

  </div>
  );
};

export default StickerBoard;
