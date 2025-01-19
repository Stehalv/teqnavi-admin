import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface UseDragAndDropProps {
  items: string[];
  onReorder: (newOrder: string[]) => void;
}

interface DragDropProviderProps {
  children: ReactNode;
}

export function useDragAndDrop({ items, onReorder }: UseDragAndDropProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id.toString());
      const newIndex = items.indexOf(over.id.toString());
      
      const newOrder = [...items];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id.toString());
      
      onReorder(newOrder);
    }
  };

  const DragDropProvider = useMemo(() => {
    return function DragDropProviderComponent({ children }: DragDropProviderProps) {
      return (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items}
            strategy={verticalListSortingStrategy}
          >
            {children}
          </SortableContext>
        </DndContext>
      );
    };
  }, [items, handleDragEnd]);

  return {
    DragDropProvider,
    handleDragEnd
  };
} 