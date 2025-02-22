'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StickerBoard from '../components/StickerBoard';

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <h1>Stickerboard</h1> {/* Added a title for context */}
          <StickerBoard />
      </div>
    </DndProvider>
  );
}
