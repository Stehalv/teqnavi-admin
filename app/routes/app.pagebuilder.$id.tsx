import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState, useCallback } from 'react';
import { Frame, Loading, Banner, Page as PolarisPage, Toast } from '@shopify/polaris';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { PageService } from '~/features/pagebuilder/services/page.server.js';
import { PageClient } from '~/features/pagebuilder/services/page.client.js';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';
import { PageBuilder } from '~/features/pagebuilder/components/PageBuilder/PageBuilder.js';
import { PageBuilderProvider } from '~/features/pagebuilder/context/PageBuilderContext.js';
import type { PageUI } from '~/features/pagebuilder/types/shopify.js';
import type { SectionRegistry, TemplateSchema } from '~/features/pagebuilder/types/templates.js';

interface SaveError {
  message: string;
  details?: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const { id } = params;

    if (!id) {
      throw new Error('Page ID is required');
    }

    console.log('Loading page:', { shopId, id });

    // Get the page from the database
    const page = await PageService.getPage(shopId, id);
    console.log('Page from database:', page);
    
    if (!page) {
      throw new Response('Page not found', { status: 404 });
    }

    // Get all section templates
    const templates = await TemplateService.listSectionDefinitions(shopId);
    console.log('Templates loaded:', templates.length);
    
    // Convert templates to SectionRegistry format
    const sectionRegistry: SectionRegistry = {};
    for (const template of templates) {
      try {
        const schema = template.schema as unknown as TemplateSchema;
        sectionRegistry[template.type] = {
          name: template.name,
          type: template.type,
          schema,
          liquid: template.liquid,
          styles: template.styles || ''
        };
      } catch (error) {
        console.error('Error processing template:', template.type, error);
      }
    }

    // Convert page to PageUI format with proper date handling
    const pageUI: PageUI = {
      ...page,
      data: page.data,
      settings: page.data.settings || {},
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt),
      publishedAt: page.publishedAt ? new Date(page.publishedAt) : undefined,
      deletedAt: page.deletedAt ? new Date(page.deletedAt) : undefined
    };

    return json({ 
      page: pageUI, 
      sectionRegistry 
    });
  } catch (error) {
    console.error('Error in pagebuilder loader:', error);
    
    if (error instanceof Response) {
      throw error;
    }

    throw new Response(
      error instanceof Error ? error.message : 'An unexpected error occurred loading the page',
      { status: 500 }
    );
  }
}

export default function PageBuilderPage() {
  const { page: serializedPage, sectionRegistry } = useLoaderData<typeof loader>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Convert serialized dates back to Date objects
  const page: PageUI = {
    ...serializedPage,
    createdAt: new Date(serializedPage.createdAt),
    updatedAt: new Date(serializedPage.updatedAt),
    publishedAt: serializedPage.publishedAt ? new Date(serializedPage.publishedAt) : undefined,
    deletedAt: serializedPage.deletedAt ? new Date(serializedPage.deletedAt) : undefined
  };

  const handleSave = useCallback(async (updatedPage: PageUI) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await PageClient.updatePage(page.shopId, page.id, {
        ...updatedPage,
        data: updatedPage.data
      });
      setShowSaveToast(true);
    } catch (error) {
      setSaveError({
        message: 'Failed to save page',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  }, [page.id, page.shopId]);

  return (
    <Frame>
      {isSaving && <Loading />}
      
      {saveError && (
        <Banner
          title={saveError.message}
          tone="critical"
          onDismiss={() => setSaveError(null)}
        >
          {saveError.details && <p>{saveError.details}</p>}
        </Banner>
      )}

      {showSaveToast && (
        <Toast
          content="Page saved successfully"
          onDismiss={() => setShowSaveToast(false)}
        />
      )}

      <PolarisPage fullWidth>
        <PageBuilderProvider
          initialPage={page}
          sectionRegistry={sectionRegistry}
          onSave={handleSave}
        >
          <PageBuilder />
        </PageBuilderProvider>
      </PolarisPage>
    </Frame>
  );
} 