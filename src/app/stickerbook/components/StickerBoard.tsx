"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

import { saveSticker, loadImageByName, loadAllStickers, loadGridBg, saveGridBg, deleteStickerById } from "@/app/context/IndexedDB";

import Sticker from "./Sticker";

// import StickerModal from "./StickerModal";
// import LabelModal from "./LabelModal";
// import GridModal from "./GridModal";
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
          // Add aspectRatio if it doesn't exist in the saved sticker
          const aspectRatio = s.aspectRatio || 1; // Default to 1 if not present
          
          return {
            ...s,
            src: s.isLabel ? s.imageName : (await loadImageByName(s.imageName)) || "",
            moveSticker,
            resizeSticker,
            rotateSticker,
            deleteSticker,
            active: false,
            setActiveSticker: setActiveStickerId,
            aspectRatio, // Ensure aspectRatio is explicitly included
          };
        })
      );
      setStickers(hydrated);
    });
  }, []);

  const addSticker = (imageName: string, isLabel: boolean) => {
    loadImageByName(imageName).then((blobUrl) => {
      // Use window.Image instead of Image to reference the built-in constructor
      const tempImg = new window.Image();
      tempImg.onload = () => {
        // Calculate the aspect ratio from the actual image
        const aspectRatio = tempImg.naturalHeight / tempImg.naturalWidth;
        const standardWidth = 40; // Keep your standard width
  
        const newSticker: StickerData = {
          id: Date.now(),
          imageName, // save stable ID
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
  
      // Set the source to trigger the onload event
      tempImg.src = isLabel ? `/sites/blue/stickers/${imageName}` : (blobUrl || '');
    });
  };

  const updateSticker = (id: number, changes: Partial<StickerData>) => {
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
  };
  

  const setMenu = (menu: string) => {
    setMenuSelection(menu);
    setActiveStickerId(null);
  };

  const moveSticker = (id: number, newX: number, newY: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, x: newX, y: newY } : sticker
      )
    );
    updateSticker(id, { x: newX, y: newY });
  };

  const resizeSticker = (id: number, newWidth: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, width: newWidth } : sticker
      )
    );
    updateSticker(id, { width: newWidth });
  };

  const rotateSticker = (id: number, newRotation: number) => {
    setStickers((prev) =>
      prev.map((sticker) =>
        sticker.id === id ? { ...sticker, rotation: newRotation } : sticker
      )
    );
    updateSticker(id, { rotation: newRotation });
  };

  const deleteSticker = (id: number) => {
    setStickers((prev) => prev.filter((sticker) => sticker.id !== id));
    deleteStickerById(id);
  };

  const captureStickerboard = async () => {
    const board = boardRef.current;
    if (board) {
      // Clear active sticker controls before capture
      setActiveStickerId(null);

      // Wait for the next frame so active sticker controls aren't visible
      requestAnimationFrame(async () => {
        const scaleFactor = 3;
        const canvas = await html2canvas(board, {
          backgroundColor: null,
          scale: scaleFactor,
          useCORS: true,
        });

        // Convert canvas to Data URL, then to Blob and finally to a File object
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "stickerboard.png", { type: blob.type });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Stickerboard",
            text: "Check out all these artifacts I found at the Penn Museum!",
          });
        } else {
          alert("Sharing is not supported on your device.");
          console.log("Sharing not supported in this browser.");
        }

        console.log("Screenshot captured successfully and share dialog opened!");
      });
    }
  };

  return (
    <div className='relative h-[100svh] w-[100svw] grid-bg-gray flex flex-col justify-center items-center bg-gray-500 overflow-hidden gap-[0.5svh]'>
    <div className='w-[42.75svh] h-[9svh] py-[2.3svh] flex flex-row justify-between items-center'>
      <button onClick={() => router.back()}
        className='round-button h-full flex rounded-full p-[1svh] px-[2svh]'>
        <Image src='/sites/blue/icons/arrow-stroke.svg' className='w-full h-full' width={100} height={100} alt='back' />
      </button>
      <button onClick={captureStickerboard} className='round-button h-full flex rounded-full p-[1svh] px-[2svh]'>
        {/* <span className='text-[2svh]'>I&apos;m done</span> */}
        <Image src='/sites/blue/icons/export-black.svg' className='w-full h-full' width={100} height={100} alt='export' />
      </button>

    </div>
    <div
      ref={boardRef}
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
