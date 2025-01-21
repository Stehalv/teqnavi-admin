import type { FS } from 'liquidjs';
import { SnippetService } from './snippet.server.js';
import path from 'path';

export class SnippetFileSystem implements FS {
  // Snippet keys should be kebab-case and contain only letters, numbers, and hyphens
  private static readonly KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  private static readonly MAX_KEY_LENGTH = 64;

  constructor(private shopId: string) {}

  async exists(filepath: string): Promise<boolean> {
    try {
      const key = this.getSnippetKey(filepath);
      this.validateKey(key);
      const snippet = await SnippetService.getSnippet(this.shopId, key);
      return !!snippet;
    } catch (error) {
      // If key is invalid, treat as non-existent
      return false;
    }
  }

  existsSync(filepath: string): boolean {
    // We can't do true sync with DB, but LiquidJS allows async
    throw new Error('Sync operations not supported');
  }

  async readFile(filepath: string): Promise<string> {
    const key = this.getSnippetKey(filepath);
    this.validateKey(key);
    const snippet = await SnippetService.getSnippet(this.shopId, key);
    if (!snippet) {
      throw new Error(`Snippet '${key}' not found`);
    }
    return snippet.liquid;
  }

  readFileSync(filepath: string): string {
    // We can't do true sync with DB, but LiquidJS allows async
    throw new Error('Sync operations not supported');
  }

  resolve(dir: string, file: string, ext: string): string {
    // Since we're using a database, we don't need complex path resolution
    // Just ensure the file has the correct extension
    return file.endsWith(ext) ? file : file + ext;
  }

  private getSnippetKey(filepath: string): string {
    // Strip any file extension and directory path
    return path.basename(filepath).replace(/\.[^/.]+$/, "");
  }

  private validateKey(key: string): void {
    if (!key) {
      throw new Error('Snippet key cannot be empty');
    }

    if (key.length > SnippetFileSystem.MAX_KEY_LENGTH) {
      throw new Error(`Snippet key cannot be longer than ${SnippetFileSystem.MAX_KEY_LENGTH} characters`);
    }

    if (!SnippetFileSystem.KEY_REGEX.test(key)) {
      throw new Error('Invalid snippet key. Use kebab-case with only letters, numbers, and hyphens (e.g. "my-snippet-1")');
    }
  }
} 