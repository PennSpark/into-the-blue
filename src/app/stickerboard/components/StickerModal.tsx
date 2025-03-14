  interface StickerModalProps {
    setMenuSelection: (menu: string | null) => void;
    addSticker: (stickerId: string, isLabel: boolean) => void;
  }
  
  export default function StickerModal({ setMenuSelection, addSticker }: StickerModalProps) {
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

    return (
    <div className="absolute w-[45svh] h-[80svh] backdrop-blur-md rounded-[4svh] top-[6.32svh] z-[5] flex flex-wrap justify-end p-[5svh] gap-[3svh]">
      <button
        className="w-[7svh] h-[3svh] flex justify-center items-center bg-black rounded-full text-white"
        onClick={() => setMenuSelection(null)}
      >
        close
      </button>
        <div className="w-full h-[65svh] overflow-scroll no-scrollbar flex flex-wrap gap-[1.5svh]">
            {imageList.map((image, index) => (
                <div key={index} 
                onClick={() => {
                    addSticker(image, false);
                    setMenuSelection(null);
                }}
                className="w-[10svw] bg-gray-300 rounded-[1.5svw] shadow-lg" style={{backgroundImage: `url(/images/${image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
            ))}

        </div>
    </div>
    );
}