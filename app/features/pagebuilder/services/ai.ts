import type { Page, Section, Block } from '../types.js';

interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function generatePage(prompt: string): Promise<AIResponse<Page>> {
  try {
    console.log('Generating page with prompt:', prompt);
    const response = await fetch('/api/ai/generate-page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      console.error('Failed to generate page:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(responseData.error || 'Failed to generate page');
    }

    console.log('Successfully generated page:', responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error in generatePage:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate page'
    };
  }
}

export async function generateSection(prompt: string, type: string): Promise<AIResponse<Section>> {
  try {
    const response = await fetch('/api/ai/generate-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate section');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate section'
    };
  }
}

export async function generateBlock(prompt: string, sectionType: string, blockType: string): Promise<AIResponse<Block>> {
  try {
    const response = await fetch('/api/ai/generate-block', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, sectionType, blockType }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate block');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate block'
    };
  }
} 