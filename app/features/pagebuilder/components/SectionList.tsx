import { Icon } from "@shopify/polaris";
import { PlusCircleIcon } from "@shopify/polaris-icons";
import { SortableContext } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { Section } from "../types.js";
import { SortableSection } from "./SortableSection.js";

interface SectionListProps {
  sections: Record<string, Section>;
  sectionOrder: string[];
  selectedSectionId?: string;
  selectedBlockId?: string;
  onOrderChange: (newOrder: string[]) => void;
  onSectionSelect: (id: string) => void;
  onCollapseToggle: (id: string) => void;
  onAddSection: () => void;
  onDeleteSection: (id: string) => void;
  onBlockOrderChange: (newOrder: string[]) => void;
  onBlockSelect: (id: string) => void;
  onAddBlock: () => void;
  onDeleteBlock: (id: string) => void;
  collapsedSections: Set<string>;
}

export function SectionList({ 
  sections,
  sectionOrder,
  selectedSectionId,
  selectedBlockId,
  onOrderChange,
  onSectionSelect,
  onCollapseToggle,
  onAddSection,
  onDeleteSection,
  onBlockOrderChange,
  onBlockSelect,
  onAddBlock,
  onDeleteBlock,
  collapsedSections
}: SectionListProps) {
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
    <div>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionOrder}>
          {sectionOrder.map((sectionId) => (
            <SortableSection
              key={sectionId}
              section={sections[sectionId]}
              isSelected={sectionId === selectedSectionId}
              selectedBlockId={selectedBlockId}
              onClick={() => onSectionSelect(sectionId)}
              onDelete={() => onDeleteSection(sectionId)}
              onBlockOrderChange={onBlockOrderChange}
              onBlockSelect={onBlockSelect}
              onAddBlock={onAddBlock}
              onDeleteBlock={onDeleteBlock}
              isCollapsed={collapsedSections.has(sectionId)}
              onCollapseToggle={() => onCollapseToggle(sectionId)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={onAddSection}
        style={{
          background: "none",
          border: "none",
          color: "var(--p-action-primary)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px",
          width: "100%",
          marginTop: "4px"
        }}
      >
        <div style={{ width: "20px", height: "20px" }}>
          <Icon source={PlusCircleIcon} />
        </div>
        <span style={{ fontSize: "13px" }}>Add section</span>
      </button>
    </div>
  );
} 