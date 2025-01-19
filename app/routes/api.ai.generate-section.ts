import { json } from "@remix-run/node";
import OpenAI from "openai";
import type { Section } from "~/features/pagebuilder/types.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt, type } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional web page designer. Generate a section for a Shopify store page based on the user's prompt. 
          The section type is "${type}". The response should be a valid JSON object matching the Section type with appropriate settings and blocks.
          Include realistic content and settings that match the section type and user's requirements.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content generated');
    
    const generatedSection = JSON.parse(content) as Section;
    return json(generatedSection);
  } catch (error) {
    console.error('Error generating section:', error);
    return json({ error: "Failed to generate section" }, { status: 500 });
  }
} 