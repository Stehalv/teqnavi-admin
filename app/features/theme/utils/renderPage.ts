import { Liquid } from 'liquidjs';
import type { ThemeAsset, JsonifyObject } from "../types.js";

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

export async function renderPage(
  page: ThemeAsset | JsonifyObject<ThemeAsset>, 
  sections: (ThemeAsset | JsonifyObject<ThemeAsset>)[], 
  blocks: (ThemeAsset | JsonifyObject<ThemeAsset>)[]
) {
  try {
    let pageContent;
    try {
      pageContent = JSON.parse(page.content);
    } catch (e) {
      // If content is not JSON, treat it as a Liquid template
      pageContent = { 
        order: ['main'],
        sections: {
          main: {
            type: page.type || 'main',
            settings: {},
            blocks: {}
          }
        }
      };
    }
    
    // Pre-process content to handle stylesheets and extract schema
    const processContent = (content: string) => {
      let schema: { settings?: Array<{ id: string, default?: any }> } = {};
      const schemaMatch = content.match(/{% schema %}([\s\S]*?){% endschema %}/);
      if (schemaMatch) {
        try {
          schema = JSON.parse(schemaMatch[1]);
        } catch (error) {
          console.error('Error parsing schema:', error);
        }
      }

      // Extract stylesheets and convert to style tags
      const processed = content
        .replace(/{% schema %}[\s\S]*?{% endschema %}/, '')
        .replace(/{% stylesheet %}([\s\S]*?){% endstylesheet %}/g, (_, css) => {
          return `<style>${css.trim()}</style>`;
        })
        .replace(/{% style %}([\s\S]*?){% endstyle %}/g, (_, css) => {
          return `<style>${css.trim()}</style>`;
        })
        .replace(/{% javascript %}[\s\S]*?{% endjavascript %}/g, '');
      
      return { content: processed, schema };
    };

    // Create a map of block types to their templates and schemas
    const blockTemplates = new Map();
    blocks.forEach(block => {
      if (block.content) {
        const { content, schema } = processContent(block.content);
        const blockType = (block.handle || block.name).toLowerCase().replace(/\s+/g, '-');
        blockTemplates.set(blockType, { content, schema });
      }
    });

    const sectionsHtml = pageContent.order.length > 0 ? 
      await Promise.all(
        pageContent.order.map(async (sectionId: string) => {
          const section = pageContent.sections[sectionId];

          // Try to find section by name or handle
          const sectionAsset = sections.find(s => {
            const sectionType = section.type.toLowerCase().replace(/\s+/g, '-');
            const assetName = (s.name || '').toLowerCase().replace(/\s+/g, '-');
            const assetHandle = (s.handle || '').toLowerCase().replace(/\s+/g, '-');
            return assetName === sectionType || assetHandle === sectionType;
          });

          if (!sectionAsset || !sectionAsset.content) {
            return `<div id="shopify-section-${sectionId}" class="shopify-section">
              <div class="section-${section.type}">Section not found: ${section.type}</div>
            </div>`;
          }

          // Process section content and get schema
          const { content: sectionContent, schema: sectionSchema } = processContent(sectionAsset.content);

          // Create section context with settings merged with defaults
          const context = {
            section: {
              id: sectionId,
              settings: section.settings || {},
              blocks: section.blocks ? Object.entries(section.blocks).map(([blockId, block]) => {
                if (!block || typeof block !== 'object' || !('type' in block)) {
                  return null;
                }
                const blockType = block.type.toString().toLowerCase().replace(/\s+/g, '-');
                const template = blockTemplates.get(blockType);
                const blockSettings = 'settings' in block && typeof block.settings === 'object' ? block.settings : {};
                const blockSource = 'source' in block ? block.source : 'section';
                
                if (template?.schema?.settings) {
                  // Merge block settings with defaults from schema
                  const defaultSettings = template.schema.settings.reduce((acc, setting) => {
                    if ('default' in setting) {
                      acc[setting.id] = setting.default;
                    }
                    return acc;
                  }, {});
                  return {
                    type: blockType,
                    source: blockSource,
                    settings: { ...defaultSettings, ...blockSettings },
                    shopify_attributes: ''
                  };
                }
                return {
                  type: blockType,
                  source: blockSource,
                  settings: blockSettings,
                  shopify_attributes: ''
                };
              }).filter(Boolean) : []
            }
          };

          // Register block rendering tag
          engine.registerTag('render_block', {
            parse(token) {
              this.templates = blockTemplates;
              this.args = token.args;
            },
            async render(context) {
              const block = await this.liquid.evalValue(this.args, context);
              if (!block) return '';
              
              const template = this.templates.get(block.type);
              if (!template) {
                console.log(`No template found for block type: ${block.type}`);
                return '';
              }
              return this.liquid.parseAndRender(template.content, { 
                block,
                settings: block.settings
              });
            }
          });

          // If section has schema settings, merge with defaults
          if (sectionSchema?.settings) {
            const defaultSettings = sectionSchema.settings.reduce((acc, setting) => {
              if ('default' in setting) {
                acc[setting.id] = setting.default;
              }
              return acc;
            }, {});
            context.section.settings = { ...defaultSettings, ...context.section.settings };
          }

          try {
            // First render the section template
            const template = await engine.parseAndRender(sectionContent, context);

            return `<div id="shopify-section-${sectionId}" class="shopify-section">
              <div class="section-${section.type}">
                ${template}
              </div>
            </div>`;
          } catch (renderError) {
            console.error('Error rendering section:', renderError);
            return `<div class="error">Error rendering section: ${section.type}<br>Error: ${renderError.message}</div>`;
          }
        })
      ) : 
      [`<div class="shopify-section empty-page">
          <div class="page-width">
            <div class="section">
              <p style="text-align: center; padding: 4rem 0; color: #666;">
                No sections added yet. Use the customizer to add sections to your page.
              </p>
            </div>
          </div>
        </div>`];

    return sectionsHtml.join('\n');
  } catch (error) {
    console.error('Error rendering page:', error);
    throw error;
  }
} 