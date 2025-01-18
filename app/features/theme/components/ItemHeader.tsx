import { Button, InlineStack, Text } from "@shopify/polaris";
import { DragHandleIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon, SettingsIcon } from "@shopify/polaris-icons";

interface ItemHeaderProps {
  type: string;
  isSection?: boolean;
  isCollapsed?: boolean;
  onSettingsClick: () => void;
  onDelete: () => void;
  onToggleCollapse?: () => void;
}

export function ItemHeader({ 
  type, 
  isSection = false,
  isCollapsed = false,
  onSettingsClick,
  onDelete,
  onToggleCollapse
}: ItemHeaderProps) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px',
      background: isSection ? 'var(--p-surface-selected)' : 'var(--p-surface-subdued)',
      borderRadius: '4px',
      marginLeft: isSection ? '0' : '16px'
    }}>
      <Button variant="plain" icon={DragHandleIcon} />
      <div style={{ flex: 1 }}>
        <Text as={isSection ? "h2" : "p"} variant={isSection ? "headingMd" : "bodyMd"}>{type}</Text>
      </div>
      <InlineStack gap="200" align="end">
        <Button
          icon={SettingsIcon}
          onClick={onSettingsClick}
          variant="plain"
        />
        <Button
          icon={DeleteIcon}
          onClick={onDelete}
          variant="plain"
          tone="critical"
        />
        {isSection && onToggleCollapse && (
          <Button
            icon={isCollapsed ? ChevronDownIcon : ChevronUpIcon}
            onClick={onToggleCollapse}
            variant="plain"
          />
        )}
      </InlineStack>
    </div>
  );
} 