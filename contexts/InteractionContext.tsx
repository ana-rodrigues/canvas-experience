'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';

interface InteractionContextType {
  isDraggingRef: React.MutableRefObject<boolean>;
  selectedPositionRef: React.MutableRefObject<[number, number, number] | null>;
}

const InteractionContext = createContext<InteractionContextType | null>(null);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const isDraggingRef = useRef(false);
  const selectedPositionRef = useRef<[number, number, number] | null>(null);

  return (
    <InteractionContext.Provider value={{ isDraggingRef, selectedPositionRef }}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within InteractionProvider');
  }
  return context;
}
