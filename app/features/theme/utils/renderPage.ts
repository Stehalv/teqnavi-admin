import { Liquid } from 'liquidjs';

const engine = new Liquid({
  strictVariables: false,
  strictFilters: false,
  extname: '.liquid'
});

// Register common filters
engine.registerFilter('handle', (value: string) => {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
});

engine.registerFilter('img_url', (value: string, size = 'master') => {
  if (!value) return '';
  // For now, just return the image URL as is
  return value;
});

engine.registerFilter('escape', (value: string) => {
  if (!value) return '';
  return value.replace(/[&<>"']/g, (char) => {
    const entities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[char];
  });
});

engine.registerFilter('default', (value: any, defaultValue: any) => {
  return value || defaultValue;
});

engine.registerFilter('blank', (value: any) => {
  return value === undefined || value === null || value === '';
});

engine.registerFilter('image_url', (value: string) => {
  if (!value) return '';
  return value;
});

interface PageContent {
  sections: {
    [key: string]: {
      type: string;
      settings: Record<string, any>;
      blocks?: {
        [key: string]: {
          type: string;
          settings: Record<string, any>;
          source?: string;
        }
      };
    }
  };
  order: string[];
}

interface Section {
  id: string;
  type: string;
  settings: Record<string, any>;
  blocks?: Block[];
}

interface Block {
  id: string;
  type: string;
  settings: Record<string, any>;
}

export async function renderPage(pageContent: PageContent) {
  try {
    // Transform sections object into ordered array
    const orderedSections = pageContent.order.map(sectionId => ({
      id: sectionId,
      ...pageContent.sections[sectionId],
      // Transform blocks object into array
      blocks: pageContent.sections[sectionId].blocks 
        ? Object.entries(pageContent.sections[sectionId].blocks!).map(([blockId, block]) => ({
            id: blockId,
            ...block
          }))
        : []
    }));

    const sectionsHtml = orderedSections.map(section => {
      return `<div id="shopify-section-${section.id}" class="shopify-section">
        <div class="section-${section.type}">
          <div class="section__content">
            ${section.blocks?.map(block => `
              <div id="block-${block.id}" class="block-${block.type}">
                ${renderBlock(block)}
              </div>
            `).join('\n') || ''}
          </div>
        </div>
      </div>`;
    });

    return sectionsHtml.join('\n');
  } catch (error) {
    console.error('Error rendering page:', error);
    throw error;
  }
}

function renderBlock(block: Block): string {
  // For now, just show block type and settings
  return `
    <div class="block__content">
      <h3>${block.type}</h3>
      <pre>${JSON.stringify(block.settings, null, 2)}</pre>
    </div>
  `;
} 