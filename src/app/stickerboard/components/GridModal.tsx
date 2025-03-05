interface GridModalProps {
  setMenuSelection: (menu: string | null) => void;
  setGridBg: (color: string) => void;
}

export default function GridModal({ setMenuSelection, setGridBg }: GridModalProps) {
  const bgColors: string[] = [
    "#FFDDC1", "#FFABAB", "#FFC3A0", "#D5AAFF",
    "#85E3FF", "#B9FBC0", "#FFF1AA", "#FFD1E3",
    "#D5AAFF", "#85E3FF", "#B9FBC0", "#FFF1AA", "#FFD1E3"
  ];
      
  return (
    <div className="absolute w-[45svh] h-[80svh] backdrop-blur-md rounded-[4svh] top-[6.32svh] z-[5] flex flex-wrap justify-end p-[5svh] gap-[3svh]">
      <button
        className="w-[7svh] h-[3svh] flex justify-center items-center bg-black rounded-full text-white"
        onClick={() => setMenuSelection(null)}
      >
        Close
      </button>

      <div className="w-full h-full overflow-scroll no-scrollbar flex flex-wrap gap-[1.5svh]">
        {bgColors.map((color, index) => (
          <div
            key={index}
            style={{ backgroundColor: color }}
            className="w-[16.5svh] h-[30svh] rounded-[1.5svw] shadow-lg cursor-pointer"
            onClick={() => {
              setGridBg(color);
              setMenuSelection(null);
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
