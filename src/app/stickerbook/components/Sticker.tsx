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
  onDelete: (id: number) => void;
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
  onDelete
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
  }, [isSelected, onSelect]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.classList.contains('resize-handle') ||
      target.classList.contains('rotate-handle')
    ) {
      return; // prevent drag when clicking handle
    }

    if (!ref.current || !ref.current.parentElement) return;

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
      // Track both horizontal and vertical movements
      const dx = e.clientX - startMouseXRef.current;
      const dy = e.clientY - startMouseYRef.current;
      
      // Calculate the distance of the drag (using Pythagorean theorem)
      const dragDistance = Math.sqrt(dx * dx + dy * dy);
      
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();

      
      // Calculate the normalized rotation angle (0-360)
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      
      // Calculate the position of the resize handle based on rotation
      // The handle is always in the bottom-right corner of the non-rotated sticker
      // We need to rotate this point around the center based on the sticker's rotation
      const rotationInRadians = (normalizedRotation * Math.PI) / 180;
      
      // Vector to bottom-right corner (handle) in non-rotated state
      const cornerVectorX = rect.width / 2;
      const cornerVectorY = rect.height / 2;
      
      // Rotate this vector by the sticker's rotation angle
      const handleVectorX = 
          cornerVectorX * Math.cos(rotationInRadians) - 
          cornerVectorY * Math.sin(rotationInRadians);
      const handleVectorY = 
          cornerVectorX * Math.sin(rotationInRadians) + 
          cornerVectorY * Math.cos(rotationInRadians);
      
      // Vector of the drag movement
      const dragVectorX = dx;
      const dragVectorY = dy;
      
      // Dot product to determine if vectors are aligned (outward drag) or opposed (inward drag)
      const dotProduct = handleVectorX * dragVectorX + handleVectorY * dragVectorY;
      
      // Convert to parent percentage, with appropriate sign
      const parentRect = ref.current.parentElement.getBoundingClientRect();
      const dragPercent = ((dotProduct > 0 ? dragDistance : -dragDistance) / parentRect.width) * 100;
      
      // Calculate new width based on the change
      const newWidth = Math.max(5, initialWidthRef.current + dragPercent);
      const widthDiff = newWidth - initialWidthRef.current;
      
      if (rotation === 0) {
        // For non-rotated stickers, no position adjustment needed
        onChange(id, { x: initialPosRef.current.x, y: initialPosRef.current.y, width: newWidth, rotation });
      } else {
        // For rotated stickers, calculate the position shift
        const angleRad = (rotation * Math.PI) / 180;
        
        // Calculate the shift needed for the center (half the size change)
        const halfWidthDiff = widthDiff / 2;
        const halfHeightDiff = (widthDiff * aspectRatio) / 2;
        
        // Calculate the rotated shift vectors
        // Note: multiply by -1 to move in the opposite direction of growth
        const rotatedXShift = halfWidthDiff * Math.cos(angleRad) - halfHeightDiff * Math.sin(angleRad);
        const rotatedYShift = halfWidthDiff * Math.sin(angleRad) + halfHeightDiff * Math.cos(angleRad);
        
        // Calculate new position to maintain the top-left corner fixed in rotated space
        const newX = initialPosRef.current.x + rotatedXShift;
        const newY = initialPosRef.current.y + rotatedYShift;
        
        onChange(id, { x: newX, y: newY, width: newWidth, rotation });
      }
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

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // ← Add this
    const target = e.target as HTMLElement;
    if (
      target.classList.contains('resize-handle') ||
      target.classList.contains('rotate-handle')
    ) {
      return;
    }
  
    if (!ref.current || !ref.current.parentElement) return;
    const touch = e.touches[0];
    startMouseRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = { x, y };
    setDragging(true);
  };
  
  
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!ref.current || !ref.current.parentElement) return;
    const parentRect = ref.current.parentElement.getBoundingClientRect();
    const touch = e.touches[0];
  
    if (dragging) {
      const dx = touch.clientX - startMouseRef.current.x;
      const dy = touch.clientY - startMouseRef.current.y;
      const dxPercent = (dx / parentRect.width) * 100;
      const dyPercent = (dy / parentRect.height) * 100;
      const newX = initialPosRef.current.x + dxPercent;
      const newY = initialPosRef.current.y + dyPercent;
      onChange(id, { x: newX, y: newY, width, rotation });
    }
  
    if (resizing) {
      // Track both horizontal and vertical movements
      const dx = touch.clientX - startMouseXRef.current;
      const dy = touch.clientY - startMouseYRef.current;
      
      // Calculate the distance of the drag (using Pythagorean theorem)
      const dragDistance = Math.sqrt(dx * dx + dy * dy);
      
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      
      // Calculate the normalized rotation angle (0-360)
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      
      // Calculate the position of the resize handle based on rotation
      // The handle is always in the bottom-right corner of the non-rotated sticker
      // We need to rotate this point around the center based on the sticker's rotation
      const rotationInRadians = (normalizedRotation * Math.PI) / 180;
      
      // Vector to bottom-right corner (handle) in non-rotated state
      const cornerVectorX = rect.width / 2;
      const cornerVectorY = rect.height / 2;
      
      // Rotate this vector by the sticker's rotation angle
      const handleVectorX = 
          cornerVectorX * Math.cos(rotationInRadians) - 
          cornerVectorY * Math.sin(rotationInRadians);
      const handleVectorY = 
          cornerVectorX * Math.sin(rotationInRadians) + 
          cornerVectorY * Math.cos(rotationInRadians);
      
      // Vector of the drag movement
      const dragVectorX = dx;
      const dragVectorY = dy;
      
      // Dot product to determine if vectors are aligned (outward drag) or opposed (inward drag)
      const dotProduct = handleVectorX * dragVectorX + handleVectorY * dragVectorY;
      
      // Convert to parent percentage, with appropriate sign
      const parentRect = ref.current.parentElement.getBoundingClientRect();
      const dragPercent = ((dotProduct > 0 ? dragDistance : -dragDistance) / parentRect.width) * 100;
      
      // Calculate new width based on the change
      const newWidth = Math.max(5, initialWidthRef.current + dragPercent);
      const widthDiff = newWidth - initialWidthRef.current;
      
      if (rotation === 0) {
        // For non-rotated stickers, no position adjustment needed
        onChange(id, { x: initialPosRef.current.x, y: initialPosRef.current.y, width: newWidth, rotation });
      } else {
        // For rotated stickers, calculate the position shift
        const angleRad = (rotation * Math.PI) / 180;
        
        // Calculate the shift needed for the center (half the size change)
        const halfWidthDiff = widthDiff / 2;
        const halfHeightDiff = (widthDiff * aspectRatio) / 2;
        
        // Calculate the rotated shift vectors
        // Note: multiply by -1 to move in the opposite direction of growth
        const rotatedXShift = halfWidthDiff * Math.cos(angleRad) - halfHeightDiff * Math.sin(angleRad);
        const rotatedYShift = halfWidthDiff * Math.sin(angleRad) + halfHeightDiff * Math.cos(angleRad);
        
        // Calculate new position to maintain the top-left corner fixed in rotated space
        const newX = initialPosRef.current.x + rotatedXShift;
        const newY = initialPosRef.current.y + rotatedYShift;
        
        onChange(id, { x: newX, y: newY, width: newWidth, rotation });
      }
    }
  
    if (rotating) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const currentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const delta = currentAngle - startAngleRef.current;
      const newRotation = initialRotationRef.current + delta;
      onChange(id, { x, y, width, rotation: newRotation });
    }
  };
  

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopActions);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('touchend', stopActions);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopActions);
      window.removeEventListener('touchmove', handleTouchMove);
window.removeEventListener('touchend', stopActions);
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
      onTouchStart={handleTouchStart}
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
        touchAction: 'none'
      }}
    >
      {isSelected && (
        <>
          {/* Top-left Corner Dot */}
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

  
          {/* Top-right Delete Handle */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            style={{
              position: 'absolute',
              top: '-9px',
              right: '-9px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#E16161',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            <img src="/sites/blue/icons/delete.svg" alt="" className="w-8 h-8" />
          </div>
  
          {/* Bottom-left Corner Dot */}
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
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!ref.current) return;
              const touch = e.touches[0];
              const rect = ref.current.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const dx = touch.clientX - centerX;
              const dy = touch.clientY - centerY;
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
              initialPosRef.current = { x, y }; // Add this to capture initial position
              setResizing(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!ref.current) return;
              const touch = e.touches[0];
              initialWidthRef.current = width;
              startMouseXRef.current = touch.clientX;
              startMouseYRef.current = touch.clientY;
              initialPosRef.current = { x, y }; // Add this to capture initial position
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
            <img src="/sites/blue/icons/resize.svg" alt="" className="w-8 h-8" />
            
          </div>
        </>
      )}
    </div>
  );
  
    
};  

export default Sticker;
