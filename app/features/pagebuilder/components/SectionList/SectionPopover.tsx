import React from 'react';
import { Popover, ActionList, Text, InlineStack, Icon, type ActionListItemDescriptor } from '@shopify/polaris';
import { DuplicateIcon } from '@shopify/polaris-icons';
import type { PageUI } from '../../types/shopify.js';

interface SectionPopoverProps {
  active: boolean;
  activator: React.ReactElement;
  page: PageUI;
  onClose: () => void;
  onCopySection: (sectionId: string) => void;
}

export function SectionPopover({
  active,
  activator,
  page,
  onClose,
  onCopySection
}: SectionPopoverProps) {
  const sections = page.data.sections;
  const items: ActionListItemDescriptor[] = Object.entries(sections).map(([id, section]) => ({
    content: section.settings?.heading || section.type,
    prefix: <Icon source={DuplicateIcon} />,
    onAction: () => {
      onCopySection(id);
      onClose();
    }
  }));

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={onClose}
      preferredAlignment="left"
    >
      <Popover.Pane>
        <div style={{ minWidth: '200px' }}>
          <ActionList
            items={items}
          />
        </div>
      </Popover.Pane>
    </Popover>
  );
} 