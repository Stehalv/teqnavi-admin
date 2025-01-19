import { Card } from "@shopify/polaris";
import type { Page, Section, Block } from "../types.js";

interface PreviewPaneProps {
  page?: Page;
  selectedSectionId?: string;
  selectedBlockId?: string;
}

// Block components
function ButtonBlock({ block }: { block: Block }) {
  const { text, link, style, size } = block.settings;
  return (
    <button
      style={{
        backgroundColor: style === "primary" ? "var(--p-action-primary)" : "transparent",
        color: style === "primary" ? "white" : "var(--p-text)",
        padding: size === "large" ? "var(--p-space-4) var(--p-space-6)" : "var(--p-space-2) var(--p-space-4)",
        border: style === "primary" ? "none" : "1px solid var(--p-border)",
        borderRadius: "var(--p-border-radius-2)",
        fontSize: size === "large" ? "1.125rem" : "1rem",
        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}

function ImageBlock({ block }: { block: Block }) {
  const { image, alt, overlay_opacity } = block.settings;
  return (
    <div style={{ position: "relative" }}>
      {image ? (
        <img src={image} alt={alt} style={{ width: "100%", height: "auto" }} />
      ) : (
        <div style={{ 
          aspectRatio: "16/9",
          backgroundColor: "var(--p-surface-neutral)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--p-text-subdued)"
        }}>
          Image placeholder
        </div>
      )}
      {overlay_opacity > 0 && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0, 0, 0, ${overlay_opacity})`
        }} />
      )}
    </div>
  );
}

function ProductBlock({ block }: { block: Block }) {
  const { product_id, show_price, show_vendor, show_rating } = block.settings;
  return (
    <Card>
      <div style={{ 
        aspectRatio: "1",
        backgroundColor: "var(--p-surface-neutral)",
        marginBottom: "var(--p-space-2)"
      }} />
      <div style={{ padding: "var(--p-space-2)" }}>
        <p>Product Title</p>
        {show_vendor && <p style={{ color: "var(--p-text-subdued)" }}>Vendor Name</p>}
        {show_price && <p style={{ fontWeight: "bold" }}>$99.99</p>}
        {show_rating && <p style={{ color: "var(--p-text-subdued)" }}>★★★★☆</p>}
      </div>
    </Card>
  );
}

// Components for different section types
function HeroSection({ section, selectedBlockId }: { section: Section; selectedBlockId?: string }) {
  const { heading, subheading, background_color, text_color } = section.settings;
  
  return (
    <div style={{ 
      backgroundColor: background_color, 
      color: text_color,
      padding: "var(--p-space-8)",
      textAlign: "center"
    }}>
      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "var(--p-space-4)",
        color: "inherit"
      }}>
        {heading}
      </h1>
      <p style={{ 
        fontSize: "1.25rem",
        marginBottom: "var(--p-space-6)",
        color: "inherit"
      }}>
        {subheading}
      </p>
      {section.block_order.map((blockId) => {
        const block = section.blocks[blockId];
        const isSelected = blockId === selectedBlockId;
        return (
          <div 
            key={blockId}
            style={{ 
              outline: isSelected ? "2px solid var(--p-action-primary)" : "none",
              padding: "var(--p-space-2)"
            }}
          >
            {renderBlock(block)}
          </div>
        );
      })}
    </div>
  );
}

function FeaturedCollectionSection({ section, selectedBlockId }: { section: Section; selectedBlockId?: string }) {
  const { title } = section.settings;
  
  return (
    <div style={{ padding: "var(--p-space-8)" }}>
      <h2 style={{ 
        fontSize: "2rem",
        marginBottom: "var(--p-space-6)",
        textAlign: "center"
      }}>
        {title}
      </h2>
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "var(--p-space-4)"
      }}>
        {section.block_order.map((blockId) => {
          const block = section.blocks[blockId];
          const isSelected = blockId === selectedBlockId;
          return (
            <div 
              key={blockId}
              style={{ 
                outline: isSelected ? "2px solid var(--p-action-primary)" : "none",
                padding: "var(--p-space-2)"
              }}
            >
              {renderBlock(block)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderBlock(block: Block) {
  switch (block.type) {
    case "button":
      return <ButtonBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "product":
      return <ProductBlock block={block} />;
    default:
      return (
        <div style={{ padding: "var(--p-space-4)", textAlign: "center" }}>
          Unknown block type: {block.type}
        </div>
      );
  }
}

export function PreviewPane({ page, selectedSectionId, selectedBlockId }: PreviewPaneProps) {
  if (!page) return null;

  const renderSection = (section: Section) => {
    switch (section.type) {
      case "hero":
        return <HeroSection section={section} selectedBlockId={selectedBlockId} />;
      case "featured-collection":
        return <FeaturedCollectionSection section={section} selectedBlockId={selectedBlockId} />;
      default:
        return (
          <div style={{ padding: "var(--p-space-4)", textAlign: "center" }}>
            Unknown section type: {section.type}
          </div>
        );
    }
  };

  return (
    <div style={{ 
      backgroundColor: page.settings.background.value,
      minHeight: "100%"
    }}>
      {page.section_order.map((sectionId) => (
        <div 
          key={sectionId}
          style={{ 
            outline: selectedSectionId === sectionId 
              ? "2px solid var(--p-action-primary)"
              : "none",
            marginBottom: `${page.settings.spacing}px`
          }}
        >
          {renderSection(page.sections[sectionId])}
        </div>
      ))}
    </div>
  );
} 