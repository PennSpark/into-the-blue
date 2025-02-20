'use client';

import dynamic from 'next/dynamic';

const MuseumGlobe = dynamic(() => import('./MuseumGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading Globe...</div>
    </div>
  ),
});

export default function GlobeWrapper() {
  return <MuseumGlobe />;
}