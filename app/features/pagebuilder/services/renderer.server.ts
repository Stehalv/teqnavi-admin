import { Liquid } from 'liquidjs';
import type { Page, Section, Block } from '../types/shopify.js';
import { TemplateService } from './template.server.js';

export class RendererService {
  private static engine = new Liquid({
    cache: process.env.NODE_ENV === 'production'
  });

  static async renderSection(shopId: string, section: Section, sectionKey: string): Promise<string> {
    const template = await TemplateService.getSectionDefinition(shopId, section.type);
    if (!template) {
      throw new Error(`Template not found for section type: ${section.type}`);
    }

    const renderedBlocks = await Promise.all(
      section.block_order.map(async (blockKey) => {
        const block = section.blocks[blockKey];
        if (!block) return '';

        const blockDefinition = template.schema.blocks?.find(b => b.type === block.type);
        if (!blockDefinition) {
          throw new Error(`Block definition not found for type: ${block.type}`);
        }

        return this.renderBlock(block, blockKey, sectionKey);
      })
    );

    const context = {
      section: {
        id: sectionKey,
        type: section.type,
        settings: section.settings,
        blocks: renderedBlocks
      }
    };

    // Return a placeholder preview since actual rendering is handled by Shopify
    return `
      <div class="section" data-section-id="${sectionKey}" data-section-type="${section.type}">
        <div class="section-content">
          ${renderedBlocks.join('\n')}
        </div>
      </div>
    `;
  }

  static async renderBlock(block: Block, blockKey: string, sectionKey: string): Promise<string> {
    const context = {
      block: {
        id: blockKey,
        type: block.type,
        settings: block.settings,
        section: sectionKey
      }
    };

    // Return a placeholder preview since actual rendering is handled by Shopify
    return `
      <div class="block" data-block-id="${blockKey}" data-block-type="${block.type}">
        <div class="block-content">
          <pre>${JSON.stringify(block.settings, null, 2)}</pre>
        </div>
      </div>
    `;
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
      <div class="page-content">
        ${renderedSections.join('\n')}
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