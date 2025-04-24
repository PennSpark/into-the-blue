import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function getLineEndpoint(section: MapSection): { x: number; y: number } {
  const labelWidth = section.displayName.length * 8;
  const labelHeight = 18;
  const linePadding = 4;

  if (section.name === 'special-exhibition-egypt' || section.name === 'middle-east') {
    return { x: section.labelX - linePadding, y: section.labelY + linePadding + 12 };
  }

  let x = section.labelX;
  const y = section.labelY + labelHeight / 2;

  if (section.labelX > section.dotX) {
    x = section.labelX - linePadding;
  } else {
    x = section.labelX + labelWidth + linePadding + 8;
  }

  return { x, y };
}

interface Region {
  name: string;
  displayName: string;
  path: string;
  objectsFound: number;
  totalObjects: number;
}

interface MuseumMapProps {
  regions: Region[];
}

interface MapSection extends Region {
  x: number;
  y: number;
  width: number;
  height: number;
  labelX: number;
  labelY: number;
  dotX: number;
  dotY: number;
}

// Level Label component
const LevelLabel: React.FC<{
  topWord: string;
  bottomWord: string;
  top: number;
}> = ({ topWord, bottomWord, top }) => {
  return (
    <div 
      className="absolute font-dm-sans"
      style={{
        left: 30,
        top,
        fontSize: '17px',
        letterSpacing: '-0.02em',
        lineHeight: '1.2',
        textAlign: 'left',
        fontWeight: 900,
        color: 'rgba(51, 61, 55, 0.5)'
      }}
    >
      {topWord}<br />{bottomWord}
    </div>
  );
};

const DecorativeShape: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius?: string;
  rotate?: number;
  skew?: { x: number; y: number };
}> = ({ x, y, width, height, backgroundColor, borderRadius, rotate, skew }) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const transformParts: string[] = [];
  if (skew) transformParts.push(`skew(${skew.x}deg, ${skew.y}deg)`);
  if (rotate) transformParts.push(`rotate(${rotate}deg)`);
  const transform = transformParts.join(' ');

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backgroundColor,
        borderRadius: borderRadius || '0',
        transform,
        transformOrigin: `${centerX}px ${centerY}px`,
        pointerEvents: 'none',
      }}
    />
  );
};

interface PopupProps {
  section: MapSection;
  position: { x: number; y: number };
}

const Popup: React.FC<PopupProps> = ({ section, position }) => {
  const isAssyria = section.name === 'assyria';
  const allFound = section.objectsFound === section.totalObjects && section.totalObjects > 0;
  
  return (
    <div
      className="absolute z-10"
      style={{
        left: position.x,
        top: position.y,
        transform: isAssyria ? 'translate(-50%, -100%)' : 'translateX(-50%)',
      }}
    >
      <div className="relative">
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={
            isAssyria
              ? {
                  bottom: '-8px',
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '10px solid #3E65C8',
                }
              : {
                  top: '-8px',
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '10px solid #3E65C8',
                }
          }
        />
        <div className="bg-[#3E65C8] text-center rounded-xl py-1.5 px-3" style={{ minWidth: '120px' }}>
          <h3 className="text-white font-medium text-lg">{section.displayName}</h3>
          <p className="text-white text-s mt-0">
            {allFound 
              ? 'All Objects Found!' 
              : `${section.objectsFound}/${section.totalObjects} Objects`}
          </p>
        </div>
      </div>
    </div>
  );
};

const MuseumMap: React.FC<MuseumMapProps> = ({ regions }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const router = useRouter();
  const xOffset = 215;

  const sectionPositions: Record<string, Omit<MapSection, keyof Region>> = {
    'into-the-blue': { x: 262, y: 237, width: 100, height: 40, dotX: 310, dotY: 250, labelX: 355, labelY: 268 },
    etruscan: { x: 336, y: 179, width: 46, height: 50, dotX: 357, dotY: 195, labelX: 245, labelY: 170 },
    greece: { x: 365, y: 198, width: 46, height: 50, dotX: 385, dotY: 215, labelX: 425, labelY: 230 },
    rome: { x: 375, y: 165, width: 100, height: 25, dotX: 420, dotY: 170, labelX: 320, labelY: 125 },
    'eastern-mediterranean': { x: 410, y: 140, width: 100, height: 25, dotX: 455, dotY: 145, labelX: 515, labelY: 175 },
    asia: { x: 380, y: 65, width: 90, height: 40, dotX: 425, dotY: 80, labelX: 345, labelY: 50 },
    'egypt': { x: 485, y: 90, width: 100, height: 35, dotX: 530, dotY: 100, labelX: 570, labelY: 60 },
    'middle-east': { x: 410, y: 300, width: 190, height: 40, dotX: 495, dotY: 310, labelX: 535, labelY: 275 },
    'north-america': { x: 350, y: 345, width: 100, height: 30, dotX: 400, dotY: 355, labelX: 470, labelY: 385 },
    'mexico-central-america': { x: 310, y: 375, width: 100, height: 30, dotX: 360, dotY: 385, labelX: 410, labelY: 410 },
    africa: { x: 270, y: 405, width: 100, height: 30, dotX: 320, dotY: 415, labelX: 400, labelY: 460 },
    assyria: { x: 340, y: 540, width: 100, height: 70, dotX: 390, dotY: 565, labelX: 450, labelY: 595 },
  };

  const missingPositions = regions
  .map((r) => r.name)
  .filter((name) => !sectionPositions[name]);

if (missingPositions.length > 0) {
  console.warn('⚠️ Missing sectionPositions for:', missingPositions);
}
  const mapSections: MapSection[] = regions.map((region) => {
    const pos = sectionPositions[region.name];
    const overrideDisplayName = region.name === 'egypt' ? 'Egypt' : region.displayName;
    return {
      ...region,
      displayName: overrideDisplayName,
      x: pos.x - xOffset,
      y: pos.y,
      width: pos.width,
      height: pos.height,
      dotX: pos.dotX - xOffset,
      dotY: pos.dotY,
      labelX: pos.labelX - xOffset,
      labelY: pos.labelY,
    };
  });

  // Modified toggle function with fixed auto-navigation
  const toggleSection = (sectionName: string, path: string) => {
    setActiveSection(sectionName);
    
    setTimeout(() => {
      router.push(path);
    }, 345); 
  };

  const getPopupPosition = (section: MapSection) => {
    const centerX = section.x + section.width / 2;
    return section.name === 'assyria'
      ? { x: centerX, y: section.y - 20 }
      : { x: centerX, y: section.y + section.height + 20 };
  };

  // Background clicks no longer cancel navigation
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveSection(null);
    }
  };

  const renderShadows = () =>
    mapSections.map((section) => {
      const isActive = activeSection === section.name;
      const centerX = section.width / 2;
      const centerY = section.height / 2;
      return (
        <div
          key={`${section.name}-shadow`}
          className={`absolute transition-all duration-300 ease-out ${
            isActive
              ? 'bg-blue1 shadow-m' // active classes, no border
              : 'bg-blue5 hover:bg-blue2 border-[1.5px] border-[#bdcaf0] border-dashed' // inactive classes, with border
          }`}
          style={{
            left: section.x,
            top: section.y + 18,
            width: section.width,
            height: section.height * 1.1,
            backgroundColor: '#e9e6de',
            transform: `skew(-45deg) rotate(22deg) ${isActive ? 'translateY(-5px)' : ''}`,
            transformOrigin: `${centerX}px ${centerY}px`,
            borderRadius: '10%',
            zIndex: 0,
            opacity: isActive ? 0.7 : 0.5,
          }}
        />
      );
    });

  const renderSections = () =>
    mapSections.map((section) => {
      const isActive = activeSection === section.name;
      const centerX = section.width / 2;
      const centerY = section.height / 2;
      return (
        <div key={section.name}>
          <div
            className={`absolute border-[1.5px] transition-all duration-300 ease-out ${
              isActive ? 'bg-blue1 shadow-m' : 'bg-blue5 hover:bg-blue2'
            }`}
            style={{
              left: section.x,
              top: section.y,
              width: section.width,
              height: section.height,
              transform: `skew(-45deg) rotate(22deg) ${isActive ? 'translateY(-5px)' : ''}`,
              cursor: 'pointer',
              transformOrigin: `${centerX}px ${centerY}px`,
              borderRadius: '10%',
              zIndex: isActive ? 50 : 1,
              borderColor: '#bdcaf0', 
            }}
            onClick={() => toggleSection(section.name, section.path)}
          />
          {!isActive && (
            <div
              className="absolute text-blue1 font-medium transition-opacity duration-300 z-2"
              style={{
                left: section.labelX,
                top: section.labelY,
                whiteSpace: section.name === 'eastern-mediterranean' ? 'normal' : 'nowrap',
                maxWidth: '120px',
              }}
            >
              {section.displayName}
            </div>
          )}
          {!isActive && (
            <div
              className="absolute bg-blue4 rounded-full w-2 h-2 transition-opacity duration-300"
              style={{ left: section.dotX, top: section.dotY, zIndex: 2 }}
            />
          )}
          {!isActive && (
            <svg
              className="absolute pointer-events-none transition-opacity duration-300"
              style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 2 }}
            >
              {(() => {
                const { x: lineEndX, y: lineEndY } = getLineEndpoint(section);
                return (
                  <line
                    x1={section.dotX + 4}
                    y1={section.dotY + 4}
                    x2={lineEndX}
                    y2={lineEndY}
                    stroke="#355DC3"
                    strokeWidth="1"
                  />
                );
              })()}
            </svg>
          )}
          {isActive && <Popup section={section} position={getPopupPosition(section)} />}
        </div>
      );
    });

  return (
    <>
    <p className="w-full max-w-md flex flex-col gap-[16px] pb-[16px] text-center font-semibold text-gray1">Select the gallery you're visiting!</p>
    <div className="relative w-full" style={{ height: 'calc(100vh - 280px)' }}>
      <div style={{ transform: 'scale(0.81)', transformOrigin: 'top left' }}>
        <div className="relative" style={{ height: 800, width: '100%', minWidth: '100%' }} onClick={handleBackgroundClick}>
          {/* Level Labels */}
          <LevelLabel topWord="UPPER" bottomWord="LEVEL" top={100} />
          <LevelLabel topWord="MAIN" bottomWord="LEVEL" top={340} />
          <LevelLabel topWord="LOWER" bottomWord="LEVEL" top={520} />
          
          {renderShadows()}
          <DecorativeShape x={172} y={323} width={100} height={22} backgroundColor="#BCCAF0" borderRadius="10%" rotate={22} skew={{ x: -45, y: 0 }} />
          <DecorativeShape x={210} y={118} width={125} height={18} backgroundColor="#BCCAF0" borderRadius="10%" rotate={22} skew={{ x: -45, y: 0 }} />
          <DecorativeShape x={201} y={503} width={100} height={40} backgroundColor="#BCCAF0" borderRadius="10%" rotate={22} skew={{ x: -45, y: 0 }} />
          {renderSections()}
        </div>
      </div>
    </div>
    </>
  );
};

export default MuseumMap;