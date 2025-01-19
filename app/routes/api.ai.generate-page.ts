import { json } from "@remix-run/node";
import OpenAI from "openai";
import type { Page } from "~/features/pagebuilder/types.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    console.log('Received page generation request with prompt:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional web page designer. Generate a complete page structure for a Shopify store based on the user's prompt. 
          The response should be a valid JSON object matching the Page type with sections, blocks, and settings.
          Include appropriate sections like hero, featured collection, rich text, etc. with realistic content and settings.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log('OpenAI response:', completion.choices[0]);

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content generated');
    
    const generatedPage = JSON.parse(content) as Page;
    console.log('Successfully parsed generated page:', generatedPage);
    return json(generatedPage);
  } catch (error) {
    console.error('Error generating page:', {
      error,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return json({ 
      error: error instanceof Error ? error.message : "Failed to generate page",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 