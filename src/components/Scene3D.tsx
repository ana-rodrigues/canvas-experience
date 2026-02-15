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
          position: [8, 4, 8],
          fov: 75,
        }}
        style={{ background: '#e3e1dfff' }}
        shadows
      >
        <ambientLight intensity={2.5} color="#cff1ffff" />
        <directionalLight 
          position={[8, 12, 6]} 
          intensity={3} 
          color="#ffe4b3"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-6, 8, 4]} intensity={2} color="#ffeedd" />
        <hemisphereLight intensity={1.2} color="#fff9f0" groundColor="#d4c5b0" />
        <OrbitControls 
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={50}
          enabled={controlsEnabled}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={0}
        />
        
        <CameraController 
          targetPosition={selectedPosition} 
          onTransitionComplete={handleTransitionComplete}
          controlsRef={controlsRef}
        />
        
        {/*<gridHelper args={[20, 20, '#999999', '#999999']} />*/}
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.15} />
        </mesh>
        
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
