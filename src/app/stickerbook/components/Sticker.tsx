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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState({
    translate: [x, y],
    rotate: rotation,
    width: width,
  });

  useEffect(() => {
    setFrame({ translate: [x, y], rotate: rotation, width });
  }, [x, y, rotation, width]);

  const stickerHeight = (frame.width * 300) / 360;

  return (
    <>
      <div
        ref={wrapperRef}
        style={{
          position: 'absolute',
          left: `${frame.translate[0]}%`,
          top: `${frame.translate[1]}%`,
          width: `${frame.width}%`,
          height: `${stickerHeight}%`,
          transform: `rotate(${frame.rotate}deg)`,
        }}
        onClick={() => setActiveSticker(id)}
      >
        {/* Sticker image */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `${!isLabel ? `url(${src})` : `url(/stickers/${src})`}`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            cursor: 'move',
          }}
        />
        {/* Delete button (rotated with sticker) */}
        {active && (
          <button
            onClick={() => deleteSticker(id)}
            style={{
              position: 'absolute',
              top: '-12px',
              right: '-12px',
              width: '24px',
              height: '24px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              zIndex: 100,
              transform: 'rotate(-' + frame.rotate + 'deg)', // counter rotate so it's readable
            }}
          >
            ×
          </button>
        )}
      </div>

      {active && (
        <Moveable
          target={wrapperRef.current}
          draggable
          resizable
          rotatable
          renderDirections={['se']}
          onDrag={({ left, top }) => {
            if (!wrapperRef.current || !wrapperRef.current.parentElement) return;
            const boardRect = wrapperRef.current.parentElement.getBoundingClientRect();
            const newX = (left / boardRect.width) * 100;
            const newY = (top / boardRect.height) * 100;
            setFrame((prev) => ({ ...prev, translate: [newX, newY] }));
            moveSticker(id, newX, newY);
          }}
          onResize={({ width }) => {
            if (!wrapperRef.current || !wrapperRef.current.parentElement) return;
            const boardRect = wrapperRef.current.parentElement.getBoundingClientRect();
            const newWidth = (width / boardRect.width) * 100;
            setFrame((prev) => ({ ...prev, width: newWidth }));
            resizeSticker(id, newWidth);
          }}
          onRotate={({ beforeRotate }) => {
            setFrame((prev) => ({ ...prev, rotate: beforeRotate }));
            rotateSticker(id, beforeRotate);
          }}
        />
      )}
    </>
  );
};

export default Sticker;
