import { useEffect, useState } from "react";
import { renderPage } from "../utils/renderPage.js";

interface PagePreviewProps {
  page: {
    id: string;
    name: string;
    content: string;
  };
  selectedItemId?: string | null;
}

export function PagePreview({ page, selectedItemId }: PagePreviewProps) {
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const render = async () => {
      try {
        // Parse the page content to get sections and blocks
        const pageContent = JSON.parse(page.content);
        const html = await renderPage(pageContent);

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
            .selected-item {
              outline: 2px solid #5c6ac4;
              outline-offset: 2px;
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
        setError(error instanceof Error ? error.message : 'Unknown error');
        setRenderedContent('');
      }
    };

    render();
  }, [page, selectedItemId]);

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