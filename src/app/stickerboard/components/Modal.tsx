import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface ModalProps {
  setMenuSelection: (menu: string | null) => void;
  addSticker?: (stickerId: string, isLabel: boolean) => void;
  setGridBg?: (color: string) => void;
  menuSelection: string | null;
}

export default function Modal({ setMenuSelection, addSticker, setGridBg, menuSelection }: ModalProps) {
  const sections = ["sticker", "label", "grid"];
  const [currentIndex, setCurrentIndex] = useState(sections.indexOf(menuSelection ?? "sticker"));
  const touchStartX = useRef<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

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

  const imageList = [
    "ani.png", "april.png", "estelle.png", "joyce.png",
    "mei.png", "nick.png", "ruth.png", "xue.png",
    "ani.png", "april.png", "estelle.png", "joyce.png",
    "mei.png", "nick.png", "ruth.png", "xue.png",
    "ani.png", "april.png", "estelle.png", "joyce.png",
    "mei.png", "nick.png", "ruth.png", "xue.png",
  ];

  const bgColors = [
    "#FFDDC1", "#FFABAB", "#FFC3A0", "#D5AAFF",
    "#85E3FF", "#B9FBC0", "#FFF1AA", "#FFD1E3",
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
    <div id="contents" className="w-full h-[65svh] overflow-y-scroll">
        {menuSelection === "sticker" && addSticker && (
        <div className="flex grid grid-cols-3 gap-[1.5svh] w-full">
        {imageList.map((image, index) => (
            <div
            key={index}
            onClick={() => {
                addSticker(image, false);
                setMenuSelection(null);
            }}
            className="cursor-pointer shadow-lg w-full aspect-square"
            style={{
                backgroundImage: `url(/images/${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            ></div>
        ))}
        </div>
        )}

        {/* Labels Section */}
        {menuSelection === "label" && addSticker && (
            <div className="flex grid grid-cols-3 gap-[1.5svh] w-full">
            {imageList.map((image, index) => (
                <div
                key={index}
                onClick={() => {
                    addSticker(image, true);
                    setMenuSelection(null);
                }}
                className="cursor-pointer shadow-lg w-full aspect-square"
                style={{
                    backgroundImage: `url(/images/${image})`,
                    backgroundSize: "cover",
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
