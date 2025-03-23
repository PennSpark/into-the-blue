"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

import Sticker from "./Sticker";

// import StickerModal from "./StickerModal";
// import LabelModal from "./LabelModal";
// import GridModal from "./GridModal";
import Modal from "./Modal";

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

  const router = useRouter();
  
  const addSticker = (stickerSrc: string, isLabel: boolean) => {
    const newSticker: StickerData = {
      isLabel: isLabel,
      id: stickers.length + 1,
      src: stickerSrc,
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
    <div className='relative h-[100svh] w-[100svw] grid-bg-gray flex flex-col justify-center items-center bg-gray-300 overflow-hidden gap-[0.5svh]'>
    <div className='w-[42.75svh] h-[9svh] py-[2.3svh] flex flex-row justify-between items-center'>
      <button onClick={() => router.back()}
        className='round-button h-full flex rounded-full p-[1svh] px-[2svh]'>
        <Image src='/icons/arrow-stroke.svg' className='w-full h-full' width={100} height={100} alt='back' />
      </button>
      <button onClick={captureStickerboard} className='round-button h-full flex justify-center items-center rounded-full p-2 px-3'>
        <span className='text-[2svh]'>I&apos;m done</span>
      </button>

    </div>
    <div
      ref={boardRef}
      className='w-[42.75svh] h-[76svh] grid-bg rounded-[1svh] shadow-lg relative overflow-visible'
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
  {menuSelection && (
    <Modal
      setMenuSelection={setMenuSelection}
      addSticker={menuSelection !== "grid" ? addSticker : undefined}
      setGridBg={menuSelection === "grid" ? setGridBg : undefined}
      menuSelection={menuSelection}
    />
  )}

  <div id="sticker-bar" className="round-button w-full flex flex-row justify-center items-center p-[1.3svh] px-[2.3svh] gap-[1.5svh] rounded-full">
    <button className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'sticker' ? 'bg-blue-1' : 'bg-blue-5'}`} onClick={() => setMenu('sticker')}>
      <Image
        src={menuSelection === 'sticker' ? 'stickerboard/sticker-button-alt.svg' : 'stickerboard/sticker-button.svg'}
        alt="sticker button"
        width={50}
        height={50}
        className="object-contain"
      />
    </button>

    <button className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'label' ? 'bg-blue-1' : 'bg-blue-5'}`} onClick={() => setMenu('label')}>
      <Image
        src={menuSelection === 'label' ? 'stickerboard/label-button-alt.svg' : 'stickerboard/label-button.svg'}
        alt="label button"
        width={50}
        height={50}
        className="object-contain"
      />
    </button>

    <button className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'grid' ? 'bg-blue-1' : 'bg-blue-5'}`} onClick={() => setMenu('grid')}>
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

  </div>
  );
};

export default StickerBoard;
