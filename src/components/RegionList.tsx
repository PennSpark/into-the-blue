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

  // Heading 3 style with DM Sans font
  const heading3Style = {
    fontFamily: 'DM Sans',
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '-1%',
    lineHeight: '1'
  };

  // Body 3 style for object count text
  const body3Style = {
    fontFamily: 'DM Sans',
    fontSize: '16px',
    fontWeight: 400, // Regular
    letterSpacing: '-2%',
    lineHeight: '1'
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-[16px] pb-[16px]">
      <p className="text-center font-semibold text-gray1">Select the gallery you’re visiting!</p>
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
            className="rounded-xl flex items-center justify-between cursor-pointer relative h-[100px] overflow-hidden bg-blue-3 hover:bg-[#bdcaf0] transition-colors"
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
                  <div className="h-full w-full bg-blue-2"></div>
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
              <div style={heading3Style} className="text-black mb-1">
                {region.displayName}
              </div>
              <div style={body3Style} className="text-gray1">
                {allFound
                  ? 'All Objects Found!'
                  : `${region.objectsFound}/${region.totalObjects} Objects`}
              </div>
            </div>

            {/* Region Icon - Always visible regardless of completion status */}
            {!allFound && (
              <div className="absolute right-0 h-full opacity-70 z-0">
                <img
                  src={`/sites/blue/icons/regions/${region.name
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
            )}

            {/* Checkmark for completed regions with layered circles */}
            {allFound && (
              <div className="absolute top-1/2 transform -translate-y-1/2 z-20" style={{ right: "-15px" }}>
                <div className="flex items-center justify-center">
                  <svg 
                    width="58" 
                    height="58" 
                    viewBox="0 0 40 40" 
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Base white circle */}
                    <circle cx="20" cy="20" r="20" fill="white" />
                    
                    {/* Middle blue circle */}
                    <circle cx="20" cy="20" r="14" fill="#8aaeef" />
                    
                    {/* Inner white circle */}
                    <circle cx="20" cy="20" r="11.5" fill="white" />
                    
                    {/* Blue checkmark in center */}
                    <path 
                      d="M14 20L18 24L26 16"
                      stroke="#8aaeef" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
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
