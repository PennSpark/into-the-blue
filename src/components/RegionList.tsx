'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Region {
  name: string;
  displayName: string;
  path: string;
  objectsFound: number;
  totalObjects: number;
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
    <div className="w-full max-w-md flex flex-col gap-[16px] pb-[16px]">
      {regions.map((region, index) => {
        const completionPercentage =
          region.totalObjects > 0
            ? (region.objectsFound / region.totalObjects) * 100
            : 0;
        const allFound =
          region.objectsFound === region.totalObjects && region.totalObjects > 0;

        return (
          <div
            key={index}
            className="rounded-xl flex items-center justify-between cursor-pointer relative h-[100px] overflow-hidden bg-blue-3 black"
            onClick={() => handleRegionClick(region.path)}
          >
            {/* Progress bar */}
            {completionPercentage > 0 && (
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: allFound ? '100%' : `${completionPercentage}%`,
                }}
              >
                {allFound ? (
                  /* Full bar for completed regions */
                  <div
                    className="h-full w-full bg-blue-2"
                  ></div>
                ) : (
                  /* Animated wave edge for incomplete regions */
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  >
                    <path
                      className="fill-blue-2"
                      d="M0,0 L95,0 Q97,20 96,50 Q95,80 95,100 L0,100 Z"
                    >
                      <animate 
                        attributeName="d" 
                        values="
                          M0,0 L95,0 Q97,20 96,50 Q95,80 95,100 L0,100 Z;
                          M0,0 L95,0 Q100,30 95,50 Q90,70 95,100 L0,100 Z;
                          M0,0 L95,0 Q96,25 95,50 Q94,75 95,100 L0,100 Z;
                          M0,0 L95,0 Q92,18 96,50 Q98,82 95,100 L0,100 Z;
                          M0,0 L95,0 Q99,22 95,50 Q91,78 95,100 L0,100 Z;
                          M0,0 L95,0 Q95,20 96,50 Q97,80 95,100 L0,100 Z;
                          M0,0 L95,0 Q97,20 96,50 Q95,80 95,100 L0,100 Z"
                        dur="6s"
                        repeatCount="indefinite"
                        begin={(index % 3) + "s"}
                      />
                    </path>
                  </svg>

                )}
              </div>
            )}

            <div className="flex flex-col p-6 z-10">
              <div className="text-blue-black font-semibold text-lg">
                {region.displayName}
              </div>
              <div className="text-gray-1 text-sm">
                {allFound
                  ? 'All Objects Found!'
                  : `${region.objectsFound}/${region.totalObjects} Objects`}
              </div>
            </div>

            {/* Region Icon - Always visible regardless of completion status */}
            <div className="absolute right-0 h-full opacity-70 z-0 font-FibraOneSemi">
              <img
                src={`/icons/regions/${region.name
                  .toLowerCase()
                  .replace(/\s+/g, '-')}.png`}
                alt={`${region.displayName} icon`}
                className="h-full object-cover object-left"
                style={{ maxWidth: 'none' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Checkmark for completed regions */}
            {allFound && (
              <div className="absolute right-4 z-20">
                <div className="bg-white rounded-full p-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="fill-blue-2"
                      d="M9 16.17L5.53 12.7C5.14 12.31 4.51 12.31 4.12 12.7C3.73 13.09 3.73 13.72 4.12 14.11L8.3 18.29C8.69 18.68 9.32 18.68 9.71 18.29L20.29 7.71C20.68 7.32 20.68 6.69 20.29 6.3C19.9 5.91 19.27 5.91 18.88 6.3L9 16.17Z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RegionList;