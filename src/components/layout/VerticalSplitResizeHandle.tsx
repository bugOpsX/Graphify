import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface VerticalSplitResizeHandleProps {
  splitWidth: number;
  onSplitWidthChange: (newWidth: number) => void;
  position?: 'left' | 'right';
}

export const VerticalSplitResizeHandle: React.FC<VerticalSplitResizeHandleProps> = ({
  onSplitWidthChange,
  position = 'right',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const newWidth =
        position === 'right'
          ? Math.max(340, Math.min(windowWidth - e.clientX - 10, windowWidth * 0.65))
          : Math.max(340, Math.min(e.clientX - 10, windowWidth * 0.65));
      onSplitWidthChange(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const windowWidth = window.innerWidth;
        const touchX = e.touches[0].clientX;
        const newWidth =
          position === 'right'
            ? Math.max(340, Math.min(windowWidth - touchX - 10, windowWidth * 0.65))
            : Math.max(340, Math.min(touchX - 10, windowWidth * 0.65));
        onSplitWidthChange(newWidth);
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
  }, [isDragging, onSplitWidthChange]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        width: '10px',
        cursor: 'col-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 20,
      }}
      title="Drag horizontally to resize information panel & graph canvas"
    >
      {/* Visual Accent Line */}
      <div
        style={{
          width: '2px',
          height: '100%',
          backgroundColor: isDragging ? 'var(--color-primary)' : 'var(--border-subtle)',
          borderRadius: '1px',
          transition: 'background-color 150ms ease, box-shadow 150ms ease',
          boxShadow: isDragging ? '0 0 8px var(--color-primary)' : 'none',
        }}
      />

      {/* Grip Indicator Pill */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: isDragging ? 'var(--color-primary)' : 'var(--bg-secondary)',
          border: `1px solid ${isDragging ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
          color: isDragging ? '#ffffff' : 'var(--text-muted)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-subtle)',
          transition: 'all 150ms ease',
        }}
      >
        <GripVertical size={12} />
      </div>
    </div>
  );
};
