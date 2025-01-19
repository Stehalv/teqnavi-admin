import { BlockStack, Button, Text } from "@shopify/polaris";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableSection } from "./SortableSection.js";
import type { Section } from "../types.js";

interface SectionListProps {
  sections: Record<string, Section>;
  sectionOrder: string[];
  onOrderChange: (newOrder: string[]) => void;
  onSectionSelect: (sectionId: string) => void;
  selectedSectionId?: string;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
}

export function SectionList({
  sections,
  sectionOrder,
  onOrderChange,
  onSectionSelect,
  selectedSectionId,
  onAddSection,
  onDeleteSection,
}: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id);
      const newIndex = sectionOrder.indexOf(over.id);
      const newOrder = [...sectionOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id);
      onOrderChange(newOrder);
    }
  };

  return (
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">Sections</Text>
        <Button onClick={onAddSection} variant="primary" fullWidth>Add Section</Button>
      </BlockStack>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <BlockStack gap="300">
            {sectionOrder.map((sectionId) => (
              <SortableSection
                key={sectionId}
                section={sections[sectionId]}
                isSelected={selectedSectionId === sectionId}
                onClick={() => onSectionSelect(sectionId)}
                onDelete={() => onDeleteSection(sectionId)}
              />
            ))}
          </BlockStack>
        </SortableContext>
      </DndContext>
    </BlockStack>
  );
} 