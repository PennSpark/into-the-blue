'use client';

import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

interface Region {
  name: string;
  displayName: string;
  position: [number, number, number];
  color: string;
  path: string;
  totalObjects: number;
}

const regions: Region[] = [
  { 
    name: 'into-the-blue', 
    displayName: 'Into the Blue', 
    position: [0, 0.9, 0.1], 
    color: '#4da6ff', 
    path: '/exhibit/into-the-blue',
    totalObjects: 1
  },
  { 
    name: 'etruscan', 
    displayName: 'Etruscan', 
    position: [0.7, 0.7, 0], 
    color: '#cd853f', 
    path: '/exhibit/etruscan',
    totalObjects: 1
  },
  { 
    name: 'greece', 
    displayName: 'Greece', 
    position: [0.9, 0.1, 0.3], 
    color: '#3f7cd8', 
    path: '/exhibit/greece',
    totalObjects: 2
  },
  { 
    name: 'rome', 
    displayName: 'Rome', 
    position: [0.8, -0.3, 0.4], 
    color: '#b22222', 
    path: '/exhibit/rome',
    totalObjects: 5
  },
  { 
    name: 'eastern-mediterranean', 
    displayName: 'E. Mediterranean', 
    position: [0.5, -0.6, 0.5], 
    color: '#20b2aa', 
    path: '/exhibit/eastern-mediterranean',
    totalObjects: 4
  },
  { 
    name: 'asia', 
    displayName: 'Asia', 
    position: [-0.3, -0.8, 0.4], 
    color: '#ff8c00', 
    path: '/exhibit/asia',
    totalObjects: 2
  },
  { 
    name: 'special-exhibition-egypt', 
    displayName: 'Egypt', 
    position: [0.2, 0.2, -0.9], 
    color: '#daa520', 
    path: '/exhibit/egypt',
    totalObjects: 3
  },
  { 
    name: 'middle-east', 
    displayName: 'Middle East', 
    position: [-0.4, 0.3, -0.8], 
    color: '#9370db', 
    path: '/exhibit/middle-east',
    totalObjects: 9
  },
  { 
    name: 'north-america', 
    displayName: 'North America', 
    position: [-0.8, 0.4, -0.3], 
    color: '#32cd32', 
    path: '/exhibit/north-america',
    totalObjects: 4
  },
  { 
    name: 'mexico-central-america', 
    displayName: 'Mexico & C. America', 
    position: [-0.9, -0.1, -0.2], 
    color: '#ff6347', 
    path: '/exhibit/mexico-central-america',
    totalObjects: 1
  },
  { 
    name: 'africa', 
    displayName: 'Africa', 
    position: [-0.6, -0.7, -0.2], 
    color: '#8b4513', 
    path: '/exhibit/africa',
    totalObjects: 4
  },
];

const Globe = ({ onRegionClick }: { onRegionClick: (region: Region) => void }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [clicked, setClicked] = useState<string | null>(null);
  const globeRef = useRef<THREE.Mesh>(null);

  const handleClick = (region: Region) => {
    setClicked(region.name);
    onRegionClick(region);
    
    setTimeout(() => setClicked(null), 500);
  };

  return (
    <group>
      {/* Base globe */}
      <Sphere args={[1, 64, 64]} ref={globeRef}>
        <meshPhongMaterial
          color="#1e4d6d"
          transparent
          opacity={0.9}
          wireframe
        />
      </Sphere>

      {/* Interactive regions */}
      {regions.map((region, index) => (
        <group key={index} position={region.position}>
          <Sphere 
            args={[0.12, 32, 32]}
            onPointerOver={() => setHovered(region.name)}
            onPointerOut={() => setHovered(null)}
            onClick={() => handleClick(region)}
            scale={clicked === region.name ? 1.2 : hovered === region.name ? 1.1 : 1}
          >
            <meshPhongMaterial
              color={region.color}
              transparent
              opacity={hovered === region.name ? 0.9 : 0.7}
              emissive={clicked === region.name ? "#ffffff" : "#000000"}
              emissiveIntensity={clicked === region.name ? 0.5 : 0}
            />
          </Sphere>
          <Html position={[0, 0.2, 0]} center distanceFactor={8}>
            <div className={`
              text-white px-2 py-1 rounded text-xs transition-all duration-200 text-center
              ${hovered === region.name ? 'bg-black/80 scale-110' : 'bg-black/60'}
              ${clicked === region.name ? 'animate-pulse' : ''}
            `}>
              {region.displayName}
              <div className="text-[10px] opacity-80">
                {region.totalObjects} {region.totalObjects === 1 ? 'object' : 'objects'}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

const MuseumGlobe = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleRegionClick = (region: Region) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    console.log(`Navigating to ${region.name}`);
    
    setTimeout(() => {
      router.push(region.path);
    }, 500);
  };

  return (
    <div className="w-full h-[80vh] relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        className="bg-gray-900 rounded-xl"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Globe onRegionClick={handleRegionClick} />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI * 0.65}
          minPolarAngle={Math.PI * 0.35}
        />
      </Canvas>
      {isNavigating && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl">
          <div className="text-white text-lg animate-pulse">
            Traveling to exhibit...
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseumGlobe;