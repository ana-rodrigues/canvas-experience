'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface TestCubeProps {
  position?: [number, number, number];
}

export default function TestCube({ position = [0, 0, 0] }: TestCubeProps) {
  const cube = useMemo(() => {
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const material = new THREE.MeshStandardMaterial({ color: '#00ff88' });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    return mesh;
  }, [position]);

  return <primitive object={cube} />;
}
