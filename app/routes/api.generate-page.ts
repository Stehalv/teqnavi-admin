import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Liquid } from "liquidjs";

const liquid = new Liquid();

// Sample data for page preview
const SAMPLE_DATA = {
  page: {
    title: "Sample Page",
    content: "This is sample content",
    handle: "sample-page",
    template_suffix: "",
    author: "Store Admin",
    published_at: new Date().toISOString()
  },
  shop: {
    name: "Sample Store",
    email: "info@example.com",
    description: "Your one-stop shop for everything",
    currency: "USD"
  }
};

const SYSTEM_PROMPT = `You are a Shopify page template generator. Create a Shopify liquid page template based on the user's requirements.
The response should include:
1. A JSON schema defining the page structure and settings
2. The liquid template code with HTML markup
3. CSS styles for the page

Use Shopify's liquid syntax and best practices. Include responsive design and modern CSS.
Available variables:
- page.title, page.content, page.handle
- shop.name, shop.email, shop.description
- All standard Shopify liquid objects and filters

Return the response in the following format:
{
  "schema": {
    // JSON schema for page settings
  },
  "template": "// Liquid template code",
  "styles": "// CSS code"
}

Only respond with valid JSON, no additional text.`;

export type ActionData = {
  schema?: Record<string, any>;
  template?: string;
  styles?: string;
  preview?: {
    html: string;
    css: string;
  };
  error?: string;
  raw?: string;
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json({ error: "Missing OPENAI_API_KEY environment variable" }, { status: 500 });
    }

    const { prompt } = await request.json();
    if (!prompt) {
      return json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      return json({ 
        error: `OpenAI API error: ${responseData.error?.message || 'Unknown error'}` 
      }, { status: response.status });
    }

    try {
      const generatedContent = JSON.parse(responseData.choices[0]?.message?.content);
      
      // Render preview using the liquid template
      const renderedHtml = await liquid.parseAndRender(generatedContent.template, SAMPLE_DATA);

      return json({
        ...generatedContent,
        preview: {
          html: renderedHtml,
          css: generatedContent.styles
        }
      });
    } catch (parseError) {
      return json({ 
        error: `Failed to parse generated content: ${parseError.message}`,
        raw: responseData.choices[0]?.message?.content
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
} 