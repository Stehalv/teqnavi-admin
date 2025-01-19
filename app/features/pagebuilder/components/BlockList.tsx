import { BlockStack, Button, Text, Card, InlineStack } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon } from "@shopify/polaris-icons";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "../types.js";

interface BlockListProps {
  blocks: Record<string, Block>;
  blockOrder: string[];
  onOrderChange: (newOrder: string[]) => void;
  onBlockSelect: (blockId: string) => void;
  selectedBlockId?: string;
  onAddBlock: () => void;
  onDeleteBlock: (blockId: string) => void;
}

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SortableBlock({ block, isSelected, onClick, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

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
                  {block.type}
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

export function BlockList({
  blocks,
  blockOrder,
  onOrderChange,
  onBlockSelect,
  selectedBlockId,
  onAddBlock,
  onDeleteBlock,
}: BlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blockOrder.indexOf(active.id);
      const newIndex = blockOrder.indexOf(over.id);
      const newOrder = [...blockOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id);
      onOrderChange(newOrder);
    }
  };

  return (
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">Blocks</Text>
        <Button onClick={onAddBlock} variant="primary" fullWidth>Add Block</Button>
      </BlockStack>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blockOrder}
          strategy={verticalListSortingStrategy}
        >
          <BlockStack gap="300">
            {blockOrder.map((blockId) => (
              <SortableBlock
                key={blockId}
                block={blocks[blockId]}
                isSelected={selectedBlockId === blockId}
                onClick={() => onBlockSelect(blockId)}
                onDelete={() => onDeleteBlock(blockId)}
              />
            ))}
          </BlockStack>
        </SortableContext>
      </DndContext>
    </BlockStack>
  );
} 