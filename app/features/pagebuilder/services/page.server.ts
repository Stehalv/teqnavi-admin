import { prisma } from "~/db.server.js";
import type { Page, PageVersion, PageSettings, Section } from "../types.js";

// Database types from Prisma
type DbPage = {
  id: string;
  shopId: string;
  title: string;
  handle: string;
  template: string;
  sections: string;
  section_order: string;
  settings: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type DbPageVersion = {
  id: string;
  pageId: string;
  version: number;
  sections: string;
  section_order: string;
  settings: string;
  message: string | null;
  createdAt: Date;
  createdBy: string | null;
  isLatest: boolean;
};

export class PageService {
  private static convertDbPageToPage(dbPage: DbPage): Page {
    return {
      ...dbPage,
      sections: JSON.parse(dbPage.sections),
      section_order: JSON.parse(dbPage.section_order),
      settings: JSON.parse(dbPage.settings)
    };
  }

  private static convertDbVersionToPageVersion(dbVersion: DbPageVersion): PageVersion {
    return {
      ...dbVersion,
      sections: JSON.parse(dbVersion.sections),
      section_order: JSON.parse(dbVersion.section_order),
      settings: JSON.parse(dbVersion.settings)
    };
  }

  static async createPage(shopId: string, data: Partial<Page>): Promise<Page> {
    const defaultSettings: PageSettings = {
      layout: "contained",
      spacing: 0,
      background: {
        type: "color",
        value: "#ffffff"
      },
      seo: {
        title: data.title || "Untitled Page",
        description: "",
        url_handle: data.handle || ""
      }
    };

    const emptySections: Record<string, Section> = {};
    const emptySectionOrder: string[] = [];

    const dbPage = await prisma.page.create({
      data: {
        shopId,
        title: data.title || "Untitled Page",
        handle: data.handle || this.generateHandle(data.title || "Untitled Page"),
        template: data.template || "page",
        sections: JSON.stringify(emptySections),
        section_order: JSON.stringify(emptySectionOrder),
        settings: JSON.stringify(defaultSettings)
      }
    });

    // Create initial version
    await prisma.pageVersion.create({
      data: {
        pageId: dbPage.id,
        version: 1,
        sections: JSON.stringify(emptySections),
        section_order: JSON.stringify(emptySectionOrder),
        settings: dbPage.settings,
        message: "Initial version",
        isLatest: true
      }
    });

    return this.convertDbPageToPage(dbPage);
  }

  static async getPage(shopId: string, id: string): Promise<Page | null> {
    const dbPage = await prisma.page.findFirst({
      where: {
        id,
        shopId
      }
    });

    if (!dbPage) return null;

    return this.convertDbPageToPage(dbPage);
  }

  static async updatePage(shopId: string, id: string, data: Partial<Page>): Promise<Page | null> {
    const dbPage = await prisma.page.update({
      where: {
        id,
        shopId
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.handle && { handle: data.handle }),
        ...(data.template && { template: data.template }),
        ...(data.sections && { sections: JSON.stringify(data.sections) }),
        ...(data.section_order && { section_order: JSON.stringify(data.section_order) }),
        ...(data.settings && { settings: JSON.stringify(data.settings) }),
        ...(typeof data.isPublished === 'boolean' && { isPublished: data.isPublished })
      }
    });

    return this.convertDbPageToPage(dbPage);
  }

  static async deletePage(shopId: string, id: string): Promise<void> {
    await prisma.page.delete({
      where: {
        id,
        shopId
      }
    });
  }

  static async listPages(shopId: string): Promise<Page[]> {
    const dbPages = await prisma.page.findMany({
      where: {
        shopId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return dbPages.map(this.convertDbPageToPage);
  }

  static async createVersion(pageId: string, data: Partial<PageVersion>): Promise<PageVersion> {
    // Get latest version number
    const latestVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' }
    });

    const dbVersion = await prisma.pageVersion.create({
      data: {
        pageId,
        version: (latestVersion?.version || 0) + 1,
        sections: data.sections || JSON.stringify({}),
        section_order: data.section_order || JSON.stringify([]),
        settings: data.settings || JSON.stringify({}),
        message: data.message,
        isLatest: data.isLatest || false
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