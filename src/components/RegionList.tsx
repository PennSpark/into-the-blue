'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Region {
  name: string;
  displayName: string;
  path: string;
}

interface RegionListProps {
  regions: Region[];
}

const RegionList: React.FC<RegionListProps> = ({ regions }) => {
  const router = useRouter();

  const handleRegionClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      {regions.map((region, index) => (
        <div 
          key={index}
          className="bg-stone-100 rounded-lg p-4 flex items-center justify-between cursor-pointer"
          onClick={() => handleRegionClick(region.path)}
        >
          <div className="text-stone-800 font-medium uppercase">{region.displayName}</div> </div>
      ))}
    </div>
  );
};

export default RegionList;