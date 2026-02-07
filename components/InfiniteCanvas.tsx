'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { InteractionProvider, useInteraction } from '../contexts/InteractionContext';
import CameraControls from './CameraControls';
import InfiniteGrid from './InfiniteGrid';
import TestCube from './TestCube';

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
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={INITIAL_ZOOM} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <CameraControls />
      <InfiniteGrid />
      <group onPointerDown={handleCanvasClick}>
        <mesh position={[0, 0, -1]} visible={false}>
          <planeGeometry args={[1000, 1000]} />
        </mesh>
      </group>
      <TestCube id="cube-1" position={[-9, 6, 0]} isSelected={selectedId === "cube-1"} isDimmed={selectedId !== null && selectedId !== "cube-1"} onSelect={onCubeClick} />
      <TestCube id="cube-2" position={[-3, 6, 0]} isSelected={selectedId === "cube-2"} isDimmed={selectedId !== null && selectedId !== "cube-2"} onSelect={onCubeClick} />
      <TestCube id="cube-3" position={[3, 6, 0]} isSelected={selectedId === "cube-3"} isDimmed={selectedId !== null && selectedId !== "cube-3"} onSelect={onCubeClick} />
      <TestCube id="cube-4" position={[9, 6, 0]} isSelected={selectedId === "cube-4"} isDimmed={selectedId !== null && selectedId !== "cube-4"} onSelect={onCubeClick} />
      <TestCube id="cube-5" position={[-9, -6, 0]} isSelected={selectedId === "cube-5"} isDimmed={selectedId !== null && selectedId !== "cube-5"} onSelect={onCubeClick} />
      <TestCube id="cube-6" position={[-3, -6, 0]} isSelected={selectedId === "cube-6"} isDimmed={selectedId !== null && selectedId !== "cube-6"} onSelect={onCubeClick} />
      <TestCube id="cube-7" position={[3, -6, 0]} isSelected={selectedId === "cube-7"} isDimmed={selectedId !== null && selectedId !== "cube-7"} onSelect={onCubeClick} />
      <TestCube id="cube-8" position={[9, -6, 0]} isSelected={selectedId === "cube-8"} isDimmed={selectedId !== null && selectedId !== "cube-8"} onSelect={onCubeClick} />
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}>
      <InteractionProvider>
        <Canvas>
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
