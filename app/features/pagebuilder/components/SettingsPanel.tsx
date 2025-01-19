import { BlockStack, Card, FormLayout, Select, Text, TextField } from "@shopify/polaris";
import type { Page, Section, Block } from "../types.js";

interface SettingsPanelProps {
  page?: Page;
  selectedSectionId?: string;
  selectedBlockId?: string;
  onPageChange: (page: Page) => void;
}

export function SettingsPanel({
  page,
  selectedSectionId,
  selectedBlockId,
  onPageChange,
}: SettingsPanelProps) {
  if (!page) return null;

  const selectedSection = selectedSectionId ? page.sections[selectedSectionId] : null;
  const selectedBlock = selectedSection?.blocks[selectedBlockId || ""] || null;

  const handleSectionSettingChange = (key: string, value: any) => {
    if (!selectedSection) return;

    const updatedSection: Section = {
      ...selectedSection,
      settings: {
        ...selectedSection.settings,
        [key]: value,
      },
    };

    onPageChange({
      ...page,
      sections: {
        ...page.sections,
        [selectedSectionId!]: updatedSection,
      },
    });
  };

  const handleBlockSettingChange = (key: string, value: any) => {
    if (!selectedSection || !selectedBlock) return;

    const updatedBlock: Block = {
      ...selectedBlock,
      settings: {
        ...selectedBlock.settings,
        [key]: value,
      },
    };

    const updatedSection: Section = {
      ...selectedSection,
      blocks: {
        ...selectedSection.blocks,
        [selectedBlockId!]: updatedBlock,
      },
    };

    onPageChange({
      ...page,
      sections: {
        ...page.sections,
        [selectedSectionId!]: updatedSection,
      },
    });
  };

  if (!selectedSection) {
    // Page Settings
    return (
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Page Settings</Text>
        <Card>
          <BlockStack gap="400">
            <FormLayout>
              <TextField
                label="Title"
                value={page.title}
                onChange={(value) => onPageChange({ ...page, title: value })}
                autoComplete="off"
              />
              <TextField
                label="Handle"
                value={page.handle}
                onChange={(value) => onPageChange({ ...page, handle: value })}
                autoComplete="off"
              />
              <Select
                label="Template"
                options={[
                  { label: "Default Page", value: "page" },
                  { label: "Contact", value: "page.contact" },
                  { label: "FAQ", value: "page.faq" },
                ]}
                value={page.template}
                onChange={(value) => onPageChange({ ...page, template: value })}
              />
            </FormLayout>
          </BlockStack>
        </Card>
      </BlockStack>
    );
  }

  if (selectedBlock) {
    // Block Settings
    return (
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Block Settings</Text>
        <Card>
          <BlockStack gap="400">
            <FormLayout>
              {Object.entries(selectedBlock.settings).map(([key, value]) => (
                <TextField
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value.toString()}
                  onChange={(newValue) => handleBlockSettingChange(key, newValue)}
                  autoComplete="off"
                />
              ))}
            </FormLayout>
          </BlockStack>
        </Card>
      </BlockStack>
    );
  }

  // Section Settings
  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">Section Settings</Text>
      <Card>
        <BlockStack gap="400">
          <FormLayout>
            {Object.entries(selectedSection.settings).map(([key, value]) => (
              <TextField
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value.toString()}
                onChange={(newValue) => handleSectionSettingChange(key, newValue)}
                autoComplete="off"
              />
            ))}
          </FormLayout>
        </BlockStack>
      </Card>
    </BlockStack>
  );
} 