import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { loadAllImages } from "../../context/IndexedDB";


interface ModalProps {
  setMenuSelection: (menu: string | null) => void;
  addSticker?: (stickerId: string, isLabel: boolean) => void;
  setGridBg?: (color: string) => void;
  menuSelection: string | null;
}

export default function Modal({ setMenuSelection, addSticker, setGridBg, menuSelection }: ModalProps) {
  const sections = ["sticker", "label", "grid"];
  const [savedStickers, setSavedStickers] = useState<{ id: string, url: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(sections.indexOf(menuSelection ?? "sticker"));
  const touchStartX = useRef<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  useEffect(() => {
    const fetchStickers = async () => {
      const images = await loadAllImages();
      setSavedStickers(images);
    };
    fetchStickers();
  }, []);

  
  useEffect(() => {
    setCurrentIndex(sections.indexOf(menuSelection ?? "sticker"));
  }, [menuSelection]);

  // Swipe start (record start position)
  const handleSwipeStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // Swipe end (detect direction and update modal)
  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    if (deltaX > 50) {
      handleSwipe("right");
    } else if (deltaX < -50) {
      handleSwipe("left");
    }

    touchStartX.current = null;
  };

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      setCurrentIndex((prevIndex) => {
        let newIndex = direction === "left" ? prevIndex + 1 : prevIndex - 1;
        if (newIndex < 0) newIndex = sections.length - 1;
        if (newIndex >= sections.length) newIndex = 0;

        setSwipeDirection(direction);
        setTimeout(() => {
          setSwipeDirection(null);
          setMenuSelection(sections[newIndex]);
        }, 200); // Small delay for smooth transition
        return newIndex;
      });
    },
    [setMenuSelection]
  );

  const stickerList = [
    "1.png", "4.png",
    "5.png", "6.png", "7.png", 
    "8.png", "9.png", "10.png",
    "11.png", "12.png", "13.png",
  ];

  const bgColors = [
    "#D7E3FF", "#E16161", "#ACDACA", "#FFC531"
  ];

  return (
    <div
      className={`modal transition-transform duration-200 ${
        swipeDirection === "left" ? "animate-slide-left" : swipeDirection === "right" ? "animate-slide-right" : ""
      }`}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
    >
    <div id="top-bar" className="w-full h-[4svh] flex items-center">
    <div className="flex-1"></div>
    <div className="flex gap-[1svh]">
        <div className={`w-[1.5svh] h-[1.5svh] rounded-full ${menuSelection === "sticker" ? "bg-blue-1" : "bg-blue-5"}`}></div>
        <div className={`w-[1.5svh] h-[1.5svh] rounded-full ${menuSelection === "label" ? "bg-blue-1" : "bg-blue-5"}`}></div>
        <div className={`w-[1.5svh] h-[1.5svh] rounded-full ${menuSelection === "grid" ? "bg-blue-1" : "bg-blue-5"}`}></div>
    </div>
    <div className="flex-1 flex justify-end w-[7svh]">
    <button 
        className="flex p-[1svh] justify-end round-button w-[4svh] h-[4svh] rounded-full text-white"
        onClick={() => setMenuSelection(null)}
    >
        <Image src="/icons/x.svg" alt="close" width={50} height={50} />
    </button>
    </div>
    </div>
    <div id="contents" className="w-full h-[65svh] overflow-y-scroll no-scrollbar">
        {menuSelection === "sticker" && addSticker && (
        <div className="flex grid grid-cols-3 gap-[1.5svh] w-full">
          {savedStickers.map(({ id, url }) => (
            <div
              key={id}
              onClick={() => {
                addSticker(id, false); 
                setMenuSelection(null);
              }}
              className="cursor-pointer w-full aspect-[5/6]"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          ))}
        </div>
        )}

        {/* Labels Section */}
        {menuSelection === "label" && addSticker && (
            <div className="flex flex-wrap gap-[1.5svh] w-full">
            {stickerList.map((image, index) => (
                <div
                key={index}
                onClick={() => {
                    addSticker(image, true);
                    setMenuSelection(null);
                }}
                className="cursor-pointer  h-[10svh] w-full"
                style={{
                    backgroundImage: `url(/stickers/${image})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                }}
                ></div>
            ))}
            </div>
        )}

        {/* Grid Backgrounds Section */}
        {menuSelection === "grid" && setGridBg && (
            <div className="flex grid grid-cols-2 gap-[1.5svh] w-full">
            {bgColors.map((color, index) => (
                <div
                key={index}
                style={{ backgroundColor: color }}
                className="w-full aspect-[1/2] cursor-pointer"
                onClick={() => {
                    setGridBg(color);
                    setMenuSelection(null);
                }}
                ></div>
            ))}
            </div>
        )}
        </div>
    </div>
  );
}
