import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Liquid } from "liquidjs";

const liquid = new Liquid();

// Sample data to use for preview rendering
const SAMPLE_DATA = {
  section: {
    id: "shopify-section-1",
    settings: {
      // Text content
      heading: "Welcome to Our Store",
      subheading: "Discover our latest collection",
      title: "Featured Products",
      description: "Shop our carefully curated selection of premium products",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      
      // Buttons
      button_text: "Shop Now",
      button_url: "#",
      secondary_button_text: "Learn More",
      secondary_button_url: "#",
      
      // Images
      background_image: "https://placekitten.com/1200/600",
      image: "https://placekitten.com/800/600",
      logo: "https://placekitten.com/200/100",
      
      // Colors
      text_color: "#ffffff",
      background_color: "#000000",
      button_color: "#0044aa",
      accent_color: "#ff0000",
      
      // Layout
      layout: "left",  // left, right, center
      content_alignment: "center", // left, right, center
      content_width: "medium", // narrow, medium, wide
      padding_top: 40,
      padding_bottom: 40,
      
      // Effects
      overlay_opacity: 0.5,
      enable_parallax: true,
      animation: "fade",
      
      // Collection/Product specific
      collection: {
        title: "Featured Collection",
        products: [
          {
            title: "Sample Product 1",
            price: "$99.99",
            compare_at_price: "$129.99",
            image: "https://placekitten.com/300/300",
            url: "#"
          },
          {
            title: "Sample Product 2",
            price: "$79.99",
            compare_at_price: "$99.99",
            image: "https://placekitten.com/301/301",
            url: "#"
          }
        ]
      }
    },
    blocks: [
      {
        type: "feature",
        settings: {
          icon: "star",
          title: "Feature 1",
          text: "Feature description goes here"
        }
      },
      {
        type: "feature",
        settings: {
          icon: "heart",
          title: "Feature 2",
          text: "Another feature description"
        }
      }
    ]
  },
  // Global shop data
  shop: {
    name: "Sample Store",
    email: "info@example.com",
    description: "Your one-stop shop for everything",
    currency: "USD"
  },
  // Common Liquid globals
  template: "index",
  current_page: 1,
  request: {
    page_type: "index",
    host: "sample-store.myshopify.com"
  }
};

const SYSTEM_PROMPTS = {
  section: `You are a Shopify section generator. Generate valid Shopify section liquid code based on the user's requirements.
The code should include:
1. A schema block with appropriate settings
2. The HTML markup using Liquid variables
3. CSS styles in a stylesheet block

Available section variables for preview:
- section.settings: heading, subheading, title, description, content
- section.settings.button_text, button_url, secondary_button_text, secondary_button_url
- section.settings.background_image, image, logo
- section.settings.text_color, background_color, button_color, accent_color
- section.settings.layout (left/right/center)
- section.settings.content_alignment (left/right/center)
- section.settings.content_width (narrow/medium/wide)
- section.settings.padding_top, padding_bottom
- section.settings.overlay_opacity
- section.settings.enable_parallax
- section.settings.animation
- section.settings.collection (with products array)
- section.blocks (array of feature blocks)

Only respond with the code, no explanations.`,

  page: `You are a Shopify page template generator. Generate valid Shopify page liquid code based on the user's requirements.
The code should include:
1. The HTML markup using Liquid variables
2. CSS styles in a stylesheet block

Available variables for preview:
- page.title
- page.content
- page.handle
- page.template_suffix
- page.author
- page.published_at

Common global objects:
- shop.name
- shop.email
- shop.description
- shop.currency

Only respond with the code, no explanations.`,

  block: `You are a Shopify section block generator. Generate valid Shopify block liquid code based on the user's requirements.
The code should include:
1. A schema block with appropriate settings
2. The HTML markup using Liquid variables
3. CSS styles (if needed)

Available block variables for preview:
- block.settings: All settings defined in the schema
- block.type: The block type
- block.id: Unique identifier
- section: Parent section variables

Only respond with the code, no explanations.`
};

const REFINEMENT_PROMPTS = {
  section: `You are a Shopify section code refiner. Modify the existing section code based on the user's requirements.
Maintain the existing structure and only make the requested changes.
Return the complete modified code with all sections (schema, HTML, and CSS).

Available section variables for preview:
- section.settings: heading, subheading, title, description, content
- section.settings.button_text, button_url, secondary_button_text, secondary_button_url
- section.settings.background_image, image, logo
- section.settings.text_color, background_color, button_color, accent_color
- section.settings.layout (left/right/center)
- section.settings.content_alignment (left/right/center)
- section.settings.content_width (narrow/medium/wide)
- section.settings.padding_top, padding_bottom
- section.settings.overlay_opacity
- section.settings.enable_parallax
- section.settings.animation
- section.settings.collection (with products array)
- section.blocks (array of feature blocks)

Only respond with the code, no explanations.`,

  page: `You are a Shopify page template refiner. Modify the existing page code based on the user's requirements.
Maintain the existing structure and only make the requested changes.
Return the complete modified code.

Available variables for preview:
- page.title
- page.content
- page.handle
- page.template_suffix
- page.author
- page.published_at

Only respond with the code, no explanations.`,

  block: `You are a Shopify block code refiner. Modify the existing block code based on the user's requirements.
Maintain the existing structure and only make the requested changes.
Return the complete modified code.

Available block variables for preview:
- block.settings: All settings defined in the schema
- block.type: The block type
- block.id: Unique identifier
- section: Parent section variables

Only respond with the code, no explanations.`
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json({ error: "Missing OPENAI_API_KEY environment variable" }, { status: 500 });
    }

    const { prompt, type = 'section', previousCode } = await request.json();
    if (!prompt) {
      return json({ error: "Prompt is required" }, { status: 400 });
    }

    const messages = previousCode 
      ? [
          { role: "system", content: REFINEMENT_PROMPTS[type] },
          { role: "user", content: `Existing code:\n\n${previousCode}\n\nRequested changes:\n${prompt}` }
        ]
      : [
          { role: "system", content: SYSTEM_PROMPTS[type] },
          { role: "user", content: prompt }
        ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      return json({ 
        error: `OpenAI API error: ${responseData.error?.message || 'Unknown error'}` 
      }, { status: response.status });
    }

    const generatedCode = responseData.choices[0]?.message?.content;
    if (!generatedCode) {
      return json({ error: "No code was generated" }, { status: 500 });
    }

    try {
      // Extract the HTML part (between schema and stylesheet)
      const htmlMatch = generatedCode.match(/{% schema %}.*?{% endschema %}(.*?)(?:{% stylesheet %}|$)/s);
      const htmlContent = htmlMatch ? htmlMatch[1].trim() : generatedCode;
      
      // Render the Liquid template
      const renderedHtml = await liquid.parseAndRender(htmlContent, SAMPLE_DATA);
      
      // Extract and process CSS
      const cssMatch = generatedCode.match(/{% stylesheet %}(.*?)(?:{% endstylesheet %}|$)/s);
      let css = cssMatch ? cssMatch[1].trim() : '';
      
      // Process Liquid variables in CSS
      if (css) {
        css = await liquid.parseAndRender(css, SAMPLE_DATA);
      }

      return json({ 
        code: generatedCode,
        preview: {
          html: renderedHtml,
          css: css
        }
      });
    } catch (renderError) {
      console.error("Liquid rendering error:", renderError);
      return json({ 
        error: `Liquid rendering error: ${renderError.message}`,
        code: generatedCode,
        preview: {
          html: "Error rendering preview",
          css: ""
        }
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
} 