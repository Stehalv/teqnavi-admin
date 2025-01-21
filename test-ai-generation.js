import { PageBuilderAI } from './app/features/pagebuilder/services/pagebuilder-ai.server.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateSophisticatedFrontage() {
  try {
    const result = await PageBuilderAI.generatePage(`
      Create a sophisticated, modern storefront homepage with:
      - A striking hero section with dynamic imagery and compelling CTA
      - Featured collections showcase with modern grid layout
      - Product highlights with rich media and engaging descriptions
      - Brand story section that builds trust
      - Newsletter signup with elegant design
      Make it visually striking and optimized for conversions.
    `);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
    }
  }
}

generateSophisticatedFrontage(); 