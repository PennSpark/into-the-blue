export default function LabelModal() {
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
        <div className="absolute w-[45svh] h-[80svh] backdrop-blur-md rounded-[4svh] top-[6.32svh] z-[5] flex flex-wrap p-[5svh] gap-[1.5svh]">
            {imageList.map((image, index) => (
                <div key={index} 
                className="w-[10svw] bg-gray-300 rounded-[1.5svw] shadow-lg" style={{backgroundImage: `url(/images/${image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
            ))}

        </div>
    );
}