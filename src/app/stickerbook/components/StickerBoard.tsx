"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

import {
  saveSticker,
  loadImageByName,
  loadAllStickers,
  loadGridBg,
  saveGridBg,
} from "@/app/context/IndexedDB";

import Sticker from "./Sticker";
import Modal from "./Modal";
import "./stickerboard.css";

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
  imageName: sticker.imageName,
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

  const router = useRouter();

  const handleGridChange = (color: string) => {
    setGridBg(color);
    saveGridBg(color);
  };

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
            active: false,
            setActiveSticker: setActiveStickerId,
            aspectRatio,
          };
        })
      );
      setStickers(hydrated);
    });
  }, []);

  const addSticker = (imageName: string, isLabel: boolean) => {
    loadImageByName(imageName).then((blobUrl) => {
      const tempImg = new window.Image();
      tempImg.onload = () => {
        const aspectRatio = tempImg.naturalHeight / tempImg.naturalWidth;
        const standardWidth = 40;

        const newSticker: StickerData = {
          id: Date.now(),
          imageName,
          src: isLabel ? imageName : blobUrl || '',
          x: 50 - standardWidth / 2,
          y: 50 - (aspectRatio * standardWidth) / 2,
          width: standardWidth,
          aspectRatio,
          rotation: 0,
          isLabel,
          moveSticker,
          resizeSticker,
          rotateSticker,
          active: true,
          setActiveSticker: setActiveStickerId,
        };

        setStickers((prev) => [...prev, newSticker]);
        saveSticker(extractStoredFields(newSticker));
      };

      tempImg.src = isLabel ? `/sites/blue/stickers/${imageName}` : (blobUrl || '');
    });
  };

  const updateSticker = (
    id: number,
    changes: { x?: number; y?: number; width?: number; rotation?: number }
  ) => {
    setStickers((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...changes } : s));
      const current = updated.find((s) => s.id === id);
      if (current) {
        saveSticker(extractStoredFields(current));
      }
      return updated;
    });
  };

  const setMenu = (menu: string) => {
    setMenuSelection(menu);
    setActiveStickerId(null);
  };

  const moveSticker = (id: number, newX: number, newY: number) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s))
    );
    updateSticker(id, { x: newX, y: newY });
  };

  const resizeSticker = (id: number, newWidth: number) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, width: newWidth } : s))
    );
    updateSticker(id, { width: newWidth });
  };

  const rotateSticker = (id: number, newRotation: number) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: newRotation } : s))
    );
    updateSticker(id, { rotation: newRotation });
  };

  const captureStickerboard = async () => {
    const board = boardRef.current;
    if (board) {
      setActiveStickerId(null);
      requestAnimationFrame(async () => {
        const canvas = await html2canvas(board, {
          backgroundColor: null,
          scale: 3,
          useCORS: true,
        });
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "stickerboard.png", { type: blob.type });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Stickerboard",
            text: "Check out all these artifacts I found at the Penn Museum!",
          });
        } else {
          alert("Sharing is not supported on your device.");
        }
      });
    }
  };

  return (
    <div className="relative h-[100svh] w-[100svw] grid-bg-gray flex flex-col justify-center items-center bg-gray-500 overflow-hidden gap-[0.5svh]">
      <div className="w-[42.75svh] h-[9svh] py-[2.3svh] flex flex-row justify-between items-center">
        <button onClick={() => router.back()} className="round-button h-full flex rounded-full p-[1svh] px-[2svh]">
          <Image src="/sites/blue/icons/arrow-stroke.svg" className="w-full h-full" width={100} height={100} alt="back" />
        </button>
        <button onClick={captureStickerboard} className="round-button h-full flex rounded-full p-[1svh] px-[2svh]">
          <Image src="/sites/blue/icons/export-black.svg" className="w-full h-full" width={100} height={100} alt="export" />
        </button>
      </div>

      <div
        ref={boardRef}
        className="w-[42.75svh] h-[76svh] grid-bg rounded-[1svh] shadow-lg relative overflow-hidden"
        style={{ backgroundColor: gridBg }}
      >
        {stickers.map((sticker) => (
          <Sticker
            key={sticker.id}
            id={sticker.id}
            src={sticker.src}
            x={sticker.x}
            y={sticker.y}
            width={sticker.width}
            aspectRatio={sticker.aspectRatio}
            rotation={sticker.rotation}
            isLabel={sticker.isLabel}
            isSelected={sticker.id === activeStickerId}
            onSelect={setActiveStickerId}
            onChange={(id, changes) => updateSticker(id, changes)}
          />
        ))}
      </div>

      <div className="border-black p-[2svh] min-h-[10svh] flex justify-center items-center">
        {menuSelection && (
          <Modal
            setMenuSelection={setMenuSelection}
            addSticker={menuSelection !== "grid" ? addSticker : undefined}
            setGridBg={menuSelection === "grid" ? handleGridChange : undefined}
            menuSelection={menuSelection}
          />
        )}

        <div id="sticker-bar" className="round-button w-full flex flex-row justify-center items-center p-[1.3svh] px-[2.3svh] gap-[1.5svh] rounded-full">
          <button
            className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'sticker' ? 'bg-blue-1' : 'bg-blue-5'}`}
            onClick={() => setMenu('sticker')}
          >
            <Image
              src={menuSelection === 'sticker' ? '/sites/blue/stickerboard/sticker-button-alt.svg' : '/sites/blue/stickerboard/sticker-button.svg'}
              alt="sticker button"
              width={50}
              height={50}
              className="object-contain"
            />
          </button>

          <button
            className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'label' ? 'bg-blue-1' : 'bg-blue-5'}`}
            onClick={() => setMenu('label')}
          >
            <Image
              src={menuSelection === 'label' ? '/sites/blue/stickerboard/label-button-alt.svg' : '/sites/blue/stickerboard/label-button.svg'}
              alt="label button"
              width={50}
              height={50}
              className="object-contain"
            />
          </button>

          <button
            className={`flex w-[4.7svh] h-[4.7svh] rounded-full p-[0.7svh] ${menuSelection === 'grid' ? 'bg-blue-1' : 'bg-blue-5'}`}
            onClick={() => setMenu('grid')}
          >
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
