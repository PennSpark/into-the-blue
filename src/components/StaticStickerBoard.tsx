// /components/StaticStickerBoard.tsx
'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { loadAllStickers, loadImageByName, loadGridBg } from '@/app/context/IndexedDB';

interface StoredSticker {
  id: number;
  imageName: string;
  x: number;           // percent
  y: number;           // percent
  width: number;       // percent
  aspectRatio: number; // height/width ratio
  rotation: number;    // degrees
  isLabel: boolean;
}

interface HydratedSticker extends StoredSticker {
  src: string;
}

interface StaticStickerBoardProps {
  width?: number;   // px
  height?: number;  // px
}

export default function StaticStickerBoard({ width, height }: StaticStickerBoardProps) {
  const [stickers, setStickers] = useState<HydratedSticker[]>([]);
  const [gridBg, setGridBg] = useState<string>('var(--Warm-White)');

  useEffect(() => {
    // Load grid background
    loadGridBg().then(color => {
      if (color) setGridBg(color);
    });

    // Load & hydrate all stickers
    loadAllStickers().then(async (saved: StoredSticker[]) => {
      const hydrated = await Promise.all(
        saved.map(async s => {
          let src: string;
          if (s.isLabel) {
            // If it's already a full path, use it; otherwise prefix it
            src = s.imageName.startsWith('/')
              ? s.imageName
              : `/sites/blue/stickers/${s.imageName}`;
          } else {
            src = (await loadImageByName(s.imageName)) || '';
          }
          return { ...s, src };
        })
      );
      setStickers(hydrated);
    });
  }, []);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width:  width  != null ? `${width}px`  : '100%',
    height: height != null ? `${height}px` : '100%',
    backgroundColor: gridBg,
    overflow: 'hidden',
    pointerEvents: 'none', // disable all interaction
  };

  return (
    <div
      id="sticker-board-static"
      className="grid-bg relative"
      style={containerStyle}
    >
      {stickers.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left:   `${s.x}%`,
            top:    `${s.y}%`,
            width:  `${s.width}%`,
            transform:       `rotate(${s.rotation}deg)`,
            transformOrigin: 'top left',
          }}
        >
          <img
            src={s.src}
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ))}
    </div>
  );
}
