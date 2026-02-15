'use client';

import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ObjectGrid from './ObjectGrid';
import CameraController from './CameraController';

export default function Scene3D() {
  const [selectedPosition, setSelectedPosition] = useState<[number, number, number] | null>(null);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const controlsRef = useRef<any>(null);

  const handleObjectClick = (index: number, position: [number, number, number]) => {
    console.log(`Clicked object ${index} at position:`, position);
    setControlsEnabled(false);
    setSelectedPosition(position);
  };

  const handleReset = () => {
    setControlsEnabled(false);
    setSelectedPosition(null);
  };

  const handleTransitionComplete = () => {
    setControlsEnabled(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 75,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls 
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={50}
          enabled={controlsEnabled}
        />
        
        <CameraController 
          targetPosition={selectedPosition} 
          onTransitionComplete={handleTransitionComplete}
          controlsRef={controlsRef}
        />
        
        <gridHelper args={[20, 20]} />
        
        <ObjectGrid 
          rows={2} 
          cols={2} 
          spacing={5} 
          onObjectClick={handleObjectClick}
        />
      </Canvas>
      
      {selectedPosition && (
        <button
          onClick={handleReset}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          Reset View
        </button>
      )}
    </div>
  );
}
