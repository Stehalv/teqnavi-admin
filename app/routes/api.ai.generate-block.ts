import { json } from "@remix-run/node";
import OpenAI from "openai";
import type { Block } from "~/features/pagebuilder/types.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt, sectionType, blockType } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional web content creator. Generate a block for a Shopify store page section based on the user's prompt. 
          The section type is "${sectionType}" and the block type is "${blockType}".
          The response should be a valid JSON object matching the Block type with appropriate settings.
          Include realistic content and settings that match the block type and user's requirements.`
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
    
    const generatedBlock = JSON.parse(content) as Block;
    return json(generatedBlock);
  } catch (error) {
    console.error('Error generating block:', error);
    return json({ error: "Failed to generate block" }, { status: 500 });
  }
} 