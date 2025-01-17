import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server.js";
import type { SettingValue } from "~/features/theme/types.js";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const settings = JSON.parse(url.searchParams.get('settings') || '[]') as SettingValue[];
  
  const asset = await prisma.themeAsset.findUnique({
    where: { id: params.id }
  });

  if (!asset) {
    throw new Response("Not Found", { status: 404 });
  }

  let renderedContent = asset.content;

  // Extract and remove schema if it's a section
  if (asset.type === 'section') {
    renderedContent = renderedContent.replace(/{% schema %}[\s\S]*?{% endschema %}/, '');
  }

  // Replace setting placeholders
  settings.forEach(setting => {
    const placeholder = `{{ settings.${setting.id} }}`;
    renderedContent = renderedContent.replace(
      new RegExp(placeholder, 'g'), 
      String(setting.value)
    );
  });

  // Add wrapper for sections
  if (asset.type === 'section') {
    renderedContent = `
      <style>
        .section-preview { padding: 20px; border: 1px dashed #ccc; }
      </style>
      <div class="section-preview">
        ${renderedContent}
      </div>
    `;
  }

  return json({ content: renderedContent });
};

export default function PreviewPage() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
} 