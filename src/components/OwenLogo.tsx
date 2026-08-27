import React from 'react';

interface OwenLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const OwenLogo: React.FC<OwenLogoProps> = ({
  className = 'w-7 h-7',
  color = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="O.Planner Logo"
    >
      {/* 
        Owen Geometric Capsule Monogram:
        Composed of symmetrical curved vertical pillars, a central connecting bar,
        and open vertical notches at the top and bottom poles.
      */}
      <path
        d="
          M 44,9
          C 30,9 18,22 18,40
          L 18,60
          C 18,78 30,91 44,91
          L 44,79
          C 36,79 30,71 30,60
          L 30,55
          L 70,55
          L 70,60
          C 70,71 64,79 56,79
          L 56,91
          C 70,91 82,78 82,60
          L 82,40
          C 82,22 70,9 56,9
          L 56,21
          C 64,21 70,29 70,40
          L 70,45
          L 30,45
          L 30,40
          C 30,29 36,21 44,21
          Z
        "
        fill={color}
      />
    </svg>
  );
};
