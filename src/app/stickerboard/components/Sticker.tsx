import React, { useState, useRef, useEffect } from 'react';
import Moveable from 'react-moveable';

interface StickerProps {
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

const Sticker: React.FC<StickerProps> = ({
  isLabel,
  id,
  x,
  y,
  src,
  width,
  rotation,
  moveSticker,
  resizeSticker,
  rotateSticker,
  deleteSticker,
  active,
  setActiveSticker,
}) => {
  const stickerRef = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState({
    translate: [x, y],
    rotate: rotation,
    width: width,
  });

  useEffect(() => {
    setFrame({
      translate: [x, y],
      rotate: rotation,
      width: width,
    });
  }, [x, y, rotation, width]);

  return (
    <>
      <div
        ref={stickerRef}
        style={{
          position: 'absolute',
          left: `${frame.translate[0]}%`,
          top: `${frame.translate[1]}%`,
          width: `${frame.width}%`,
          height: `${frame.width * 300 / 360}%`,
          transform: `rotate(${frame.rotate}deg)`,
          // backgroundImage: `${!isLabel && `url(${src})`}`,
          backgroundImage: `${!isLabel ? `url(${src})` : `url(/stickers/${src})`}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: active ? 'move' : 'pointer',
          border: active ? '2px solid blue' : 'none',
        }}
        onClick={() => setActiveSticker(id)}
      />
      {active && (
        <>
          <Moveable
            target={stickerRef.current}
            draggable
            resizable
            rotatable
            renderDirections={['se']}
            onDrag={({ left, top }) => {
              if (!stickerRef.current || !stickerRef.current.parentElement) return;
              const board = stickerRef.current.parentElement;
              const boardRect = board.getBoundingClientRect();
              const newX = (left / boardRect.width) * 100;
              const newY = (top / boardRect.height) * 100;
              setFrame((prev) => ({ ...prev, translate: [newX, newY] }));
              moveSticker(id, newX, newY);
            }}
              onResize={({ width, height }) => {
                if (!stickerRef.current || !stickerRef.current.parentElement) return;
            
                const board = stickerRef.current.parentElement;
                const boardRect = board.getBoundingClientRect();
                const newWidth = (width / boardRect.width) * 100;
            
                const newHeight = (height / boardRect.height) * 100;

                const finalSize = Math.max(newWidth, newHeight);
            
                setFrame((prev) => ({ ...prev, width: finalSize }));
                resizeSticker(id, finalSize);
            }}
            onRotate={({ beforeRotate }) => {
              setFrame((prev) => ({ ...prev, rotate: beforeRotate }));
              rotateSticker(id, beforeRotate);
            }}
          >
            {/* {isLabel && (
              <div
              
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '2rem',
                }}
              >
                Label
              </div>
            )
                } */}
          </Moveable>
          {/* delete button */}
          <button
            onClick={() => deleteSticker(id)}
            style={{
              position: 'absolute',
              top: `${frame.translate[1]}%`,
              left: `${frame.translate[0] + frame.width}%`,
              transform: 'translate(-50%, -50%)',
              width: '30px',
              height: '30px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              zIndex: 100,
            }}
          >
            X
          </button>
        </>
      )}
    </>
  );
};

export default Sticker;
