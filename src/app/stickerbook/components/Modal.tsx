import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { loadAllImages } from "../../context/IndexedDB";


interface ModalProps {
  setMenuSelection: (menu: string | null) => void;
  addSticker?: (stickerId: string, isLabel: boolean) => void;
  setGridBg?: (color: string) => void;
  menuSelection: string | null;
}

export default function Modal({ setMenuSelection, addSticker, setGridBg, menuSelection }: ModalProps) {
  const sections = useMemo(() => ["sticker", "label", "grid"], []);
  const [savedStickers, setSavedStickers] = useState<{ id: string; url: string; }[]>([]);
  const [, setCurrentIndex] = useState(sections.indexOf(menuSelection ?? "sticker"));
  // const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchStickers = async () => {
      const images = await loadAllImages();
      setSavedStickers(images);
    };
    fetchStickers();
  }, []);

  
  useEffect(() => {
    setCurrentIndex(sections.indexOf(menuSelection ?? "sticker"));
  }, [menuSelection, sections]);

  // Swipe start (record start position)
  // const handleSwipeStart = (e: React.TouchEvent) => {
  //   touchStartX.current = e.touches[0].clientX;
  // };

  // Swipe end (detect direction and update modal)
  // const handleSwipeEnd = () => {
    // if (!touchStartX.current) return;
    // const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    // if (deltaX > 50) {
    //   handleSwipe("right");
    // } else if (deltaX < -50) {
    //   handleSwipe("left");
    // }

    // touchStartX.current = null;
  // };

  // const handleSwipe = useCallback(
  //   (direction: "left" | "right") => {
  //     setCurrentIndex((prevIndex) => {
  //       let newIndex = direction === "left" ? prevIndex + 1 : prevIndex - 1;
  //       if (newIndex < 0) newIndex = sections.length - 1;
  //       if (newIndex >= sections.length) newIndex = 0;

  //       setSwipeDirection(direction);
  //       setTimeout(() => {
  //         setSwipeDirection(null);
  //         setMenuSelection(sections[newIndex]);
  //       }, 200); // Small delay for smooth transition
  //       return newIndex;
  //     });
  //   },
  //   [setMenuSelection, sections]
  // );

  const stickerList = [
    "1.webp", "4.webp",
    "5.webp", "7.webp", 
    "8.webp", "9.webp", "10.webp",
    "11-new.webp", "12.webp", "13.webp", "14.webp",
    "15.webp" 
  ];

  const bgColors = [
    "#D7E3FF", "#E16161", "#ACDACA", "#FFC531", "var(--Warm-White)", "#222324"
  ];

  return (
    <div
      className={`modal transition-transform duration-200`}
    >
    <div id="top-bar" className="w-full h-[4svh] flex items-center">
    <div className="flex-1"></div>
    <div className="flex-1 flex justify-end w-[7svh]">
    <button 
        className="flex p-[1svh] justify-end round-button w-[4svh] h-[4svh] rounded-full text-white"
        onClick={() => setMenuSelection(null)}
    >
        <Image src="/sites/blue/icons/x.svg" alt="close" width={50} height={50} />
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
                    backgroundImage: `url(/sites/blue/stickers/${image})`,
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
            <div className="flex grid grid-cols-2 gap-[2svh] w-full">
            {bgColors.map((color, index) => (
                <div
                key={index}
                style={{ backgroundColor: color }}
                className="w-full aspect-[1] cursor-pointer rounded-md"
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
