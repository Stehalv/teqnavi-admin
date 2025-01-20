import { OpenAI } from 'openai';

export class AIService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async generateFromPrompt<T>(
    prompt: string,
    systemPrompt: string,
    responseExample: string,
    temperature: number = 0.7,
    maxTokens: number = 4000
  ): Promise<T> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nThe response should be valid JSON matching this structure:\n${responseExample}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return JSON.parse(response) as T;
  }
} 