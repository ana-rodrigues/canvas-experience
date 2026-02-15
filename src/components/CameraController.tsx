'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from 'three';

interface CameraControllerProps {
  targetPosition: [number, number, number] | null;
  onTransitionComplete?: () => void;
  controlsRef?: React.RefObject<any>;
}

export default function CameraController({ targetPosition, onTransitionComplete, controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef<Vector3 | null>(null);
  const startPosRef = useRef<Vector3>(new Vector3());
  const startLookAtRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const targetLookAtRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const progressRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (targetPosition) {
      startPosRef.current.copy(camera.position);
      
      if (controlsRef?.current) {
        startLookAtRef.current.copy(controlsRef.current.target);
      } else {
        startLookAtRef.current.set(0, 0, 0);
      }
      
      const targetPos = new Vector3(
        targetPosition[0],
        targetPosition[1] + 2,
        targetPosition[2] + 3
      );
      targetRef.current = targetPos;
      
      targetLookAtRef.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      
      progressRef.current = 0;
      isAnimatingRef.current = true;
    } else {
      startPosRef.current.copy(camera.position);
      
      if (controlsRef?.current) {
        startLookAtRef.current.copy(controlsRef.current.target);
      } else {
        startLookAtRef.current.set(0, 0, 0);
      }
      
      targetRef.current = new Vector3(0, 5, 10);
      targetLookAtRef.current.set(0, 0, 0);
      
      progressRef.current = 0;
      isAnimatingRef.current = true;
    }
  }, [targetPosition, camera, controlsRef]);

  useFrame((state, delta) => {
    if (isAnimatingRef.current && targetRef.current) {
      progressRef.current += delta * 1.5;
      
      const t = Math.min(progressRef.current, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      
      camera.position.lerpVectors(startPosRef.current, targetRef.current, eased);
      
      const currentLookAt = new Vector3().lerpVectors(
        startLookAtRef.current,
        targetLookAtRef.current,
        eased
      );
      camera.lookAt(currentLookAt);
      
      if (controlsRef?.current) {
        controlsRef.current.target.copy(currentLookAt);
        controlsRef.current.update();
      }
      
      if (progressRef.current >= 1) {
        isAnimatingRef.current = false;
        onTransitionComplete?.();
      }
    }
  });

  return null;
}
