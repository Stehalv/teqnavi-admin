import { json } from "@remix-run/node";
import { validateShopAccess } from "~/middleware/auth.server.js";
import { JobQueue } from "~/services/JobQueue.server.js";

export async function loader({ request }: { request: Request }) {
  await validateShopAccess(request);

  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return json({ success: false, error: "Job ID is required" }, { status: 400 });
  }

  try {
    const job = JobQueue.getJob(jobId);
    
    if (!job) {
      return json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        data: job.data,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to get job status"
    }, { status: 500 });
  }
} 