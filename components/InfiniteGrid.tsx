'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

const GRID_SIZE = 80;
const GRID_SPACING = 2;
const GRID_COLOR = '#5c5959';
const GRID_OPACITY = 0.6;

export default function InfiniteGrid() {
  const gridLines = useMemo(() => {
    const lines = [];
    const material = new THREE.LineBasicMaterial({ 
      color: GRID_COLOR, 
      opacity: GRID_OPACITY, 
      transparent: true 
    });

    for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
      const offset = i * GRID_SPACING;
      
      // Horizontal line
      const hPoints = [
        new THREE.Vector3(-GRID_SIZE * GRID_SPACING, offset, 0),
        new THREE.Vector3(GRID_SIZE * GRID_SPACING, offset, 0),
      ];
      const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints);
      const hLine = new THREE.Line(hGeometry, material);
      
      lines.push(
        <primitive key={`h-${i}`} object={hLine} />
      );

      // Vertical line
      const vPoints = [
        new THREE.Vector3(offset, -GRID_SIZE * GRID_SPACING, 0),
        new THREE.Vector3(offset, GRID_SIZE * GRID_SPACING, 0),
      ];
      const vGeometry = new THREE.BufferGeometry().setFromPoints(vPoints);
      const vLine = new THREE.Line(vGeometry, material);
      
      lines.push(
        <primitive key={`v-${i}`} object={vLine} />
      );
    }

    return lines;
  }, []);

  return <group>{gridLines}</group>;
}
