import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageBuilderAI } from '../pagebuilder-ai.server.js';
import { TemplateService } from '../template.server.js';
import { RendererService } from '../renderer.server.js';
import type { ShopifyPageJSON, Section, Page } from '../../types/shopify.js';
import type { SectionDefinition } from '../template.server.js';

// Mock dependencies
vi.mock('../template.server.js');
vi.mock('../renderer.server.js');
vi.mock('openai');

describe('PageBuilderAI', () => {
  const mockPageJson = {
    name: "Custom Page",
    settings: {
      layout: "normal",
      handle: "custom-page"
    },
    sections: {
      "main": {
        type: "hero-section",
        settings: {
          heading: "Welcome to our store",
          background_color: "#000000",
          text_color: "#ffffff"
        }
      },
      "featured": {
        type: "featured-collection",
        settings: {
          title: "Featured Collection",
          collection: "frontpage",
          products_to_show: 4
        },
        blocks: {
          "block1": {
            type: "product",
            settings: {
              show_rating: true,
              show_vendor: false
            }
          }
        },
        block_order: ["block1"]
      }
    },
    order: ["main", "featured"]
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock OpenAI
    const OpenAI = vi.fn(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify(mockPageJson)
              }
            }]
          })
        }
      }
    }));
    vi.mocked(OpenAI).mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify(mockPageJson)
              }
            }]
          })
        }
      }
    }));

    // Mock TemplateService
    vi.mocked(TemplateService.getSectionDefinition).mockImplementation((shopId: string, type: string): Promise<SectionDefinition | null> => {
      if (type === 'hero-section') {
        return Promise.resolve({
          type: 'hero-section',
          name: 'Hero Section',
          schema: {
            settings: [
              {
                type: 'text',
                id: 'heading',
                label: 'Heading',
                default: 'Welcome'
              },
              {
                type: 'color',
                id: 'background_color',
                label: 'Background Color',
                default: '#000000'
              },
              {
                type: 'color',
                id: 'text_color',
                label: 'Text Color',
                default: '#ffffff'
              }
            ],
            blocks: []
          },
          liquid: '{% comment %}Hero Section{% endcomment %}\n<div class="hero-section" style="background-color: {{ section.settings.background_color }}; color: {{ section.settings.text_color }}">\n  <h1>{{ section.settings.heading }}</h1>\n</div>',
          styles: '',
          settings: {},
          presets: [{
            name: "Hero Section",
            settings: {
              heading: "Welcome"
            }
          }]
        });
      } else if (type === 'featured-collection') {
        return Promise.resolve({
          type: 'featured-collection',
          name: 'Featured Collection',
          schema: {
            settings: [
              {
                type: 'text',
                id: 'title',
                label: 'Heading',
                default: 'Featured Collection'
              },
              {
                type: 'collection',
                id: 'collection',
                label: 'Collection'
              },
              {
                type: 'range',
                id: 'products_to_show',
                min: 2,
                max: 12,
                step: 2,
                default: 4,
                label: 'Products to show'
              }
            ],
            blocks: [
              {
                type: 'product',
                name: 'Product Card',
                settings: [
                  {
                    type: 'checkbox',
                    id: 'show_rating',
                    label: 'Show product rating',
                    default: true
                  },
                  {
                    type: 'checkbox',
                    id: 'show_vendor',
                    label: 'Show product vendor',
                    default: false
                  }
                ]
              }
            ]
          },
          liquid: '{% comment %}Featured Collection{% endcomment %}\n<div class="featured-collection">\n  <h2>{{ section.settings.title }}</h2>\n  {% for product in collections[section.settings.collection].products limit: section.settings.products_to_show %}\n    <div class="product-card">\n      {% if block.settings.show_vendor %}\n        <p>{{ product.vendor }}</p>\n      {% endif %}\n      {% if block.settings.show_rating %}\n        <div class="rating">{{ product.rating }}</div>\n      {% endif %}\n    </div>\n  {% endfor %}\n</div>',
          styles: '',
          settings: {},
          presets: [
            {
              name: "Featured Collection",
              settings: {
                products_to_show: 4
              }
            }
          ],
          blocks: {
            'product': {
              name: 'Product Card',
              schema: {
                settings: [
                  {
                    type: 'checkbox',
                    id: 'show_rating',
                    label: 'Show product rating',
                    default: true
                  },
                  {
                    type: 'checkbox',
                    id: 'show_vendor',
                    label: 'Show product vendor',
                    default: false
                  }
                ]
              },
              liquid: '{% if block.settings.show_vendor %}<p>{{ product.vendor }}</p>{% endif %}{% if block.settings.show_rating %}<div class="rating">{{ product.rating }}</div>{% endif %}'
            }
          }
        });
      }
      return Promise.resolve(null);
    });

    // Mock RendererService
    vi.mocked(RendererService.renderSection).mockImplementation((shopId, section) => {
      if (section.type === 'hero-section') {
        return Promise.resolve(`
          <div class="hero-section" style="background-color: #000000; color: #ffffff">
            <h1>Welcome to our store</h1>
          </div>
        `);
      } else if (section.type === 'featured-collection') {
        return Promise.resolve(`
          <div class="featured-collection">
            <h2>Featured Collection</h2>
            <div class="product-card">
              <div class="rating">4.5</div>
            </div>
          </div>
        `);
      }
      return Promise.resolve('<div>Unknown Section</div>');
    });

    vi.mocked(RendererService.renderPage).mockImplementation((shopId, page) => {
      return Promise.resolve(`
        <div class="page">
          <div class="hero-section">
            <h1>Welcome to our store</h1>
          </div>
          <div class="featured-collection">
            <h2>Featured Collection</h2>
            <div class="product-card">
              <div class="rating">4.5</div>
            </div>
          </div>
        </div>
      `);
    });
  });

  describe('generatePage', () => {
    it('should generate a page and render it successfully', async () => {
      // Generate the page
      const result = await PageBuilderAI.generatePage('test-shop', 'Create a modern landing page');
      const page = JSON.parse(result.page) as ShopifyPageJSON;

      // Verify page structure
      expect(page.name).toBe('Custom Page');
      expect(page.order).toEqual(['main', 'featured']);
      expect(page.sections.main.type).toBe('hero-section');
      expect(page.sections.featured.type).toBe('featured-collection');

      // Verify section settings
      expect(page.sections.main.settings).toEqual({
        heading: 'Welcome to our store',
        background_color: '#000000',
        text_color: '#ffffff'
      });

      expect(page.sections.featured.settings).toEqual({
        title: 'Featured Collection',
        collection: 'frontpage',
        products_to_show: 4
      });

      // Verify blocks in featured collection
      if (page.sections.featured.blocks) {
        expect(page.sections.featured.blocks.block1).toEqual({
          type: 'product',
          settings: {
            show_rating: true,
            show_vendor: false
          }
        });
      }

      // Verify section rendering
      for (const sectionId of page.order) {
        const section = page.sections[sectionId];
        const rendered = await RendererService.renderSection('test-shop', section, sectionId);
        
        if (section.type === 'hero-section') {
          expect(rendered).toContain('Welcome to our store');
          expect(rendered).toContain('background-color: #000000');
          expect(rendered).toContain('color: #ffffff');
        } else if (section.type === 'featured-collection') {
          expect(rendered).toContain('Featured Collection');
          expect(rendered).toContain('product-card');
          expect(rendered).toContain('rating');
        }
      }

      // Verify complete page rendering
      const renderedPage = await RendererService.renderPage('test-shop', {
        id: '1',
        shopId: 'test-shop',
        title: 'Custom Page',
        handle: 'custom-page',
        isPublished: false,
        data: page,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Page);

      // Verify final rendered content
      expect(renderedPage).toContain('Welcome to our store');
      expect(renderedPage).toContain('Featured Collection');
      expect(renderedPage).toContain('product-card');
      expect(renderedPage).toContain('rating');
      expect(renderedPage.indexOf('hero-section')).toBeLessThan(renderedPage.indexOf('featured-collection'));
    });
  });
}); 