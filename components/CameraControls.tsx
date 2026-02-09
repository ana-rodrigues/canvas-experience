'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useInteraction } from '../contexts/InteractionContext';

// Physics constants
const DAMPING_FACTOR = 0.99;
const INITIAL_ZOOM = 30;
const ZOOM_MIN = 30;
const ZOOM_MAX = 100;
const ZOOM_SPEED_PINCH = 6;
const ZOOM_LERP_FAST = 0.5;
const ZOOM_LERP_SLOW = 0.08;
const SCROLL_BOUNCE_MULTIPLIER = 4;
const SELECTION_ANIM_BASE_LERP = 0.015;
const SELECTION_ANIM_LERP_RANGE = 0.08;
const SELECTION_ANIM_NORMALIZE_DISTANCE = 35;
const SELECTION_ANIM_NORMALIZE_ZOOM = 60;
const BOUNCE_FORCE_DRAG = 0.2;
const BOUNCE_FORCE_MOMENTUM = 0.15;
const BOUNCE_DAMPING = 0.92;
const VELOCITY_REVERSAL = -0.1;
const SELECTION_ZOOM = 120;

// Easing function with smooth ease-out (ease-out-quint for extra smoothness)
const easeOutQuint = (t: number): number => {
  return 1 - Math.pow(1 - t, 5);
};

// Boundary configuration
const BOUNDARIES = {
  minX: -30,
  maxX: 30,
  minY: -30,
  maxY: 30,
} as const;

interface Vector2D {
  x: number;
  y: number;
}

export default function CameraControls() {
  const { camera, gl } = useThree();
  const { isDraggingRef, selectedPositionRef } = useInteraction();
  const isDragging = useRef<boolean>(false);
  const dragStartPos = useRef<Vector2D>({ x: 0, y: 0 });
  const previousMousePosition = useRef<Vector2D>({ x: 0, y: 0 });
  const velocity = useRef<Vector2D>({ x: 0, y: 0 });
  const targetZoom = useRef<number>(INITIAL_ZOOM);
  const targetPosition = useRef<Vector2D | null>(null);
  const isAnimatingSelection = useRef<boolean>(false);
  const bounceVelocity = useRef<Vector2D>({ x: 0, y: 0 });
  
  const boundaries = BOUNDARIES;

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.cursor = 'grab';

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      isDraggingRef.current = false;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      
      const totalDragDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.current.x, 2) + 
        Math.pow(e.clientY - dragStartPos.current.y, 2)
      );
      if (totalDragDistance > 3) {
        isDraggingRef.current = true;
      }

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
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 100);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (camera instanceof THREE.OrthographicCamera) {
        const isPinch = e.ctrlKey;
        
        if (isPinch) {
          // Pinch gesture: zoom
          const delta = -e.deltaY;
          const zoomFactor = 1 + (delta * 0.0015 * ZOOM_SPEED_PINCH);
          const newZoom = targetZoom.current * zoomFactor;
          targetZoom.current = THREE.MathUtils.clamp(newZoom, ZOOM_MIN, ZOOM_MAX);
        } else {
          // Regular scroll: pan camera
          const zoomFactor = 1 / camera.zoom;
          const panSpeed = 0.5;
          const deltaX = e.deltaX * panSpeed;
          const deltaY = -e.deltaY * panSpeed;
          
          const newX = camera.position.x + deltaX * zoomFactor;
          const newY = camera.position.y + deltaY * zoomFactor;
          
          // Check for boundary collision and apply bounce
          if (newX < boundaries.minX || newX > boundaries.maxX) {
            bounceVelocity.current.x = -deltaX * zoomFactor * BOUNCE_FORCE_DRAG * SCROLL_BOUNCE_MULTIPLIER;
          }
          if (newY < boundaries.minY || newY > boundaries.maxY) {
            bounceVelocity.current.y = -deltaY * zoomFactor * BOUNCE_FORCE_DRAG * SCROLL_BOUNCE_MULTIPLIER;
          }
          
          camera.position.x = THREE.MathUtils.clamp(newX, boundaries.minX, boundaries.maxX);
          camera.position.y = THREE.MathUtils.clamp(newY, boundaries.minY, boundaries.maxY);
        }
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
      // Handle zoom to selected element
      if (selectedPositionRef.current && !isDragging.current) {
        const [targetX, targetY] = selectedPositionRef.current;
        targetPosition.current = { x: targetX, y: targetY };
        targetZoom.current = SELECTION_ZOOM;
        velocity.current = { x: 0, y: 0 };
        bounceVelocity.current = { x: 0, y: 0 };
        isAnimatingSelection.current = true;
      } else if (!selectedPositionRef.current && targetPosition.current) {
        targetPosition.current = null;
        targetZoom.current = INITIAL_ZOOM;
      }

      // Animate camera position to target
      if (targetPosition.current && !isDragging.current) {
        const posX = camera.position.x;
        const posY = camera.position.y;
        
        // Account for camera rotation when calculating target position
        // If camera is tilted down, we need to offset the Y position upward
        const cameraRotationX = camera.rotation.x;
        const yOffset = cameraRotationX !== 0 ? Math.tan(Math.abs(cameraRotationX)) * camera.position.z * 1.2 : 0;
        
        const diffX = targetPosition.current.x - posX;
        const diffY = (targetPosition.current.y + yOffset) - posY;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        
        if (distance > 0.01) {
          const normalizedDistance = Math.min(distance / SELECTION_ANIM_NORMALIZE_DISTANCE, 1);
          const progress = 1 - normalizedDistance;
          const easedProgress = easeOutQuint(progress);
          const lerpFactor = SELECTION_ANIM_BASE_LERP + (easedProgress * SELECTION_ANIM_LERP_RANGE);
          
          camera.position.x += diffX * lerpFactor;
          camera.position.y += diffY * lerpFactor;
        }
      }
      
      // Zoom with constant speed for linear feel
      const zoomDiff = targetZoom.current - camera.zoom;
      if (Math.abs(zoomDiff) > 0.01) {
        if (isAnimatingSelection.current) {
          // Use constant lerp factor for smooth, linear zoom
          const lerpFactor = 0.12;
          camera.zoom += zoomDiff * lerpFactor;
        } else {
          const distanceRatio = Math.abs(zoomDiff) / camera.zoom;
          const lerpFactor = distanceRatio > 0.1 ? ZOOM_LERP_FAST : ZOOM_LERP_SLOW;
          camera.zoom += zoomDiff * lerpFactor;
        }
        camera.updateProjectionMatrix();
      } else if (isAnimatingSelection.current) {
        isAnimatingSelection.current = false;
      }
      
      // Drag momentum with smooth ease-out and damping
      if (!isDragging.current && !targetPosition.current && (Math.abs(velocity.current.x) > 0.001 || Math.abs(velocity.current.y) > 0.001)) {
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
