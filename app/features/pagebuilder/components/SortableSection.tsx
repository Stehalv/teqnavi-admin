import { Icon, Text } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon, ChevronDownIcon, ChevronRightIcon } from "@shopify/polaris-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Section } from "../types.js";
import { BlockList } from "./BlockList.js";

interface SortableSectionProps {
  section: Section;
  isSelected: boolean;
  selectedBlockId?: string;
  onClick: () => void;
  onDelete: () => void;
  onBlockOrderChange: (newOrder: string[]) => void;
  onBlockSelect: (id: string) => void;
  onAddBlock: () => void;
  onDeleteBlock: (id: string) => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export function SortableSection({ 
  section, 
  isSelected, 
  selectedBlockId,
  onClick, 
  onDelete,
  onBlockOrderChange,
  onBlockSelect,
  onAddBlock,
  onDeleteBlock,
  isCollapsed,
  onCollapseToggle
}: SortableSectionProps) {
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
    <div ref={setNodeRef} style={style} suppressHydrationWarning>
      <div 
        className="section-container"
        style={{ 
          cursor: "pointer",
          padding: "8px",
          backgroundColor: isSelected ? "var(--p-surface-selected)" : "transparent",
          borderRadius: "var(--p-border-radius-1)",
          position: "relative",
        }}
        onClick={onClick}
      >
        <div className="section-header" style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ 
              display: "flex", 
              alignItems: "center",
              padding: "4px",
              marginRight: "4px",
              cursor: "pointer"
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCollapseToggle();
            }}
          >
            <Icon source={isCollapsed ? ChevronRightIcon : ChevronDownIcon} />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "8px" }}>
            <div className="icon-container" {...attributes} {...listeners} suppressHydrationWarning>
              <div className="section-icon" suppressHydrationWarning>
                <Icon source={DragHandleIcon} />
              </div>
              <div className="drag-handle" suppressHydrationWarning>
                <Icon source={DragHandleIcon} />
              </div>
            </div>
            
            <Text as="span" variant="bodyMd">
              {section.type}
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

        {!isCollapsed && (
          <div style={{ marginTop: "8px", marginLeft: "24px" }}>
            <BlockList
              blocks={section.blocks}
              blockOrder={section.block_order}
              selectedBlockId={selectedBlockId}
              onOrderChange={onBlockOrderChange}
              onBlockSelect={onBlockSelect}
              onAddBlock={onAddBlock}
              onDeleteBlock={onDeleteBlock}
            />
          </div>
        )}
      </div>

      <style>
        {`
          .icon-container {
            position: relative;
            display: inline-flex;
            align-items: center;
          }
          .section-icon {
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
          .section-container > div:first-child:hover .section-icon {
            opacity: 0;
          }
          .section-container > div:first-child:hover .drag-handle {
            opacity: 1;
          }
          .delete-button {
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          .section-container > div:first-child:hover .delete-button {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
} 