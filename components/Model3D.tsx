'use client';

import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useInteraction } from '../contexts/InteractionContext';

interface Model3DProps {
  id: string;
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (id: string) => void;
}

export default function Model3D({ 
  id,
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isSelected,
  isDimmed,
  onSelect
}: Model3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { isDraggingRef, selectedPositionRef } = useInteraction();
  
  const { scene } = useGLTF(modelPath);
  
  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      groupRef.current.children.forEach(child => {
        child.position.sub(center);
      });
    }
  }, [scene]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            
            // Log mesh names for debugging
            console.log('Mesh name:', mesh.name, 'Material color:', material.color);
            
            // Add screen glare effect - detect screen by name or dark color
            const meshName = mesh.name.toLowerCase();
            const isScreenByName = meshName.includes('screen') || 
                                  meshName.includes('monitor') || 
                                  meshName.includes('display') ||
                                  meshName.includes('crt') ||
                                  meshName.includes('glass');
            
            // Fallback: detect by very dark color (likely the CRT screen)
            const baseColor = material.color;
            const isDarkMaterial = baseColor.r < 0.15 && baseColor.g < 0.15 && baseColor.b < 0.15;
            
            const isScreen = isScreenByName || isDarkMaterial;
            
            if (isScreen) {
              console.log('Applying screen glare to:', mesh.name);
              // Add screen glare effect - dark greenish teal with subtle glow
              material.emissive = new THREE.Color(0x1a3a35);
              material.emissiveIntensity = 0.8;
              material.roughness = 0.3;
              material.metalness = 0.15;
              // Enhance the base color to be darker greenish
              material.color = new THREE.Color(0x0d1f1d);
            }
            
            if (isDimmed) {
              material.transparent = true;
              material.opacity = 0.3;
            } else {
              material.transparent = false;
              material.opacity = 1.0;
            }
          }
        }
      });
    }
  }, [isDimmed]);

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

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
    >
      <primitive object={scene.clone()} />
    </group>
  );
}
