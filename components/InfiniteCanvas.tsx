'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { InteractionProvider, useInteraction } from '../contexts/InteractionContext';
import CameraControls from './CameraControls';
import InfiniteGrid from './InfiniteGrid';
import Model3D from './Model3D';

const INITIAL_ZOOM = 30;

function CanvasContent({ selectedId, onCubeClick, onCanvasClick }: { 
  selectedId: string | null; 
  onCubeClick: (id: string) => void;
  onCanvasClick: () => void;
}) {
  const { isDraggingRef, selectedPositionRef } = useInteraction();

  const handleCanvasClick = () => {
    if (!isDraggingRef.current && selectedId !== null) {
      selectedPositionRef.current = null;
      onCanvasClick();
    }
  };

  return (
    <>
      <OrthographicCamera 
        makeDefault 
        position={[0, 1.5, 10]} 
        rotation={[-0.15, 0, 0]}
        zoom={INITIAL_ZOOM}
      />
      
      {/* Studio lighting with very deep shadows */}
      
      {/* Very low ambient for dramatic shadows */}
      <ambientLight intensity={0.3} color="#ffffff" />
      
      {/* Main key light from upper front-right - very strong */}
      <directionalLight 
        position={[10, 12, 12]} 
        intensity={4.0} 
        color="#ffffff"
        castShadow
      />
      
      {/* Secondary key from left - reduced */}
      <directionalLight 
        position={[-8, 10, 10]} 
        intensity={1.2} 
        color="#ffffff"
      />
      
      {/* Front fill light - minimal to preserve shadow depth */}
      <directionalLight 
        position={[0, 4, 15]} 
        intensity={0.8} 
        color="#ffffff"
      />
      
      {/* Top light - very subtle */}
      <directionalLight 
        position={[0, 20, 2]} 
        intensity={0.6} 
        color="#ffffff"
      />
      
      <CameraControls />
      {/* <InfiniteGrid /> */}
      <group onPointerDown={handleCanvasClick}>
        <mesh position={[0, 0, -1]} visible={false}>
          <planeGeometry args={[1000, 1000]} />
        </mesh>
      </group>
      <Model3D 
        id="model-1" 
        modelPath="/models/model1.glb" 
        position={[0, 0, 0]} 
        rotation={[0, Math.PI / 6, 0]}
        scale={0.008} 
        isSelected={selectedId === "model-1"} 
        isDimmed={selectedId !== null && selectedId !== "model-1"} 
        onSelect={onCubeClick} 
      />
    </>
  );
}

export default function InfiniteCanvas() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCubeClick = (id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleCanvasClick = () => {
    setSelectedId(null);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <InteractionProvider>
        <Canvas style={{ background: '#000000' }}>
          <color attach="background" args={['#000000']} />
          <CanvasContent 
            selectedId={selectedId} 
            onCubeClick={handleCubeClick}
            onCanvasClick={handleCanvasClick}
          />
        </Canvas>
      </InteractionProvider>
    </div>
  );
}
