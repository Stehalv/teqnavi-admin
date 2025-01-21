import { json } from "@remix-run/node";
import { validateShopAccess } from "~/middleware/auth.server.js";
import { JobQueue } from "~/services/JobQueue.server.js";

export async function action({ request }: { request: Request }) {
  const { shopId } = await validateShopAccess(request);

  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Create a new job
    const jobId = JobQueue.createJob();
    
    // Start the generation process in the background
    JobQueue.startPageGeneration(jobId, shopId, prompt).catch(error => {
      console.error('Background job failed:', error);
    });
    
    return json({ 
      success: true, 
      jobId 
    });
  } catch (error) {
    console.error('Error initializing page generation:', error);
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize page generation"
    }, { status: 500 });
  }
} 