import React, { memo } from 'react';
import { Card, Text, Button, BlockStack, Icon } from '@shopify/polaris';
import { ImageIcon, ProductIcon } from '@shopify/polaris-icons';
import type { Section, Block } from '../../types/shopify.js';
import styles from './SectionRenderer.module.css';

interface SectionRendererProps {
  section: Section;
  sectionKey: string;
  isSelected: boolean;
  selectedBlockKey?: string;
}

export const SectionRenderer = memo(function SectionRenderer({
  section,
  sectionKey,
  isSelected,
  selectedBlockKey
}: SectionRendererProps) {
  // Render blocks based on section.blocks and section.block_order
  const renderBlocks = () => {
    if (!section.blocks || !section.block_order) return null;

    return section.block_order.map((blockKey: string) => {
      const block = section.blocks[blockKey];
      if (!block) return null;

      return renderBlock(block, blockKey);
    });
  };

  const renderBlock = (block: Block, blockKey: string) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={blockKey} className={`${styles.blockWrapper} ${selectedBlockKey === blockKey ? styles.selectedBlock : ''}`}>
            <Text
              as="p"
              variant={block.settings.size === 'large' ? 'headingMd' : block.settings.size === 'medium' ? 'bodyLg' : 'bodyMd'}
              tone={block.settings.color ? undefined : 'subdued'}
            >
              <span style={{ color: block.settings.color, textAlign: block.settings.alignment }}>
                {block.settings.text}
              </span>
            </Text>
          </div>
        );

      case 'image':
        return (
          <div key={blockKey} className={`${styles.blockWrapper} ${selectedBlockKey === blockKey ? styles.selectedBlock : ''}`}>
            {block.settings.image ? (
              <img
                src={block.settings.image}
                alt={block.settings.alt || ''}
                className={styles.image}
                style={{ aspectRatio: block.settings.aspect_ratio }}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <Icon source={ImageIcon} />
                <Text as="span" tone="subdued">Add an image</Text>
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <div key={blockKey} className={`${styles.blockWrapper} ${selectedBlockKey === blockKey ? styles.selectedBlock : ''}`}>
            <Button
              variant={block.settings.style}
              size={block.settings.size === 'small' ? 'slim' : block.settings.size === 'large' ? 'large' : 'medium'}
              url={block.settings.link}
              external={block.settings.open_in_new_tab}
              fullWidth={block.settings.full_width}
            >
              {block.settings.text}
            </Button>
          </div>
        );

      case 'product':
        const productImage = block.settings.product_id ? `/products/${block.settings.product_id}/image` : undefined;
        const productTitle = block.settings.product_id ? 'Product Title' : 'Select a product';

        return (
          <div key={blockKey} className={`${styles.blockWrapper} ${selectedBlockKey === blockKey ? styles.selectedBlock : ''}`}>
            <Card>
              <BlockStack gap="200">
                <div className={styles.productImage}>
                  {productImage ? (
                    <img src={productImage} alt={productTitle} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <Icon source={ProductIcon} />
                      <Text as="span" tone="subdued">Select a product</Text>
                    </div>
                  )}
                </div>
                <BlockStack gap="100">
                  {block.settings.show_vendor && (
                    <Text as="p" variant="bodySm" tone="subdued">Vendor Name</Text>
                  )}
                  <Text as="p" variant="bodyMd">{productTitle}</Text>
                  {block.settings.show_price && (
                    <Text as="p" variant="bodyMd" tone="success">$99.99</Text>
                  )}
                  {block.settings.enable_quick_add && (
                    <Button size="slim">Add to Cart</Button>
                  )}
                </BlockStack>
              </BlockStack>
            </Card>
          </div>
        );

      default:
        return (
          <div key={blockKey} className={`${styles.blockWrapper} ${selectedBlockKey === blockKey ? styles.selectedBlock : ''}`}>
            <Text as="p" tone="critical">Unknown block type</Text>
          </div>
        );
    }
  };

  // Render section based on type
  switch (section.type) {
    case 'hero':
      return (
        <div
          className={styles.heroSection}
          style={{
            backgroundColor: section.settings.background_type === 'color' ? section.settings.background_value : undefined,
            backgroundImage: section.settings.background_type === 'image' ? `url(${section.settings.background_value})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className={styles.heroOverlay} style={{ opacity: section.settings.overlay_opacity }} />
          <div className={styles.heroContent}>
            <BlockStack gap="400" align="center">
              <Text as="h1" variant="heading2xl">
                <span style={{ color: section.settings.text_color, textAlign: 'center' }}>
                  {section.settings.heading}
                </span>
              </Text>
              {section.settings.subheading && (
                <Text as="p" variant="headingLg">
                  <span style={{ color: section.settings.text_color, textAlign: 'center' }}>
                    {section.settings.subheading}
                  </span>
                </Text>
              )}
              {section.settings.button_text && (
                <Button url={section.settings.button_link}>
                  {section.settings.button_text}
                </Button>
              )}
            </BlockStack>
          </div>
        </div>
      );

    case 'featured-collection':
      return (
        <div className={styles.collectionSection}>
          <BlockStack gap="400" align="center">
            <Text as="h2" variant="headingXl">
              <span style={{ textAlign: 'center' }}>
                {section.settings.title}
              </span>
            </Text>
            <div
              className={styles.productGrid}
              style={{
                gridTemplateColumns: `repeat(${section.settings.columns_desktop}, 1fr)`
              }}
            >
              {Array.from({ length: section.settings.products_to_show }).map((_, index) => (
                <div key={index} className={styles.productCard}>
                  <div className={styles.productImage} />
                  <div className={styles.productInfo}>
                    <Text as="p" variant="bodyMd">Product Title</Text>
                    <Text as="p" variant="bodySm" tone="subdued">$99.99</Text>
                  </div>
                </div>
              ))}
            </div>
            {section.settings.show_view_all && (
              <Button>View All</Button>
            )}
          </BlockStack>
        </div>
      );

    default:
      return <div className={styles.blockContainer}>{renderBlocks()}</div>;
  }
}); 