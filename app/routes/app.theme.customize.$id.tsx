import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { Page, Layout, Select, BlockStack, Box } from "@shopify/polaris";
import { prisma } from "~/db.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";
import { useState, useCallback } from "react";
import { PublishingBar } from "../features/theme/components/PublishingBar.js";
import { PagePreview } from "../features/theme/components/PagePreview.js";
import { SectionList } from "../features/theme/components/SectionList.js";

interface LoaderData {
  currentPage: {
    id: string;
    name: string;
    content: string;
    isActive: boolean;
  };
  pages: {
    id: string;
    name: string;
  }[];
  host: string;
  shop: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { shopId } = await validateShopAccess(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  // Get all pages for the selector
  const pages = await prisma.themeAsset.findMany({
    where: {
      shopId,
      type: 'page'
    },
    select: {
      id: true,
      name: true
    }
  });

  // Get the current page
  const currentPage = await prisma.themeAsset.findFirst({
    where: {
      id: params.id,
      shopId
    }
  });

  if (!currentPage) {
    return redirect(`/app/theme/customize?host=${host}`);
  }

  // Format the page data
  const formattedPage = {
    id: currentPage.id,
    name: currentPage.name,
    content: currentPage.content,
    isActive: currentPage.isActive
  };

  return json<LoaderData>({
    currentPage: formattedPage,
    pages,
    host,
    shop: shopId
  });
};

export default function ThemeCustomizerPage() {
  const { currentPage, pages, host, shop } = useLoaderData<typeof loader>();
  const [content, setContent] = useState(currentPage.content);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    const formData = new FormData();
    formData.append('_action', 'save');
    formData.append('content', content);
    
    submit(formData, {
      method: 'POST',
      navigate: false
    });
    setHasChanges(false);
  }, [content, submit]);

  const handlePageChange = useCallback((value: string) => {
    navigate(`/app/theme/customize/${value}?host=${host}`);
  }, [navigate, host]);

  return (
    <Page fullWidth>
      <PublishingBar
        asset={currentPage}
        hasChanges={hasChanges}
        shop={shop}
        onBack={() => navigate(`/app/theme/customize?host=${host}`)}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onPublish={() => submit({ _action: 'publish' }, { method: 'POST' })}
        onUnpublish={() => submit({ _action: 'unpublish' }, { method: 'POST' })}
        onSave={handleSave}
        onVersionHistory={() => {}}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem' }}>
        <BlockStack gap="400">
          <Select
            label="Page"
            options={pages.map(page => ({ label: page.name, value: page.id }))}
            onChange={handlePageChange}
            value={currentPage.id}
          />
          <SectionList
            content={content}
            onContentChange={handleContentChange}
            shopId={shop}
          />
        </BlockStack>
        <div>
          <PagePreview
            page={currentPage}
          />
        </div>
      </div>
    </Page>
  );
}