import { Frame, Loading, Page, BlockStack, Box, InlineStack } from "@shopify/polaris";
import { useState } from "react";
import type { Page as PageType, Section, Block } from "../types.js";
import { SectionList } from "./SectionList.js";
import { SettingsPanel } from "./SettingsPanel.js";
import { PreviewPane } from "./PreviewPane.js";
import { SectionPicker } from "./SectionPicker.js";
import { BlockList } from "./BlockList.js";
import { BlockPicker } from "./BlockPicker.js";

interface PageBuilderProps {
  initialPage?: PageType;
  isLoading?: boolean;
  onSave?: (page: PageType) => Promise<void>;
}

export function PageBuilder({ initialPage, isLoading, onSave }: PageBuilderProps) {
  const [page, setPage] = useState<PageType | undefined>(initialPage);
  const [selectedSectionId, setSelectedSectionId] = useState<string>();
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [isSectionPickerOpen, setIsSectionPickerOpen] = useState(false);
  const [isBlockPickerOpen, setIsBlockPickerOpen] = useState(false);

  const selectedSection = selectedSectionId ? page?.sections[selectedSectionId] : undefined;

  const handleSectionOrderChange = (newOrder: string[]) => {
    if (!page) return;
    setPage({
      ...page,
      section_order: newOrder
    });
  };

  const handleAddSection = (section: Section) => {
    if (!page) return;
    setPage({
      ...page,
      sections: {
        ...page.sections,
        [section.id]: section
      },
      section_order: [...page.section_order, section.id]
    });
    setSelectedSectionId(section.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!page) return;
    const { [sectionId]: _, ...remainingSections } = page.sections;
    setPage({
      ...page,
      sections: remainingSections,
      section_order: page.section_order.filter(id => id !== sectionId)
    });
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(undefined);
      setSelectedBlockId(undefined);
    }
  };

  const handleBlockOrderChange = (newOrder: string[]) => {
    if (!page || !selectedSection) return;
    setPage({
      ...page,
      sections: {
        ...page.sections,
        [selectedSectionId!]: {
          ...selectedSection,
          block_order: newOrder
        }
      }
    });
  };

  const handleAddBlock = (block: Block) => {
    if (!page || !selectedSection) return;
    setPage({
      ...page,
      sections: {
        ...page.sections,
        [selectedSectionId!]: {
          ...selectedSection,
          blocks: {
            ...selectedSection.blocks,
            [block.id]: block
          },
          block_order: [...selectedSection.block_order, block.id]
        }
      }
    });
    setSelectedBlockId(block.id);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!page || !selectedSection) return;
    const { [blockId]: _, ...remainingBlocks } = selectedSection.blocks;
    setPage({
      ...page,
      sections: {
        ...page.sections,
        [selectedSectionId!]: {
          ...selectedSection,
          blocks: remainingBlocks,
          block_order: selectedSection.block_order.filter(id => id !== blockId)
        }
      }
    });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(undefined);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Frame>
        <Page
          title={page?.title || "New Page"}
          primaryAction={{
            content: "Save",
            onAction: () => page && onSave?.(page),
            disabled: !page || isLoading,
          }}
          secondaryActions={[
            {
              content: "Preview",
              onAction: () => {/* TODO: Implement preview */},
            },
            {
              content: "Settings",
              onAction: () => {/* TODO: Implement global settings */},
            }
          ]}
        >
          {isLoading && <Loading />}
          <div style={{ 
            height: "calc(100vh - 56px)",
            display: "flex",
            margin: "-20px -20px 0",
            backgroundColor: "var(--p-surface-subdued)"
          }}>
            {/* Left Sidebar - Section List */}
            <div style={{ 
              width: "240px",
              borderRight: "1px solid var(--p-border-subdued)",
              overflowY: "auto",
              backgroundColor: "var(--p-surface)",
              display: "flex",
              flexDirection: "column"
            }}>
              <Box padding="400">
                <BlockStack gap="400">
                  <InlineStack gap="200" align="space-between">
                    <div style={{ fontWeight: "bold" }}>Sections</div>
                    <button onClick={() => setIsSectionPickerOpen(true)}>Add section</button>
                  </InlineStack>
                  <SectionList
                    sections={page?.sections || {}}
                    sectionOrder={page?.section_order || []}
                    onOrderChange={handleSectionOrderChange}
                    onSectionSelect={setSelectedSectionId}
                    selectedSectionId={selectedSectionId}
                    onAddSection={() => setIsSectionPickerOpen(true)}
                    onDeleteSection={handleDeleteSection}
                  />
                </BlockStack>
              </Box>

              {selectedSection && (
                <Box padding="400" borderWidth="025" borderColor="border" borderBlockStartWidth="025">
                  <BlockStack gap="400">
                    <InlineStack gap="200" align="space-between">
                      <div style={{ fontWeight: "bold" }}>Blocks</div>
                      <button onClick={() => setIsBlockPickerOpen(true)}>Add block</button>
                    </InlineStack>
                    <BlockList
                      blocks={selectedSection.blocks}
                      blockOrder={selectedSection.block_order}
                      onOrderChange={handleBlockOrderChange}
                      onBlockSelect={setSelectedBlockId}
                      selectedBlockId={selectedBlockId}
                      onAddBlock={() => setIsBlockPickerOpen(true)}
                      onDeleteBlock={handleDeleteBlock}
                    />
                  </BlockStack>
                </Box>
              )}
            </div>

            {/* Main Content - Preview */}
            <div style={{ 
              flex: 1,
              overflowY: "auto",
              padding: "var(--p-space-4)",
              display: "flex",
              justifyContent: "center"
            }}>
              <div style={{
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                backgroundColor: "var(--p-surface)",
                borderRadius: "var(--p-border-radius-2)",
                boxShadow: "var(--p-shadow-base)",
                overflow: "hidden"
              }}>
                <PreviewPane
                  page={page}
                  selectedSectionId={selectedSectionId}
                />
              </div>
            </div>

            {/* Right Sidebar - Settings */}
            <div style={{ 
              width: "280px",
              borderLeft: "1px solid var(--p-border-subdued)",
              overflowY: "auto",
              backgroundColor: "var(--p-surface)",
              display: "flex",
              flexDirection: "column"
            }}>
              <Box padding="400">
                <BlockStack gap="400">
                  <div style={{ fontWeight: "bold" }}>
                    {selectedBlockId ? "Block Settings" : 
                     selectedSectionId ? "Section Settings" : 
                     "Page Settings"}
                  </div>
                  <SettingsPanel
                    page={page}
                    selectedSectionId={selectedSectionId}
                    selectedBlockId={selectedBlockId}
                    onPageChange={setPage}
                  />
                </BlockStack>
              </Box>
            </div>
          </div>
        </Page>

        <SectionPicker
          open={isSectionPickerOpen}
          onClose={() => setIsSectionPickerOpen(false)}
          onSelect={handleAddSection}
        />

        {selectedSection && (
          <BlockPicker
            open={isBlockPickerOpen}
            onClose={() => setIsBlockPickerOpen(false)}
            onSelect={handleAddBlock}
            sectionType={selectedSection.type}
          />
        )}
      </Frame>
    </div>
  );
} 