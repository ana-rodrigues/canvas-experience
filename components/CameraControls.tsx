'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Physics constants
const DAMPING_FACTOR = 0.99;
const INITIAL_ZOOM = 20;
const ZOOM_MIN = 10;
const ZOOM_MAX = 100;
const ZOOM_SPEED_PINCH = 4;
const ZOOM_SPEED_SCROLL = 0.5;
const ZOOM_LERP_FAST = 0.5;
const ZOOM_LERP_SLOW = 0.08;
const BOUNCE_FORCE_DRAG = 0.3;
const BOUNCE_FORCE_MOMENTUM = 0.25;
const BOUNCE_DAMPING = 0.9;
const VELOCITY_REVERSAL = -0.2;

// Boundary configuration
const BOUNDARIES = {
  minX: -10,
  maxX: 10,
  minY: -10,
  maxY: 10,
} as const;

interface Vector2D {
  x: number;
  y: number;
}

export default function CameraControls() {
  const { camera, gl } = useThree();
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<Vector2D>({ x: 0, y: 0 });
  const velocity = useRef<Vector2D>({ x: 0, y: 0 });
  const targetZoom = useRef<number>(INITIAL_ZOOM);
  const bounceVelocity = useRef<Vector2D>({ x: 0, y: 0 });
  
  const boundaries = useMemo(() => BOUNDARIES, []);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.cursor = 'grab';

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      if (camera instanceof THREE.OrthographicCamera) {
        const zoomFactor = 1 / camera.zoom;
        const newX = camera.position.x - deltaX * zoomFactor;
        const newY = camera.position.y + deltaY * zoomFactor;
        
        // Check for boundary collision and apply bounce
        if (newX < boundaries.minX || newX > boundaries.maxX) {
          bounceVelocity.current.x = deltaX * zoomFactor * BOUNCE_FORCE_DRAG;
        }
        if (newY < boundaries.minY || newY > boundaries.maxY) {
          bounceVelocity.current.y = -deltaY * zoomFactor * BOUNCE_FORCE_DRAG;
        }
        
        camera.position.x = THREE.MathUtils.clamp(newX, boundaries.minX, boundaries.maxX);
        camera.position.y = THREE.MathUtils.clamp(newY, boundaries.minY, boundaries.maxY);
        
        velocity.current = {
          x: deltaX,
          y: deltaY,
        };
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = 'grab';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (camera instanceof THREE.OrthographicCamera) {
        const isPinch = e.ctrlKey;
        const zoomSpeed = isPinch ? ZOOM_SPEED_PINCH : ZOOM_SPEED_SCROLL;
        
        const delta = -e.deltaY;
        const zoomFactor = 1 + (delta * 0.001 * zoomSpeed);
        const newZoom = targetZoom.current * zoomFactor;
        
        targetZoom.current = THREE.MathUtils.clamp(newZoom, ZOOM_MIN, ZOOM_MAX);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, boundaries]);

  useFrame(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      // Zoom with velocity reduction near target
      const zoomDiff = targetZoom.current - camera.zoom;
      if (Math.abs(zoomDiff) > 0.01) {
        // Use fast lerp when far from target, slow lerp when close
        const distanceRatio = Math.abs(zoomDiff) / camera.zoom;
        const lerpFactor = distanceRatio > 0.1 ? ZOOM_LERP_FAST : ZOOM_LERP_SLOW;
        camera.zoom += zoomDiff * lerpFactor;
        camera.updateProjectionMatrix();
      }
      
      // Drag momentum with smooth ease-out and damping
      if (!isDragging.current && (Math.abs(velocity.current.x) > 0.001 || Math.abs(velocity.current.y) > 0.001)) {
        const zoomFactor = 1 / camera.zoom;
        const newX = camera.position.x - velocity.current.x * zoomFactor;
        const newY = camera.position.y + velocity.current.y * zoomFactor;
        
        // Check for boundary collision during momentum and apply bounce
        if (newX <= boundaries.minX || newX >= boundaries.maxX) {
          bounceVelocity.current.x = velocity.current.x * zoomFactor * BOUNCE_FORCE_MOMENTUM;
          velocity.current.x *= VELOCITY_REVERSAL;
        }
        if (newY <= boundaries.minY || newY >= boundaries.maxY) {
          bounceVelocity.current.y = -velocity.current.y * zoomFactor * BOUNCE_FORCE_MOMENTUM;
          velocity.current.y *= VELOCITY_REVERSAL;
        }
        
        camera.position.x = THREE.MathUtils.clamp(newX, boundaries.minX, boundaries.maxX);
        camera.position.y = THREE.MathUtils.clamp(newY, boundaries.minY, boundaries.maxY);
        
        velocity.current.x *= DAMPING_FACTOR;
        velocity.current.y *= DAMPING_FACTOR;
      }
      
      // Apply bounce-back effect
      if (Math.abs(bounceVelocity.current.x) > 0.001 || Math.abs(bounceVelocity.current.y) > 0.001) {
        camera.position.x += bounceVelocity.current.x;
        camera.position.y += bounceVelocity.current.y;
        
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, boundaries.minX, boundaries.maxX);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, boundaries.minY, boundaries.maxY);
        
        bounceVelocity.current.x *= BOUNCE_DAMPING;
        bounceVelocity.current.y *= BOUNCE_DAMPING;
      }
    }
  });

  return null;
}
