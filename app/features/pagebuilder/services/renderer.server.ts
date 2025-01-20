import { Liquid } from 'liquidjs';
import type { Page, Section, Block } from '../types.js';
import { TemplateService } from './template.server.js';

export class RendererService {
  private static engine = new Liquid({
    cache: process.env.NODE_ENV === 'production'
  });

  static async renderSection(shopId: string, section: Section): Promise<string> {
    const template = await TemplateService.getSectionTemplate(shopId, section.type);
    if (!template) {
      throw new Error(`Template not found for section type: ${section.type}`);
    }

    const renderedBlocks = await Promise.all(
      section.blocks.map(async (block) => {
        const blockTemplate = template.blocks.find(t => t.type === block.type);
        if (!blockTemplate) {
          throw new Error(`Block template not found for type: ${block.type}`);
        }
        return this.renderBlock(blockTemplate.liquid, block);
      })
    );

    const context = {
      section: {
        id: section.id,
        settings: section.settings,
        blocks: renderedBlocks
      }
    };

    return this.engine.parseAndRender(template.liquid, context);
  }

  static async renderBlock(template: string, block: Block): Promise<string> {
    const context = {
      block: {
        id: block.id,
        type: block.type,
        settings: block.settings
      }
    };

    return this.engine.parseAndRender(template, context);
  }

  static async renderPage(shopId: string, page: Page): Promise<string> {
    const renderedSections = await Promise.all(
      page.sections.map(async (section) => {
        return this.renderSection(shopId, section);
      })
    );

    return renderedSections.join('\n');
  }

  static async previewSection(shopId: string, section: Section): Promise<string> {
    try {
      return await this.renderSection(shopId, section);
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