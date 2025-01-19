import { Icon, Text } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon, TextAlignLeftIcon, ImageIcon, ButtonIcon, PlusCircleIcon } from "@shopify/polaris-icons";
import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "../types.js";

interface BlockListProps {
  blocks: Record<string, Block>;
  blockOrder: string[];
  selectedBlockId?: string;
  onOrderChange: (newOrder: string[]) => void;
  onBlockSelect: (id: string) => void;
  onAddBlock: () => void;
  onDeleteBlock: (id: string) => void;
}

function SortableBlock({ 
  block, 
  isSelected,
  onClick,
  onDelete 
}: { 
  block: Block; 
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
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

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "text":
      case "paragraph":
        return TextAlignLeftIcon;
      case "image":
        return ImageIcon;
      case "button":
        return ButtonIcon;
      default:
        return TextAlignLeftIcon;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div 
        className="block-container"
        style={{ 
          cursor: "pointer",
          padding: "8px",
          backgroundColor: isSelected ? "var(--p-surface-selected)" : undefined,
          borderRadius: "var(--p-border-radius-1)",
          position: "relative"
        }}
        onClick={onClick}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            flex: 1,
            gap: "8px" 
          }}>
            <div className="icon-container">
              <div className="block-icon">
                <Icon source={getBlockIcon(block.type)} />
              </div>
              <div className="drag-handle">
                <Icon source={DragHandleIcon} />
              </div>
            </div>
            
            <Text as="span" variant="bodyMd">
              {block.type}
            </Text>
          </div>

          <div 
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icon source={DeleteIcon} tone="critical" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlockList({ 
  blocks,
  blockOrder,
  selectedBlockId,
  onOrderChange,
  onBlockSelect,
  onAddBlock,
  onDeleteBlock
}: BlockListProps) {
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
    <div>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blockOrder}>
          {blockOrder.map((blockId) => (
            <SortableBlock
              key={blockId}
              block={blocks[blockId]}
              isSelected={blockId === selectedBlockId}
              onClick={() => onBlockSelect(blockId)}
              onDelete={() => onDeleteBlock(blockId)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={onAddBlock}
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
        <span style={{ fontSize: "13px" }}>Add block</span>
      </button>

      <style>
        {`
          .icon-container {
            position: relative;
            display: inline-flex;
            align-items: center;
          }
          .block-icon {
            opacity: 1;
            transition: opacity 0.15s ease;
          }
          .drag-handle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          .block-container:hover .block-icon {
            opacity: 0;
          }
          .block-container:hover .drag-handle {
            opacity: 1;
          }
          .delete-button {
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          .block-container:hover .delete-button {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
} 