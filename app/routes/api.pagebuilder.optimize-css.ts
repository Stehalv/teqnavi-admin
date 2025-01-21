import { json } from '@remix-run/node';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { OpenAI } from 'openai';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanCSSResponse(css: string): string {
  // Remove markdown code block markers and any extra whitespace
  return css.replace(/```css\n?|\n?```/g, '').trim();
}

export async function action({ request }: { request: Request }) {
  try {
    const { shopId } = await validateShopAccess(request);
    
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { css, sectionKey, sectionType, settings, prompt } = await request.json();
    
    // Always get the template for context
    const template = await TemplateService.getSectionDefinition(shopId, sectionType);
    if (!template) {
      throw new Error('Section template not found');
    }

    // Extract just the HTML structure without Liquid logic for smaller context
    const htmlStructure = template.liquid
      .replace(/{%[^%}]*%}/g, '') // Remove Liquid logic
      .replace(/{{[^}}]*}}/g, '') // Remove Liquid variables
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();

    // If no CSS exists, generate from template
    if (!css) {
      console.log('Generating new CSS from template');
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use 3.5 for initial generation to save costs
        messages: [
          {
            role: "system",
            content: `You are a CSS expert. Return ONLY CSS code, no explanations.
Generate CSS for this HTML structure:
${htmlStructure}

Use these guidelines:
1. Use BEM naming
2. Group variables in :root
3. Use mobile-first design
4. Include hover states
5. Add responsive breakpoints
${prompt ? `\nAdditional requirements: ${prompt}` : ''}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500, // Limit response size
        response_format: { type: "text" }
      });

      const generatedCSS = response.choices[0]?.message?.content;
      if (!generatedCSS) {
        throw new Error('Failed to generate CSS');
      }

      return json({ optimizedCSS: cleanCSSResponse(generatedCSS) });
    }

    // For optimization, use GPT-4 to ensure high-quality results
    console.log('Optimizing existing CSS');

    // Parse specific style requirements from the prompt
    const heightMatch = prompt?.match(/(\d+)px\s+(in\s+)?height/i);
    const heightValue = heightMatch ? heightMatch[1] : null;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a CSS optimization expert. You will be given an HTML structure and CSS to optimize.
First, analyze the HTML structure to understand the elements that need styling.
Then, modify the CSS according to the requirements while ensuring it properly targets the HTML elements.

HTML structure to style:
${htmlStructure}

Current CSS to optimize:
${css}

Requirements:
1. ONLY modify styles that target elements present in the HTML structure above
2. Preserve existing styles unless they conflict with the prompt
3. Keep all variables in :root
4. Use BEM naming that matches the HTML structure
5. Maintain responsive design${heightValue ? `
6. Set the main section element to exactly ${heightValue}px using both height and min-height properties` : ''}

${prompt ? `Specific changes requested (apply these changes to the elements in the HTML structure above): ${prompt}` : ''}`
        }
      ],
      temperature: 0.1, // Lower temperature for more precise output
      max_tokens: 500,
      response_format: { type: "text" }
    });

    const optimizedCSS = response.choices[0]?.message?.content;
    if (!optimizedCSS) {
      throw new Error('Failed to optimize CSS');
    }

    // Verify height is included if requested
    if (heightValue && !optimizedCSS.includes(`height: ${heightValue}px`)) {
      // Find the main section selector from the HTML structure
      const sectionMatch = htmlStructure.match(/<(section|div)[^>]*class="([^"]*)"[^>]*>/);
      const mainClass = sectionMatch ? sectionMatch[2] : 'section';
      
      const fixedCSS = optimizedCSS.replace(
        new RegExp(`\\.${mainClass}\\s*{([^}]*)}`, 'g'),
        `\\.${mainClass} {$1\n  height: ${heightValue}px;\n  min-height: ${heightValue}px;\n}`
      );
      return json({ optimizedCSS: cleanCSSResponse(fixedCSS) });
    }

    return json({ optimizedCSS: cleanCSSResponse(optimizedCSS) });
  } catch (error) {
    console.error('Error in optimize-css endpoint:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to optimize CSS' },
      { status: 500 }
    );
  }
} 