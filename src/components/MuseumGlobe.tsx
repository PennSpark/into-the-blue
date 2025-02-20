'use client';

import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

interface Region {
  name: string;
  position: [number, number, number];
  color: string;
  path: string;
}

const regions: Region[] = [
  { name: 'Rome', position: [0.8660254, 0.4330127, -0.25], color: '#ff4444', path: '/rome' },
  { name: 'Egypt', position: [0.4330127, -0.25, 0.8660254], color: '#ffbb44', path: '/egypt' },
  { name: 'Asia', position: [-0.8660254, 0.4330127, 0.25], color: '#44ff44', path: '/asia' }
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
            args={[0.15, 32, 32]}
            onPointerOver={() => setHovered(region.name)}
            onPointerOut={() => setHovered(null)}
            onClick={() => handleClick(region)}
            scale={clicked === region.name ? 1.2 : 1}
          >
            <meshPhongMaterial
              color={region.color}
              transparent
              opacity={hovered === region.name ? 0.8 : 0.6}
              emissive={clicked === region.name ? "#ffffff" : "#000000"}
              emissiveIntensity={clicked === region.name ? 0.5 : 0}
            />
          </Sphere>
          <Html position={[0, 0.25, 0]} center>
            <div className={`
              text-white px-2 py-1 rounded text-sm transition-all duration-200
              ${hovered === region.name ? 'bg-black/80 scale-110' : 'bg-black/50'}
              ${clicked === region.name ? 'animate-pulse' : ''}
            `}>
              {region.name}
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