import { prisma } from "~/db.server.js";
import type { Page, PageVersion, ShopifyPageJSON } from "../types/shopify.js";

export class PageService {
  private static convertDbPageToPage(dbPage: any): Page {
    return {
      id: dbPage.id,
      shopId: dbPage.shopId,
      title: dbPage.title,
      handle: dbPage.handle,
      isPublished: dbPage.isPublished,
      data: JSON.parse(dbPage.data),
      createdAt: dbPage.createdAt,
      updatedAt: dbPage.updatedAt,
      publishedAt: dbPage.publishedAt,
      deletedAt: dbPage.deletedAt
    };
  }

  private static convertDbVersionToPageVersion(dbVersion: any): PageVersion {
    return {
      id: dbVersion.id,
      pageId: dbVersion.pageId,
      version: dbVersion.version,
      data: JSON.parse(dbVersion.data),
      message: dbVersion.message,
      createdAt: dbVersion.createdAt,
      createdBy: dbVersion.createdBy,
      isLatest: dbVersion.isLatest
    };
  }

  private static generateHandle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  static async createPage(shopId: string, pageData: Partial<Page>): Promise<Page> {
    const defaultJson: ShopifyPageJSON = {
      sections: {},
      order: []
    };

    const dbPage = await prisma.page.create({
      data: {
        shopId,
        title: pageData.title || "Untitled Page",
        handle: pageData.handle || this.generateHandle(pageData.title || "Untitled Page"),
        data: JSON.stringify(pageData.data || defaultJson),
        isPublished: pageData.isPublished || false
      }
    });

    return this.convertDbPageToPage(dbPage);
  }

  static async getPage(shopId: string, id: string): Promise<Page | null> {
    const dbPage = await prisma.page.findFirst({
      where: {
        id,
        shopId,
        deletedAt: null
      }
    });

    if (!dbPage) return null;

    return this.convertDbPageToPage(dbPage);
  }

  static async updatePage(shopId: string, id: string, pageData: Partial<Page>): Promise<Page | null> {
    const dbPage = await prisma.page.update({
      where: {
        id,
        shopId
      },
      data: {
        ...(pageData.title && { title: pageData.title }),
        ...(pageData.handle && { handle: pageData.handle }),
        ...(pageData.data && { data: JSON.stringify(pageData.data) }),
        ...(typeof pageData.isPublished === 'boolean' && { 
          isPublished: pageData.isPublished,
          publishedAt: pageData.isPublished ? new Date() : null
        })
      }
    });

    return this.convertDbPageToPage(dbPage);
  }

  static async deletePage(shopId: string, id: string): Promise<void> {
    await prisma.page.update({
      where: {
        id,
        shopId
      },
      data: {
        deletedAt: new Date()
      }
    });
  }

  static async createVersion(shopId: string, pageId: string, message: string, createdBy: string): Promise<PageVersion> {
    const page = await this.getPage(shopId, pageId);
    if (!page) {
      throw new Error('Page not found');
    }

    // Reset isLatest flag on all versions
    await prisma.pageVersion.updateMany({
      where: { pageId },
      data: { isLatest: false }
    });

    // Get latest version number
    const latestVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' }
    });

    const version = latestVersion ? latestVersion.version + 1 : 1;

    const dbVersion = await prisma.pageVersion.create({
      data: {
        pageId,
        version,
        data: JSON.stringify(page.data),
        message,
        createdBy,
        isLatest: true
      }
    });

    return this.convertDbVersionToPageVersion(dbVersion);
  }

  static async getVersion(shopId: string, pageId: string, version: number): Promise<PageVersion | null> {
    const page = await this.getPage(shopId, pageId);
    if (!page) return null;

    const dbVersion = await prisma.pageVersion.findFirst({
      where: {
        pageId,
        version
      }
    });

    if (!dbVersion) return null;

    return this.convertDbVersionToPageVersion(dbVersion);
  }

  static async listVersions(shopId: string, pageId: string): Promise<PageVersion[]> {
    const page = await this.getPage(shopId, pageId);
    if (!page) return [];

    const dbVersions = await prisma.pageVersion.findMany({
      where: { pageId },
      orderBy: { version: 'desc' }
    });

    return dbVersions.map(this.convertDbVersionToPageVersion);
  }

  static async restoreVersion(shopId: string, pageId: string, version: number): Promise<Page | null> {
    const pageVersion = await this.getVersion(shopId, pageId, version);
    if (!pageVersion) return null;

    return this.updatePage(shopId, pageId, {
      data: pageVersion.data
    });
  }
} 