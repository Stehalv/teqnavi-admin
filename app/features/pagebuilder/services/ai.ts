import { OpenAI } from 'openai';
import type { SettingField } from '../types.js';

interface AIGeneratedBlock {
  type: string;
  name: string;
  settings: Record<string, any>;
  schema: {
    settings: SettingField[];
  };
  liquid: string;
}

interface AIGeneratedSection {
  type: string;
  name: string;
  settings: Record<string, any>;
  schema: {
    settings: SettingField[];
  };
  liquid: string;
  blocks: AIGeneratedBlock[];
}

interface AIGeneratedPage {
  title: string;
  sections: AIGeneratedSection[];
  settings: {
    seo: {
      title: string;
      description: string;
      url_handle: string;
    };
  };
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePage(prompt: string): Promise<AIResponse<AIGeneratedPage>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Shopify theme expert that generates complete section templates with liquid code and settings. 
          Generate sections that follow Shopify's best practices for theme development.
          Each section should include:
          - A descriptive name and type
          - Complete liquid template code
          - Settings schema with appropriate fields
          - Initial settings values
          - Block templates if needed
          
          The response should be valid JSON matching this structure:
          {
            "title": "Page Title",
            "sections": [{
              "type": "section-type",
              "name": "Section Name",
              "settings": { setting values },
              "schema": {
                "settings": [{ setting field definitions }]
              },
              "liquid": "{% liquid template code %}",
              "blocks": [{
                "type": "block-type",
                "name": "Block Name",
                "settings": { setting values },
                "schema": {
                  "settings": [{ setting field definitions }]
                },
                "liquid": "{% liquid block template %}"
              }]
            }],
            "settings": {
              "seo": {
                "title": "SEO Title",
                "description": "SEO Description",
                "url_handle": "page-url"
              }
            }
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const generatedPage = JSON.parse(response) as AIGeneratedPage;

    return {
      success: true,
      data: generatedPage
    };

  } catch (error) {
    console.error('Error generating page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function generateSection(prompt: string, type: string): Promise<AIResponse<AIGeneratedSection>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Shopify theme expert that generates complete section templates with liquid code and settings. 
          Generate sections that follow Shopify's best practices for theme development.
          Each section should include:
          - A descriptive name and type
          - Complete liquid template code
          - Settings schema with appropriate fields
          - Initial settings values
          - Block templates if needed
          
          The response should be valid JSON matching this structure:
          {
            "type": "section-type",
            "name": "Section Name",
            "settings": { setting values },
            "schema": {
              "settings": [{ setting field definitions }]
            },
            "liquid": "{% liquid template code %}",
            "blocks": [{
              "type": "block-type",
              "name": "Block Name",
              "settings": { setting values },
              "schema": {
                "settings": [{ setting field definitions }]
              },
              "liquid": "{% liquid block template %}"
            }]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const generatedSection = JSON.parse(response) as AIGeneratedSection;

    return {
      success: true,
      data: generatedSection
    };

  } catch (error) {
    console.error('Error generating section:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function generateBlock(prompt: string, sectionType: string, blockType: string): Promise<AIResponse<AIGeneratedBlock>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Shopify theme expert that generates complete block templates with liquid code and settings. 
          Generate blocks that follow Shopify's best practices for theme development.
          Each block should include:
          - A descriptive name and type
          - Complete liquid template code
          - Settings schema with appropriate fields
          - Initial settings values
          
          The response should be valid JSON matching this structure:
          {
            "type": "block-type",
            "name": "Block Name",
            "settings": { setting values },
            "schema": {
              "settings": [{ setting field definitions }]
            },
            "liquid": "{% liquid block template %}"
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const generatedBlock = JSON.parse(response) as AIGeneratedBlock;

    return {
      success: true,
      data: generatedBlock
    };

  } catch (error) {
    console.error('Error generating block:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 