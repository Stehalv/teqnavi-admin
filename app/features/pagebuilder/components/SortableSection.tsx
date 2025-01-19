import { Card, Text, Button, BlockStack, InlineStack } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section } from "../types.js";

interface SortableSectionProps {
  section: Section;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function SortableSection({ section, isSelected, onClick, onDelete }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div onClick={onClick} style={{ cursor: "pointer" }}>
        <Card
          padding="300"
          background={isSelected ? "bg-surface-selected" : undefined}
        >
          <BlockStack gap="200">
            <InlineStack gap="200" align="space-between">
              <InlineStack gap="200">
                <div 
                  style={{ 
                    color: "var(--p-icon)",
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center"
                  }}
                  {...listeners}
                >
                  <DragHandleIcon />
                </div>
                <Text as="span" variant="bodyMd" fontWeight="bold">
                  {section.type}
                </Text>
              </InlineStack>
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  icon={DeleteIcon}
                  onClick={onDelete}
                  variant="plain"
                  tone="critical"
                />
              </div>
            </InlineStack>
          </BlockStack>
        </Card>
      </div>
    </div>
  );
} 