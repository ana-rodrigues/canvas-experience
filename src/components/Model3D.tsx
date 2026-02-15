'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface Model3DProps {
  position: [number, number, number];
  rotation: [number, number, number];
  modelPath: string;
  onClick?: () => void;
  scale?: number;
}

export default function Model3D({ position, rotation, modelPath, onClick, scale = 1 }: Model3DProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const { scene } = useGLTF(modelPath);

  const clonedScene = scene.clone();
  clonedScene.traverse((child) => {
    if ((child as any).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={clonedScene} />
      
      {hovered && (
        <>
          <spotLight 
            position={[2, 6, 0]} 
            intensity={5} 
            angle={1} 
            penumbra={10}
            distance={8}
            color="#ffe18fff"
          />
          <pointLight 
            position={[0, 2, 0]} 
            intensity={2} 
            distance={4}
            color="#ffffee"
          />
        </>
      )}
    </group>
  );
}

