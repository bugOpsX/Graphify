import React, { useState, useEffect } from 'react';
import { GripHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

interface StageResizeHandleProps {
  dockHeight: number;
  onDockHeightChange: (newHeight: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const StageResizeHandle: React.FC<StageResizeHandleProps> = ({
  onDockHeightChange,
  isCollapsed,
  onToggleCollapse,
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
      const windowHeight = window.innerHeight;
      // Measure distance from bottom of screen to cursor
      const newHeight = Math.max(140, Math.min(windowHeight - e.clientY - 60, windowHeight * 0.65));
      onDockHeightChange(newHeight);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const windowHeight = window.innerHeight;
        const touchY = e.touches[0].clientY;
        const newHeight = Math.max(140, Math.min(windowHeight - touchY - 60, windowHeight * 0.65));
        onDockHeightChange(newHeight);
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
  }, [isDragging, onDockHeightChange]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={onToggleCollapse}
      style={{
        height: '16px',
        margin: '-0.2rem 0',
        cursor: 'ns-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 20,
        userSelect: 'none',
      }}
      className="stage-resize-handle"
      title="Drag up/down to resize canvas area | Double-click to collapse/expand info dock"
    >
      <div
        style={{
          width: '100%',
          height: '3px',
          backgroundColor: isDragging ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 150ms ease',
        }}
      >
        <div
          style={{
            backgroundColor: isDragging ? 'var(--color-primary)' : 'var(--bg-secondary)',
            border: `1px solid ${isDragging ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
            borderRadius: '12px',
            padding: '2px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            transform: isDragging ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 150ms ease',
          }}
        >
          <GripHorizontal size={14} color={isDragging ? '#ffffff' : 'var(--text-secondary)'} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              color: 'var(--text-secondary)',
            }}
            title={isCollapsed ? 'Expand inspector panel' : 'Collapse inspector panel'}
          >
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
