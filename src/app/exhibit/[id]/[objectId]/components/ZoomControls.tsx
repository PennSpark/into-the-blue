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
      console.log("Touch start", e.touches);
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        e.preventDefault();
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
        e.preventDefault();
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [zoom, minZoom, maxZoom, setZoom]);

  return (
    <div ref={containerRef} className="w-full h-full absolute z-[20] px-[2svh] py-[2svh] touch-none select-none">
    </div>
  );
}
