import { Modal, BlockStack, Button, Text, Card } from "@shopify/polaris";
import type { Section } from "../types.js";

interface SectionPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (section: Section) => void;
}

const SECTION_TEMPLATES = {
  hero: {
    type: "hero",
    settings: {
      heading: "Welcome to our store",
      subheading: "Shop the latest trends",
      button_text: "Shop Now",
      button_link: "/collections/all",
      background_color: "#000000",
      text_color: "#ffffff"
    },
    blocks: {},
    block_order: []
  },
  "featured-collection": {
    type: "featured-collection",
    settings: {
      title: "Featured Products",
      collection: "frontpage",
      products_to_show: 4,
      show_view_all: true
    },
    blocks: {},
    block_order: []
  }
};

export function SectionPicker({ open, onClose, onSelect }: SectionPickerProps) {
  const handleSelect = (type: keyof typeof SECTION_TEMPLATES) => {
    const template = SECTION_TEMPLATES[type];
    const newSection: Section = {
      ...template,
      id: `section-${Date.now()}`,
    };
    onSelect(newSection);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Section"
      primaryAction={{
        content: "Cancel",
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Choose a section type to add to your page
          </Text>
          
          <BlockStack gap="400">
            <div onClick={() => handleSelect("hero")} style={{ cursor: "pointer" }}>
              <Card padding="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Hero</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Add a hero section with heading, subheading, and call-to-action button
                  </Text>
                </BlockStack>
              </Card>
            </div>

            <div onClick={() => handleSelect("featured-collection")} style={{ cursor: "pointer" }}>
              <Card padding="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Featured Collection</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Display a collection of products in a grid layout
                  </Text>
                </BlockStack>
              </Card>
            </div>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
} 