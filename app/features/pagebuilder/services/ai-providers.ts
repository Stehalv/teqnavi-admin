import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AICompletionOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  format?: 'json' | 'text';
}

export interface AIProvider {
  generateCompletion(prompt: string, options: AICompletionOptions): Promise<string>;
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCompletion(prompt: string, options: AICompletionOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        ...(options.systemPrompt ? [{ role: "system" as const, content: options.systemPrompt }] : []),
        { role: "user" as const, content: prompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
      response_format: options.format === 'json' ? { type: "json_object" } : undefined
    });
    
    return response.choices[0]?.message?.content ?? '';
  }
}

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateCompletion(prompt: string, options: AICompletionOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-3-opus-20240229",
      messages: [{ role: "user", content: prompt }],
      system: options.systemPrompt,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000
    });
    
    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    throw new Error('Unexpected response type from Claude');
  }
} 