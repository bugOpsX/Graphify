import React, { useState, useEffect, useRef } from 'react';

interface HorizontalSplitResizeHandleProps {
  inspectorHeight: number;
  onInspectorHeightChange: (newHeight: number) => void;
  minHeight?: number;
  maxHeight?: number;
}

export const HorizontalSplitResizeHandle: React.FC<HorizontalSplitResizeHandleProps> = ({
  inspectorHeight,
  onInspectorHeightChange,
  minHeight = 140,
  maxHeight = 520,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startY: number; startHeight: number }>({
    startY: 0,
    startHeight: inspectorHeight,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = {
      startY: e.clientY,
      startHeight: inspectorHeight,
    };
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      dragStartRef.current = {
        startY: e.touches[0].clientY,
        startHeight: inspectorHeight,
      };
      setIsDragging(true);
    }
  };

  const handleDoubleClick = () => {
    // Cycle between compact (160px), normal (260px), and expanded (380px)
    if (inspectorHeight < 200) {
      onInspectorHeightChange(260);
    } else if (inspectorHeight < 320) {
      onInspectorHeightChange(380);
    } else {
      onInspectorHeightChange(160);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartRef.current.startY - e.clientY;
      const calculatedHeight = dragStartRef.current.startHeight + deltaY;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight));
      onInspectorHeightChange(clampedHeight);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const deltaY = dragStartRef.current.startY - e.touches[0].clientY;
        const calculatedHeight = dragStartRef.current.startHeight + deltaY;
        const clampedHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight));
        onInspectorHeightChange(clampedHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight, onInspectorHeightChange]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      className={`mst-horizontal-split-handle ${isDragging ? 'is-dragging' : ''}`}
      title="Drag slidebar up/down to adjust information panel height • Double-click to expand/collapse"
      role="separator"
      aria-orientation="horizontal"
      aria-valuenow={inspectorHeight}
      aria-valuemin={minHeight}
      aria-valuemax={maxHeight}
    >
      <div className="mst-horizontal-split-track">
        <div className="mst-horizontal-split-grip" />
      </div>
    </div>
  );
};
