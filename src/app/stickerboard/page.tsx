'use client';

import StickerBoard from './components/StickerBoard';

export default function Home() {
  return (
    <div className='h-[100svh] w-[100svw] pt-[5svh] flex flex-col justify-center items-center bg-gray-300 overflow-hidden'>
          <StickerBoard />
    </div>

  );
}
