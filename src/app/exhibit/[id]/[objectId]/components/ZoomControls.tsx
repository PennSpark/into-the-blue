"use client";
import { useRef, useEffect } from "react";

interface ZoomControlsProps {
  zoom: number;
  setZoom: (z: number) => void;
  minZoom: number;
  maxZoom: number;
}

export default function ZoomControls({ zoom, setZoom, minZoom, maxZoom }: ZoomControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistanceRef = useRef<number | null>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);

        const delta = newDistance - initialDistanceRef.current;
        const sensitivity = 0.01;
        let newZoom = zoom + delta * sensitivity;
        newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        setZoom(parseFloat(newZoom.toFixed(2)));

        initialDistanceRef.current = newDistance;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [zoom, minZoom, maxZoom, setZoom]);

  return (
    <div ref={containerRef} className="w-full absolute z-[20] px-[2svh] py-[2svh]">
      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step={0.01}
        value={zoom}
        onChange={(e) => setZoom(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="text-center text-white text-sm mt-2">Zoom: {zoom.toFixed(2)}×</p>
    </div>
  );
}
