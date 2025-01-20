import { OpenAI } from 'openai';

interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AIService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private static readonly MODEL = "gpt-3.5-turbo";
  private static readonly MAX_TOKENS = 4000;
  private static readonly TEMPERATURE = 0.7;

  static async generate<T>(
    prompt: string,
    systemPrompt: string,
  ): Promise<AIResponse<T>> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: this.TEMPERATURE,
        max_tokens: this.MAX_TOKENS,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return {
        success: true,
        data: JSON.parse(content) as T
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 