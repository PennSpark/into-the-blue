"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Sticker from "./Sticker";

import StickerModal from "./StickerModal";
import LabelModal from "./LabelModal";
import GridModal from "./GridModal";

import './stickerboard.css'

const imageList: string[] = [
  "ani.png",
  "april.png",
  "estelle.png",
  "joyce.png",
  "mei.png",
  "nick.png",
  "ruth.png",
  "xue.png",
];

interface StickerData {
  id: number;
  src: string;
  x: number;
  y: number;
}

const StickerBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [menuSelection, setMenuSelection] = useState<string | null>(null);
  const [gridBg, setGridBg] = useState<string>("#ffffff");

  const addSticker = (stickerId: string) => {
    const newSticker: StickerData = {
      id: stickers.length + 1,
      src: `/images/${stickerId}`,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  useEffect(() => {
    const randomStickers: StickerData[] = imageList.map((image, index) => ({
      id: index + 1,
      src: `/images/${image}`,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
    }));
    setStickers(randomStickers);
  }, []);

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

  return (
    <>
    <div
      ref={boardRef}
      className='w-[45svh] h-[80svh] grid-bg rounded-[4svh] shadow-lg relative overflow-hidden'
      style={{ backgroundColor: gridBg }}
    >
      {stickers.map((sticker) => (
        <Sticker
          key={sticker.id}
          id={sticker.id}
          x={sticker.x}
          y={sticker.y}
          src={sticker.src}
          moveSticker={moveSticker}
          getBoardRef={() => boardRef.current}
        />
      ))}
    </div>
    <div className="border-black p-[2svh] min-h-[10svh] flex justify-center items-center">

    {/* Modals for each menu item */}
    {menuSelection === 'sticker' && (<StickerModal setMenuSelection={setMenuSelection} addSticker={addSticker}/>)}

    {menuSelection === 'label' && (<LabelModal/>)}

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
</div>

    </>
  );
};

export default StickerBoard;
