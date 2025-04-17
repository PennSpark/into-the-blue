import React, { useRef, useEffect, useState } from 'react';

interface StickerProps {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  aspectRatio: number;
  rotation: number;
  isLabel: boolean;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
  onChange: (
    id: number,
    props: { x: number; y: number; width: number; rotation: number }
  ) => void;
}

const Sticker: React.FC<StickerProps> = ({
  id,
  src,
  x,
  y,
  width,
  aspectRatio,
  rotation,
  isLabel,
  isSelected,
  onSelect,
  onChange,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [rotating, setRotating] = useState(false);

  const [stickerHeightPercent, setStickerHeightPercent] = useState(width * aspectRatio);

  useEffect(() => {
    if (!ref.current || !ref.current.parentElement) return;
    const parent = ref.current.parentElement.getBoundingClientRect();
    const widthPx = (width / 100) * parent.width;
    const heightPx = widthPx * aspectRatio;
    const heightPercent = (heightPx / parent.height) * 100;
    setStickerHeightPercent(heightPercent);
  }, [width, aspectRatio]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        onSelect(null);
      }
    }
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.classList.contains('resize-handle') ||
      target.classList.contains('rotate-handle')
    ) {
      return; // prevent drag when clicking handle
    }

    if (!ref.current || !ref.current.parentElement) return;

    const parentRect = ref.current.parentElement.getBoundingClientRect();
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x, y };
    setDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current || !ref.current.parentElement) return;
    const parentRect = ref.current.parentElement.getBoundingClientRect();

    if (dragging) {
      const dx = e.clientX - startMouseRef.current.x;
      const dy = e.clientY - startMouseRef.current.y;
      const dxPercent = (dx / parentRect.width) * 100;
      const dyPercent = (dy / parentRect.height) * 100;
      const newX = initialPosRef.current.x + dxPercent;
      const newY = initialPosRef.current.y + dyPercent;
      onChange(id, { x: newX, y: newY, width, rotation });
    }

    if (resizing) {
      const dx = e.clientX - startMouseXRef.current;
      const dy = e.clientY - startMouseYRef.current;
      const angleRad = (-rotation * Math.PI) / 180;
      const localDx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
      const dxPercent = (localDx / parentRect.width) * 100;
      const newWidth = initialWidthRef.current + dxPercent;
      onChange(id, { x, y, width: newWidth, rotation });
    }

    if (rotating) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const currentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const delta = currentAngle - startAngleRef.current;
      const newRotation = initialRotationRef.current + delta;
      onChange(id, { x, y, width, rotation: newRotation });
    }
  };

  const stopActions = () => {
    setDragging(false);
    setResizing(false);
    setRotating(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopActions);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopActions);
    };
  });

  const initialRotationRef = useRef(rotation);
  const startAngleRef = useRef(0);
  const initialWidthRef = useRef(width);
  const startMouseXRef = useRef(0);
  const startMouseYRef = useRef(0);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${stickerHeightPercent}%`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        border: isSelected ? '2px solid #4A90E2' : 'none',
        boxSizing: 'border-box',
        backgroundImage: isLabel
          ? `url(/sites/blue/stickers/${src})`
          : `url(${src})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {isSelected && (
        <>
          {/* Corner Dots */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: '-6px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4A90E2',
              zIndex: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4A90E2',
              zIndex: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '-6px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4A90E2',
              zIndex: 10,
            }}
          />

          {/* Connector line for rotate handle */}
<div
  style={{
    position: 'absolute',
    top: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '2px',
    height: '16px',
    backgroundColor: '#4A90E2',
    zIndex: 5,
  }}
/>

          {/* Rotate Handle */}
          <div
            className="rotate-handle"
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!ref.current) return;
              const rect = ref.current.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const dx = e.clientX - centerX;
              const dy = e.clientY - centerY;
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              startAngleRef.current = angle;
              initialRotationRef.current = rotation;
              setRotating(true);
            }}
            style={{
              position: 'absolute',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '14px',
              height: '14px',
              backgroundColor: 'white',
              border: '2px solid #4A90E2',
              borderRadius: '50%',
              cursor: 'grab',
              zIndex: 10,
            }}
          />

          {/* Resize Handle */}
          <div
            className="resize-handle"
            onMouseDown={(e) => {
              e.stopPropagation();
              if (!ref.current) return;
              initialWidthRef.current = width;
              startMouseXRef.current = e.clientX;
              startMouseYRef.current = e.clientY;
              setResizing(true);
            }}
            style={{
              position: 'absolute',
              width: '18px',
              height: '18px',
              right: '-9px',
              bottom: '-9px',
              backgroundColor: 'white',
              borderRadius: '50%',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'nwse-resize',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
  {/* Top-left facing triangle */}
  <div
    style={{
      position: 'absolute',
      top: '4px',
      left: '4px',
      width: 0,
      height: 0,
      borderTop: '6px solid #4A90E2',
      borderRight: '6px solid transparent',
      transform: 'rotate(-45deg)',
    }}
  />

  {/* Bottom-right facing triangle */}
  <div
    style={{
      position: 'absolute',
      bottom: '4px',
      right: '4px',
      width: 0,
      height: 0,
      borderBottom: '6px solid #4A90E2',
      borderLeft: '6px solid transparent',
      transform: 'rotate(-45deg)',
    }}
  />
</div>

          </div>
        </>
      )}
    </div>
  );
};

export default Sticker;
