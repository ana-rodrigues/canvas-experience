'use client';

import { useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useInteraction } from '../contexts/InteractionContext';

interface TestCubeProps {
  id: string;
  position?: [number, number, number];
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (id: string) => void;
}

export default function TestCube({ 
  id,
  position = [0, 0, 0],
  isSelected,
  isDimmed,
  onSelect
}: TestCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { isDraggingRef, selectedPositionRef } = useInteraction();

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) {
      if (isSelected) {
        selectedPositionRef.current = null;
        onSelect(id);
      } else {
        selectedPositionRef.current = position;
        onSelect(id);
      }
    }
  };

  const color = isDimmed ? '#003322' : '#00ff88';
  const emissive = isSelected ? '#00ff88' : '#000000';
  const emissiveIntensity = isSelected ? 0.5 : 0;
  const opacity = isDimmed ? 0.3 : 1.0;

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      onClick={handleClick}
    >
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      <meshStandardMaterial 
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent={isDimmed}
        opacity={opacity}
      />
    </mesh>
  );
}
