'use client';

import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import CameraControls from './CameraControls';
import InfiniteGrid from './InfiniteGrid';
import TestCube from './TestCube';

const INITIAL_ZOOM = 20;

export default function InfiniteCanvas() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000' }}>
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={INITIAL_ZOOM} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <CameraControls />
        <InfiniteGrid />
        <TestCube position={[-9, 6, 0]} />
        <TestCube position={[-3, 6, 0]} />
        <TestCube position={[3, 6, 0]} />
        <TestCube position={[9, 6, 0]} />
        <TestCube position={[-9, -6, 0]} />
        <TestCube position={[-3, -6, 0]} />
        <TestCube position={[3, -6, 0]} />
        <TestCube position={[9, -6, 0]} />
      </Canvas>
    </div>
  );
}
