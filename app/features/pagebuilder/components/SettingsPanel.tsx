import { BlockStack, Card, FormLayout, Select, Text, TextField } from "@shopify/polaris";
import type { Page, Block } from "../types.js";

interface SettingsPanelProps {
  page: Page;
  selectedSectionId?: string;
  selectedBlockId?: string;
  onPageChange: (page: Page) => void;
}

export function SettingsPanel({ 
  page, 
  selectedSectionId, 
  selectedBlockId,
  onPageChange 
}: SettingsPanelProps) {
  const selectedSection = selectedSectionId 
    ? page?.sections[selectedSectionId] 
    : null;

  const selectedBlock = selectedBlockId && selectedSection?.blocks 
    ? selectedSection.blocks[selectedBlockId] 
    : null;

  const handleSettingChange = (key: string, value: string) => {
    if (selectedBlock) {
      // Update block settings
      const updatedBlocks = {
        ...selectedSection!.blocks,
        [selectedBlockId!]: {
          ...selectedBlock,
          settings: {
            ...selectedBlock.settings,
            [key]: value
          }
        }
      };

      const updatedSections = {
        ...page.sections,
        [selectedSectionId!]: {
          ...selectedSection!,
          blocks: updatedBlocks
        }
      };

      onPageChange({
        ...page,
        sections: updatedSections
      });
    } else if (selectedSection) {
      // Update section settings
      const updatedSections = {
        ...page.sections,
        [selectedSectionId!]: {
          ...selectedSection,
          settings: {
            ...selectedSection.settings,
            [key]: value
          }
        }
      };

      onPageChange({
        ...page,
        sections: updatedSections
      });
    } else {
      // Update page settings
      onPageChange({
        ...page,
        settings: {
          ...page.settings,
          [key]: value
        }
      });
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          {selectedBlock 
            ? "Block Settings" 
            : selectedSection 
              ? "Section Settings" 
              : "Page Settings"}
        </Text>
        
        <FormLayout>
          {selectedBlock ? (
            // Block settings
            <>
              {selectedBlock.type === "text" && (
                <TextField
                  label="Text"
                  value={selectedBlock.settings.text}
                  onChange={(value) => handleSettingChange("text", value)}
                  multiline={4}
                  autoComplete="off"
                />
              )}

              {selectedBlock.type === "button" && (
                <>
                  <TextField
                    label="Button text"
                    value={selectedBlock.settings.text}
                    onChange={(value) => handleSettingChange("text", value)}
                    autoComplete="off"
                  />
                  <TextField
                    label="Link"
                    value={selectedBlock.settings.link}
                    onChange={(value) => handleSettingChange("link", value)}
                    autoComplete="off"
                  />
                </>
              )}

              {selectedBlock.type === "image" && (
                <>
                  <TextField
                    label="Image URL"
                    value={selectedBlock.settings.src}
                    onChange={(value) => handleSettingChange("src", value)}
                    autoComplete="off"
                  />
                  <TextField
                    label="Alt text"
                    value={selectedBlock.settings.alt}
                    onChange={(value) => handleSettingChange("alt", value)}
                    autoComplete="off"
                  />
                </>
              )}
            </>
          ) : selectedSection ? (
            // Section settings
            <>
              <TextField
                label="Title"
                value={selectedSection.settings.title}
                onChange={(value) => handleSettingChange("title", value)}
                autoComplete="off"
              />
              <Select
                label="Layout"
                options={[
                  { label: "Default", value: "default" },
                  { label: "Wide", value: "wide" }
                ]}
                value={selectedSection.settings.layout}
                onChange={(value) => handleSettingChange("layout", value)}
              />
            </>
          ) : (
            // Page settings
            <>
              <TextField
                label="Title"
                value={page.title}
                onChange={(value) => onPageChange({ ...page, title: value })}
                autoComplete="off"
              />
              <TextField
                label="SEO Description"
                value={page.settings.seo.description}
                onChange={(value) => handleSettingChange("seo.description", value)}
                multiline={4}
                autoComplete="off"
              />
            </>
          )}
        </FormLayout>
      </BlockStack>
    </Card>
  );
} 