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
      templates: JSON.parse(dbPage.templates),
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
      templates: JSON.parse(dbVersion.templates),
      message: dbVersion.message,
      createdAt: dbVersion.createdAt,
      createdBy: dbVersion.createdBy,
      isLatest: dbVersion.isLatest
    };
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
        templates: JSON.stringify(pageData.templates || {}),
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
        ...(pageData.templates && { templates: JSON.stringify(pageData.templates) }),
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

  static async listPages(shopId: string): Promise<Page[]> {
    const dbPages = await prisma.page.findMany({
      where: {
        shopId,
        deletedAt: null
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return dbPages.map(this.convertDbPageToPage);
  }

  static async createVersion(pageId: string, versionData: Partial<PageVersion>): Promise<PageVersion> {
    // Get latest version number
    const latestVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' }
    });

    const newVersion = latestVersion ? latestVersion.version + 1 : 1;

    const dbVersion = await prisma.pageVersion.create({
      data: {
        pageId,
        version: newVersion,
        data: versionData.data ? JSON.stringify(versionData.data) : JSON.stringify({}),
        templates: versionData.templates ? JSON.stringify(versionData.templates) : JSON.stringify({}),
        message: versionData.message,
        createdBy: versionData.createdBy,
        isLatest: versionData.isLatest || false
      }
    });

    if (dbVersion.isLatest) {
      // Update other versions to not be latest
      await prisma.pageVersion.updateMany({
        where: {
          pageId,
          id: { not: dbVersion.id }
        },
        data: {
          isLatest: false
        }
      });
    }

    return this.convertDbVersionToPageVersion(dbVersion);
  }

  static async getVersion(pageId: string, version: number): Promise<PageVersion | null> {
    const dbVersion = await prisma.pageVersion.findUnique({
      where: {
        pageId_version: {
          pageId,
          version
        }
      }
    });

    if (!dbVersion) return null;

    return this.convertDbVersionToPageVersion(dbVersion);
  }

  private static generateHandle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
} 