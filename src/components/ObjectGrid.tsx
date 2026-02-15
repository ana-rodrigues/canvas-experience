'use client';

import GridObject from './Object';

interface ObjectGridProps {
  rows: number;
  cols: number;
  spacing: number;
  onObjectClick?: (index: number, position: [number, number, number]) => void;
}

export default function ObjectGrid({ rows, cols, spacing, onObjectClick }: ObjectGridProps) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
  
  const objects = [];
  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col - (cols - 1) / 2) * spacing;
      const z = (row - (rows - 1) / 2) * spacing;
      const position: [number, number, number] = [x, 0.5, z];
      const color = colors[index % colors.length];

      objects.push(
        <GridObject
          key={`${row}-${col}`}
          position={position}
          color={color}
          onClick={() => onObjectClick?.(index, position)}
        />
      );
      index++;
    }
  }

  return <>{objects}</>;
}
