"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FinishHuntButton from "@/components/FinishHuntButton";

import { saveSticker, loadImageByName, loadAllStickers, loadGridBg, saveGridBg, deleteStickerById } from "@/app/context/IndexedDB";

import Sticker from "./Sticker";

import Modal from "./Modal";

import './stickerboard.css'


interface StickerData {
  isLabel: boolean;
  id: number;
  imageName: string;
  x: number;
  y: number;
  src: string;
  width: number;
  aspectRatio: number;
  rotation: number;
  moveSticker: (id: number, newX: number, newY: number) => void;
  resizeSticker: (id: number, newWidth: number) => void;
  rotateSticker: (id: number, newRotation: number) => void;
  deleteSticker: (id: number) => void;
  active: boolean;
  setActiveSticker: (id: number) => void;
}

interface StoredSticker {
  id: number;
  imageName: string;
  x: number;
  y: number;
  width: number;
  aspectRatio: number;
  rotation: number;
  isLabel: boolean;
}

const extractStoredFields = (sticker: StickerData): StoredSticker => ({
  id: sticker.id,
  imageName: sticker.imageName,  // not the blob URL!
  x: sticker.x,
  y: sticker.y,
  width: sticker.width,
  aspectRatio: sticker.aspectRatio,
  rotation: sticker.rotation,
  isLabel: sticker.isLabel,
});


const StickerBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<number | null>(null);
  const [menuSelection, setMenuSelection] = useState<string | null>(null);
  const [gridBg, setGridBg] = useState<string>("var(--Warm-White)");
  const [showFinishHint, setShowFinishHint] = useState(true);

  const router = useRouter();

  const handleGridChange = (color: string) => {
    setGridBg(color);
    saveGridBg(color);
  };

  const updateSticker = useCallback((id: number, changes: Partial<StickerData>) => {
    setStickers((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, ...changes } : s
      );
  
      const current = updated.find((s) => s.id === id);
      if (current) {
        saveSticker(extractStoredFields(current));
      }
  
      return updated;
    });
  }, []);

  const moveSticker = useCallback((id: number, newX: number, newY: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, x: newX, y: newY } : sticker
      )
    );
    updateSticker(id, { x: newX, y: newY });
  }, [updateSticker]);

  const resizeSticker = useCallback((id: number, newWidth: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, width: newWidth } : sticker
      )
    );
    updateSticker(id, { width: newWidth });
  }, [updateSticker]);

  const rotateSticker = useCallback((id: number, newRotation: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, rotation: newRotation } : sticker
      )
    );
    updateSticker(id, { rotation: newRotation });
  }, [updateSticker]);

  const deleteSticker = useCallback((id: number) => {
    setStickers((prev) => prev.filter((sticker) => sticker.id !== id));
    deleteStickerById(id);
  }, []);

  useEffect(() => {
    loadGridBg().then((savedColor) => {
      if (savedColor) setGridBg(savedColor);
    });
    loadAllStickers().then(async (saved) => {
      const hydrated = await Promise.all(
        saved.map(async (s) => {
          const aspectRatio = s.aspectRatio || 1;
          
          return {
            ...s,
            src: s.isLabel ? s.imageName : (await loadImageByName(s.imageName)) || "",
            moveSticker,
            resizeSticker,
            rotateSticker,
            deleteSticker,
            active: false,
            setActiveSticker: setActiveStickerId,
            aspectRatio,
          };
        })
      );
      setStickers(hydrated);
    });
  }, [moveSticker, resizeSticker, rotateSticker, deleteSticker]);

  const addSticker = (imageName: string, isLabel: boolean) => {
    loadImageByName(imageName).then((blobUrl) => {
      const tempImg = new window.Image();
      tempImg.onload = () => {
        const aspectRatio = tempImg.naturalHeight / tempImg.naturalWidth;
        const standardWidth = 40;
  
        const newSticker: StickerData = {
          id: Date.now(),
          imageName,
          src: isLabel ? imageName : (blobUrl || ''),
          x: 50 - standardWidth / 2,
          y: 50 - (aspectRatio * standardWidth) / 2,
          width: standardWidth,
          aspectRatio: aspectRatio,
          rotation: 0,
          isLabel,
          moveSticker,
          resizeSticker,
          rotateSticker,
          deleteSticker,
          active: true,
          setActiveSticker: setActiveStickerId,
        };
        setStickers((prev) => [...prev, newSticker]);
        const stickerData = { ...newSticker };
        saveSticker(extractStoredFields(stickerData));
      };
  
      tempImg.src = isLabel ? `/sites/blue/stickers/${imageName}` : (blobUrl || '');
    });
  };

  const setMenu = (menu: string) => {
    setMenuSelection(menu);
    setActiveStickerId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteStickerById(id);
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const uniqueCount = Array.from(
    new Set(
      stickers
        .filter(sticker => !sticker.isLabel)
        .map(sticker => sticker.imageName)
    )
  ).length;

  const handleFinishClick = () => {
    setShowFinishHint(true);
  };

  const handleAnyClick = () => {
    if (showFinishHint) setShowFinishHint(false);
  };

  return (
    <div
      className='relative h-[100svh] w-[100svw] grid-bg-gray flex flex-col justify-center items-center bg-gray-500 overflow-hidden gap-[0.5svh]'
      onClick={handleAnyClick}
    >
      
      {/* Header row with back + finish button */}
      <div className='w-[42.75svh] h-[9svh] py-[2.3svh] flex flex-row justify-between items-center relative'>
        <button
          onClick={() => router.back()}
          className='bg-warm-white border-2 border-blue-3 flex justify-center items-center rounded-full w-fit h-fit px-3 py-2'
        >
          <Image
            src='/sites/blue/icons/arrow-stroke.svg'
            className='w-4 h-fit'
            width={100}
            height={100}
            alt='back'
          />
        </button>
        <div onClick={handleFinishClick}>
          <FinishHuntButton objectsFound={uniqueCount}/>
        </div>

        {uniqueCount < 3 && (
          <div
            onClick={e => e.stopPropagation()}
            className={`
              absolute
              bottom-0
              right-[4svh]
              translate-x-[20%]
              translate-y-[80%]
              flex
              flex-col
              items-start
              z-50

              transition-opacity
              duration-300
              ease-in-out

              ${showFinishHint
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
              }
            `}
          >
            {/* triangle “carrot” */}
            <div
              className="
                w-0 h-0
                border-l-[1svh] border-l-transparent
                border-r-[1svh] border-r-transparent
                border-b-[1svh] border-b-green
                mb-[-1px]
                ml-[27svh]
              "
            />

            {/* modal box */}
            <div
              className="
                bg-green
                text-white
                text-[14px]
                font-body1
                rounded-[8px]
                py-1
                px-2
                shadow-lg
              "
            >
              Place at least three unique artifact stickers to finish your hunt!
            </div>
          </div>
        )}
      </div>

      <div
        ref={boardRef}
        id="sticker-board"
        className='w-[42.75svh] h-[76svh] grid-bg rounded-[1svh] shadow-lg relative overflow-hidden'
        style={{ backgroundColor: gridBg }}
      >
        {stickers.map((sticker) => (
          <Sticker
            key={sticker.id}
            id={sticker.id}
            src={sticker.src}
            x={sticker.x}
            y={sticker.y}
            width={sticker.width || 10}
            aspectRatio={sticker.aspectRatio || 1}
            rotation={sticker.rotation || 0}
            isLabel={sticker.isLabel}
            isSelected={sticker.id === activeStickerId}
            onSelect={setActiveStickerId}
            onChange={(id, changes) => updateSticker(id, changes)}
            onDelete={(id) => handleDelete(id)}
          />
        ))}
      </div>

      <div className="border-black p-[2svh] min-h-[10svh] flex justify-center items-center">

        {/* modals for menu items */}
        {menuSelection && (
          <Modal
            setMenuSelection={setMenuSelection}
            addSticker={menuSelection !== "grid" ? addSticker : undefined}
            setGridBg={menuSelection === "grid" ? handleGridChange : undefined}
            menuSelection={menuSelection}
          />
        )}

        <div id="sticker-bar" className="round-button w-full flex flex-row justify-center items-center p-[1.3svh] px-[2.3svh] gap-[1.5svh] rounded-full">
          <button className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'sticker' ? 'bg-blue-1' : 'bg-blue-5'}`} onClick={() => setMenu('sticker')}>
            <Image
              src={menuSelection === 'sticker' ? '/sites/blue/stickerboard/sticker-button-alt.svg' : '/sites/blue/stickerboard/sticker-button.svg'}
              alt="sticker button"
              width={50}
              height={50}
              className="object-contain"
            />
          </button>

          <button className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'label' ? 'bg-blue-1' : 'bg-blue-5'}`} onClick={() => setMenu('label')}>
            <Image
              src={menuSelection === 'label' ? '/sites/blue/stickerboard/label-button-alt.svg' : '/sites/blue/stickerboard/label-button.svg'}
              alt="label button"
              width={50}
              height={50}
              className="object-contain"
            />
          </button>

          <button className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'grid' ? 'bg-blue-1' : 'bg-blue-5'}`} onClick={() => setMenu('grid')}>
            <Image
              src={menuSelection === 'grid' ? '/sites/blue/stickerboard/grid-button-alt.svg' : '/sites/blue/stickerboard/grid-button.svg'}
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
