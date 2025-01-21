import type { PageUI } from '../types/shopify.js';

export class PageClient {
  static async updatePage(shopId: string, pageId: string, page: Partial<PageUI>) {
    const response = await fetch(`/api/pagebuilder/page/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page)
    });

    if (!response.ok) {
      throw new Error('Failed to update page');
    }

    return response.json();
  }
} 