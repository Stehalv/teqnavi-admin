import { Liquid, Tag, TagToken, TopLevelToken, Template } from 'liquidjs';
import type { Page, Section, Block } from '../types/shopify.js';
import { TemplateService } from './template.server.js';
import { SnippetFileSystem } from './snippet-filesystem.server.js';

interface RenderContext {
  section: {
    id: string;
    type: string;
    settings: Record<string, any>;
    blocks: Record<string, Block>;
    block_order: string[];
  };
  blocks: string[];
  settings: Record<string, any>;
}

export class RendererService {
  private static getEngine(shopId: string) {
    const engine = new Liquid({
      jsTruthy: true,
      cache: process.env.NODE_ENV === 'production',
      strictVariables: false,
      strictFilters: false,
      fs: new SnippetFileSystem(shopId),
      globals: {
        Shopify: {
          shop: {
            name: 'Test Shop',
            email: 'test@example.com',
            domain: 'test.myshopify.com'
          }
        }
      }
    });

    // Register common Shopify filters
    engine.registerFilter('asset_url', (value: string) => `/assets/${value}`);
    engine.registerFilter('image_url', (value: string, size: string) => `/images/${value}?size=${size}`);
    engine.registerFilter('money', (value: number) => `$${value.toFixed(2)}`);
    engine.registerFilter('default', (value: any, defaultValue: any) => value || defaultValue);
    engine.registerFilter('json', (value: any) => JSON.stringify(value));

    // Register common Shopify tags
    class EmptyTag extends Tag {
      constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
        super(tagToken, remainTokens, liquid);
        this.tokenizer.readToDelimiter(`end${tagToken.name}`);
      }

      render() {
        return Promise.resolve('');
      }
    }

    engine.registerTag('schema', EmptyTag);

    const createContentTag = (wrapper: string) => {
      return class ContentTag extends Tag {
        content: string;

        constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
          super(tagToken, remainTokens, liquid);
          const content = this.tokenizer.readToDelimiter(`end${tagToken.name}`);
          this.content = content.toString();
        }

        render() {
          return Promise.resolve(`<${wrapper}>${this.content}</${wrapper}>`);
        }
      };
    };

    engine.registerTag('style', createContentTag('style'));
    engine.registerTag('javascript', createContentTag('script'));

    return engine;
  }

  static async renderSection(shopId: string, section: Section, sectionKey: string): Promise<string> {
    console.log('Rendering section:', {
      type: section.type,
      settings: section.settings,
      blocks: section.blocks,
      block_order: section.block_order
    });
    
    const template = await TemplateService.getSectionDefinition(shopId, section.type);
    if (!template) {
      console.warn(`No template found for section type: ${section.type}`);
      return `<div class="section" data-section-type="${section.type}">
        <div style="padding: 20px; text-align: center; background: #f4f6f8; border: 1px dashed #8c9196;">
          <p>No template found for section type: ${section.type}</p>
        </div>
      </div>`;
    }

    console.log('Found template:', {
      type: template.type,
      name: template.name,
      schema: template.schema,
      hasLiquid: !!template.liquid
    });

    const context = {
      section: {
        id: sectionKey,
        type: section.type,
        settings: section.settings || {},
        blocks: section.blocks || {},
        block_order: section.block_order || []
      },
      blocks: [],
      forloop: {
        length: 0,
        index: 0,
        index0: 0,
        rindex: 0,
        rindex0: 0,
        first: true,
        last: true
      }
    };

    try {
      console.log('Rendering template with context:', JSON.stringify(context, null, 2));
      const engine = this.getEngine(shopId);
      const html = await engine.parseAndRender(template.liquid, context);
      console.log('Successfully rendered section:', section.type);
      return this.wrapSection(html, section, sectionKey);
    } catch (error) {
      console.error('Error rendering section:', error);
      console.error('Template liquid:', template.liquid);
      return `<div class="section" data-section-type="${section.type}">
        <div style="padding: 20px; text-align: center; background: #fee7e6; border: 1px dashed #d82c0d;">
          <p>Error rendering section: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <pre style="text-align: left; margin-top: 10px; padding: 10px; background: #fff;">${error instanceof Error ? error.stack : ''}</pre>
        </div>
      </div>`;
    }
  }

  private static wrapSection(content: string, section: Section, sectionKey: string): string {
    const sectionStyles = section.styles || '';
    return `
      <style>
        [data-section-id="${sectionKey}"] {
          ${sectionStyles}
        }
      </style>
      <div class="section" 
           data-section-id="${sectionKey}" 
           data-section-type="${section.type}"
           style="
             padding-top: ${section.settings.padding_top || 0}px;
             padding-bottom: ${section.settings.padding_bottom || 0}px;
             ${section.settings.custom_class ? `class="${section.settings.custom_class}"` : ''}
           ">
        ${content}
      </div>
    `;
  }

  private static async renderBlock(block: Block, blockKey: string, sectionKey: string): Promise<string> {
    const context = {
      block: {
        id: blockKey,
        type: block.type,
        settings: block.settings,
        section: sectionKey
      }
    };

    try {
      const engine = this.getEngine('dummy'); // TODO: Pass shopId when available
      const rendered = await engine.parseAndRender(`
        <div class="block" data-block-id="{{ block.id }}" data-block-type="{{ block.type }}">
          {% for setting in block.settings %}
            <div class="block-setting">
              <strong>{{ setting[0] }}:</strong> {{ setting[1] }}
            </div>
          {% endfor %}
        </div>
      `, context);

      return rendered;
    } catch (error) {
      console.error('Error rendering block:', error);
      return `
        <div class="block block-error" data-block-id="${blockKey}" data-block-type="${block.type}">
          <div class="block-content">
            <pre>${JSON.stringify(block.settings, null, 2)}</pre>
          </div>
        </div>
      `;
    }
  }

  static async renderPage(shopId: string, page: Page): Promise<string> {
    const renderedSections = await Promise.all(
      page.data.order.map(async (sectionKey) => {
        const section = page.data.sections[sectionKey];
        if (!section) return '';
        return this.renderSection(shopId, section, sectionKey);
      })
    );

    return `
      <div class="page-content" data-page-id="${page.id}">
        ${renderedSections.join('\n')}
      </div>
    `;
  }

  private static renderFallback(section: Section, sectionKey: string): string {
    return `
      <div class="section section-fallback" data-section-id="${sectionKey}" data-section-type="${section.type}">
        <div class="section-content">
          <h3>Section: ${section.type}</h3>
          <pre>${JSON.stringify(section.settings, null, 2)}</pre>
          <div class="blocks">
            ${Object.entries(section.blocks || {}).map(([blockKey, block]) => `
              <div class="block" data-block-id="${blockKey}" data-block-type="${block.type}">
                <h4>Block: ${block.type}</h4>
                <pre>${JSON.stringify(block.settings, null, 2)}</pre>
              </div>
            `).join('\n')}
          </div>
        </div>
      </div>
    `;
  }

  static async previewSection(shopId: string, section: Section, sectionKey: string): Promise<string> {
    try {
      return await this.renderSection(shopId, section, sectionKey);
    } catch (error) {
      console.error('Preview render error:', error);
      return `
        <div style="padding: 20px; background-color: #FEF2F2; color: #991B1B; border-radius: 4px;">
          <h3>Preview Error</h3>
          <p>${error instanceof Error ? error.message : 'Failed to render preview'}</p>
        </div>
      `;
    }
  }
} 