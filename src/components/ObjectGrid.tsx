'use client';

import Model3D from './Model3D';

interface ObjectGridProps {
  rows: number;
  cols: number;
  spacing: number;
  onObjectClick?: (index: number, position: [number, number, number]) => void;
}

export default function ObjectGrid({ rows, cols, spacing, onObjectClick }: ObjectGridProps) {
  const objects = [];
  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col - (cols - 1) / 2) * spacing;
      const z = (row - (rows - 1) / 2) * spacing;
      const position: [number, number, number] = [x, 0, z];

      objects.push(
        <Model3D
          key={`${row}-${col}`}
          position={position}
          rotation={[0, -Math.PI / 2, 0]}
          modelPath="/models/chair.glb"
          scale={1}
          onClick={() => onObjectClick?.(index, position)}
        />
      );
      index++;
    }
  }

  return <>{objects}</>;
}
