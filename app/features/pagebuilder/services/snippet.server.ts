import { prisma } from "~/db.server.js";

interface CreateSnippetData {
  key: string;
  name: string;
  description?: string;
  liquid: string;
  isGlobal?: boolean;
}

interface UpdateSnippetData extends Partial<CreateSnippetData> {}

export class SnippetService {
  static async createSnippet(shopId: string, data: CreateSnippetData) {
    // Validate key format
    this.validateKey(data.key);
    
    // Check for existing snippet
    const existing = await prisma.snippet.findFirst({
      where: { shopId, key: data.key }
    });
    
    if (existing) {
      throw new Error(`Snippet with key '${data.key}' already exists`);
    }

    return prisma.snippet.create({
      data: {
        shopId,
        ...data,
        isGlobal: data.isGlobal ?? false
      }
    });
  }

  static async updateSnippet(shopId: string, key: string, data: UpdateSnippetData) {
    if (data.key) {
      this.validateKey(data.key);
    }

    const snippet = await prisma.snippet.findFirst({
      where: { shopId, key }
    });

    if (!snippet) {
      throw new Error(`Snippet '${key}' not found`);
    }

    return prisma.snippet.update({
      where: { id: snippet.id },
      data
    });
  }

  static async deleteSnippet(shopId: string, key: string) {
    const snippet = await prisma.snippet.findFirst({
      where: { shopId, key }
    });

    if (!snippet) {
      throw new Error(`Snippet '${key}' not found`);
    }

    return prisma.snippet.delete({
      where: { id: snippet.id }
    });
  }

  static async getSnippet(shopId: string, key: string) {
    return prisma.snippet.findFirst({
      where: { 
        OR: [
          { shopId, key },
          { isGlobal: true, key }
        ]
      }
    });
  }

  static async listSnippets(shopId: string) {
    return prisma.snippet.findMany({
      where: {
        OR: [
          { shopId },
          { isGlobal: true }
        ]
      },
      orderBy: { key: 'asc' }
    });
  }

  static async searchSnippets(shopId: string, query: string) {
    return prisma.snippet.findMany({
      where: {
        OR: [
          { shopId },
          { isGlobal: true }
        ],
        AND: {
          OR: [
            { key: { contains: query } },
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        }
      }
    });
  }

  private static validateKey(key: string) {
    // Snippet keys should be kebab-case and contain only letters, numbers, and hyphens
    const keyRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!keyRegex.test(key)) {
      throw new Error('Invalid snippet key. Use kebab-case with only letters, numbers, and hyphens.');
    }
  }
} 