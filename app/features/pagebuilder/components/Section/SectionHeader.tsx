import { Icon, Text, Button } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon, ChevronDownIcon, ChevronRightIcon } from "@shopify/polaris-icons";
import styles from "./Section.module.css";

interface SectionHeaderProps {
  type: string;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  onDelete: () => void;
  dragHandleProps: Record<string, any>;
}

export function SectionHeader({ 
  type,
  isCollapsed,
  onCollapseToggle,
  onDelete,
  dragHandleProps
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.dragHandle} {...dragHandleProps}>
        <Icon source={DragHandleIcon} />
      </div>

      <Button
        variant="plain"
        icon={isCollapsed ? ChevronRightIcon : ChevronDownIcon}
        onClick={() => {
          onCollapseToggle();
        }}
      />

      <div className={styles.sectionType}>
        <Text variant="bodyMd" as="span">
          {type}
        </Text>
      </div>

      <div className={styles.spacer} />

      <Button
        variant="plain"
        icon={DeleteIcon}
        onClick={() => {
          onDelete();
        }}
      />
    </div>
  );
} 