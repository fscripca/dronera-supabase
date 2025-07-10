import React, { ReactNode } from 'react';

interface HudPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'red' | 'none';
}

const HudPanel: React.FC<HudPanelProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue' 
}) => {
  const borderColorClass = glowColor === 'red' ? 'border-ion' : glowColor === 'none' ? 'border-gray-800' : 'border-plasma';
  const glowClass = glowColor === 'red' ? 'border-glow-red' : glowColor === 'none' ? '' : 'border-glow-blue';
  
  return (
    <div className={`hud-panel ${borderColorClass} ${glowClass} ${className}`}>
      <div className={`hud-corner hud-corner-tl ${borderColorClass}`}></div>
      <div className={`hud-corner hud-corner-tr ${borderColorClass}`}></div>
      <div className={`hud-corner hud-corner-bl ${borderColorClass}`}></div>
      <div className={`hud-corner hud-corner-br ${borderColorClass}`}></div>
      {children}
    </div>
  );
};

export default HudPanel;