import { useEffect, useState } from "react";
import { renderPage } from "../utils/renderPage.js";
import type { ThemeAsset, JsonifyObject } from "../types.js";

// Move file block types outside component to prevent recreation on each render
const fileBlockTypes: ThemeAsset[] = [
  {
    id: 'text',
    name: 'text',
    type: 'block',
    content: `<div style="text-align: {{ settings.text_align }}">{{ settings.text }}</div>`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    shopId: '',
    settings: '{}',
    template_format: 'liquid',
    handle: 'text',
    source: 'app'
  },
  {
    id: 'heading',
    name: 'heading',
    type: 'block',
    content: `<{{ settings.heading_size }} style="text-align: {{ settings.text_align }}">{{ settings.heading }}</{{ settings.heading_size }}>`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    shopId: '',
    settings: '{}',
    template_format: 'liquid',
    handle: 'heading',
    source: 'app'
  },
  {
    id: 'button',
    name: 'button',
    type: 'block',
    content: `<div style="text-align: {{ settings.alignment }}">
      <a href="{{ settings.link }}" class="button button--{{ settings.style }}">
        {{ settings.text }}
      </a>
    </div>`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    shopId: '',
    settings: '{}',
    template_format: 'liquid',
    handle: 'button',
    source: 'app'
  }
];

interface PagePreviewProps {
  page: ThemeAsset | JsonifyObject<ThemeAsset>;
  sections: (ThemeAsset | JsonifyObject<ThemeAsset>)[];
  blocks: (ThemeAsset | JsonifyObject<ThemeAsset>)[];
}

export function PagePreview({ page, sections, blocks }: PagePreviewProps) {
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const render = async () => {
      try {
        // Combine blocks from both sources
        const allBlocks = [...fileBlockTypes, ...blocks];
        const html = await renderPage(page, sections, allBlocks);

        // Store the rendered HTML
        await fetch('/api/store-rendered-html', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageId: page.id,
            renderedHtml: html
          })
        });

        const finalHtml = `
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: system-ui, -apple-system, sans-serif; 
            }
            .shopify-section { 
              margin: 0; 
            }
            .page-width { 
              max-width: 1200px; 
              margin: 0 auto; 
              padding: 0 1.5rem; 
            }
            .section { 
              margin: 0; 
              padding: 2rem 0;
            }
            .section__title {
              margin-bottom: 2rem;
              text-align: center;
              font-size: 2rem;
            }
            .section__content {
              display: flex;
              flex-direction: column;
              gap: 2rem;
            }
            .title-wrapper-with-link {
              text-align: center;
              margin-bottom: 2rem;
            }
            .title {
              margin: 0;
              padding: 2rem 0;
              font-size: 2.4rem;
            }
            .main-page-content {
              padding: 2rem 0;
            }
            .page-margin-top {
              margin-top: 2rem;
            }
            /* Button styles */
            .button {
              display: inline-block;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 4px;
              transition: all 0.3s ease;
            }
            .button--primary {
              background-color: #000;
              color: #fff !important;
              border: 2px solid #000;
            }
            .button--primary:hover {
              background-color: #333;
              border-color: #333;
            }
            .button--secondary {
              background-color: #666;
              color: #fff !important;
              border: 2px solid #666;
            }
            .button--secondary:hover {
              background-color: #888;
              border-color: #888;
            }
            .button--outline {
              background-color: transparent;
              color: #000 !important;
              border: 2px solid #000;
            }
            .button--outline:hover {
              background-color: #000;
              color: #fff !important;
            }
          </style>
          <div class="main-page-content page-width page-margin-top">
            <div class="title-wrapper-with-link">
              <h1 class="title">${page.name}</h1>
            </div>
            <div class="rte">
              ${html}
            </div>
          </div>
        `;
        setError(null);
        setRenderedContent(finalHtml);
      } catch (error) {
        console.error('Error rendering page:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setRenderedContent('');
      }
    };

    render();
  }, [page, sections, blocks]);

  if (error) {
    return <div style={{ color: 'red', padding: '1rem' }}>{error}</div>;
  }

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        overflow: 'auto'
      }}
      dangerouslySetInnerHTML={{ __html: renderedContent }} 
    />
  );
} 