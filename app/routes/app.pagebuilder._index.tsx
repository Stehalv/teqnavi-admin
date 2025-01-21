import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, Link } from '@remix-run/react';
import { useState, useCallback } from 'react';
import { 
  Page, 
  LegacyCard, 
  EmptyState,
  IndexTable,
  Text,
  useIndexResourceState,
  Badge,
  Button,
  Modal,
  ButtonGroup,
  Toast,
  type ActionListItemDescriptor
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { validateShopAccess } from '~/middleware/auth.server.js';
import { AIModal } from '~/features/pagebuilder/components/AIModal/AIModal.js';
import { prisma } from '~/db.server.js';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { shopId } = await validateShopAccess(request);
    const dbPages = await prisma.page.findMany({
      where: { shopId, deletedAt: null },
      orderBy: { updatedAt: 'desc' }
    });

    const pages = dbPages.map(page => ({
      ...page,
      data: JSON.parse(page.data),
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt),
      publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
      deletedAt: page.deletedAt ? new Date(page.deletedAt) : null
    }));

    return json({ pages });
  } catch (error) {
    console.error('Error loading pages:', error);
    throw new Response(error instanceof Error ? error.message : 'Failed to load pages', {
      status: 500
    });
  }
}

export default function PageBuilderIndex() {
  const { pages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [pagesToDelete, setPagesToDelete] = useState<string[]>([]);
  const [toastContent, setToastContent] = useState<{ message: string; error?: boolean } | null>(null);

  const { selectedResources, allResourcesSelected, handleSelectionChange } = 
    useIndexResourceState(pages);

  const handleDeleteSelectedPages = useCallback(async () => {
    try {
      const deletePromises = selectedResources.map(pageId => 
        fetch(`/api/pagebuilder/pages/${pageId}`, {
          method: 'DELETE'
        })
      );

      const results = await Promise.all(deletePromises);
      const hasErrors = results.some(response => !response.ok);

      if (hasErrors) {
        throw new Error('Failed to delete some pages');
      }

      setToastContent({ message: 'Selected pages deleted successfully' });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting pages:', error);
      setToastContent({ 
        message: error instanceof Error ? error.message : 'Failed to delete pages', 
        error: true 
      });
    }
  }, [selectedResources]);

  const handleDeletePage = useCallback(async (pageId: string) => {
    try {
      const response = await fetch(`/api/pagebuilder/pages/${pageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete page');
      }

      setToastContent({ message: 'Page deleted successfully' });
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting page:', error);
      setToastContent({ 
        message: error instanceof Error ? error.message : 'Failed to delete page', 
        error: true 
      });
    }
  }, []);

  const emptyStateMarkup = (
    <EmptyState
      heading="Create pages for your online store"
      action={{
        content: 'Generate with AI',
        onAction: () => setIsAIModalOpen(true)
      }}
      image="https://cdn.shopify.com/s/files/1/2376/3301/products/empty-state.png"
    >
      <p>Use AI to generate beautiful pages with sections and content.</p>
    </EmptyState>
  );

  const rowMarkup = pages.map((page, index) => (
    <IndexTable.Row
      id={page.id}
      key={page.id}
      position={index}
      selected={selectedResources.includes(page.id)}
      onClick={() => navigate(`/app/pagebuilder/${page.id}`)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {page.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {page.isPublished ? (
          <Badge tone="success">Published</Badge>
        ) : (
          <Badge tone="attention">Draft</Badge>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(page.updatedAt).toLocaleDateString()}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Button
            icon={DeleteIcon}
            tone="critical"
            onClick={() => setPageToDelete(page.id)}
            accessibilityLabel={`Delete ${page.title}`}
          />
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const bulkActions: ActionListItemDescriptor[] = selectedResources.length > 0
    ? [
        {
          content: `Delete Selected (${selectedResources.length})`,
          onAction: () => setPagesToDelete(selectedResources)
        }
      ]
    : [];

  return (
    <Page
      title="Pages"
      primaryAction={{
        content: 'Generate with AI',
        onAction: () => setIsAIModalOpen(true)
      }}
      secondaryActions={
        selectedResources.length > 0 
          ? [{
              content: `Delete Selected (${selectedResources.length})`,
              onAction: () => setPagesToDelete(selectedResources)
            }]
          : undefined
      }
    >
      {pages.length === 0 ? (
        emptyStateMarkup
      ) : (
        <LegacyCard>
          <IndexTable
            resourceName={{ singular: 'page', plural: 'pages' }}
            itemCount={pages.length}
            selectedItemsCount={
              allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: 'Title' },
              { title: 'Status' },
              { title: 'Last Updated' },
              { title: 'Actions' }
            ]}
            selectable
            bulkActions={bulkActions}
          >
            {rowMarkup}
          </IndexTable>
        </LegacyCard>
      )}

      <AIModal
        open={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        description="Describe the page you want to create and our AI will generate it for you."
        placeholder="e.g. Create a modern homepage with a hero section, featured products, and newsletter signup"
        generateButtonText="Generate Page"
      />

      <Modal
        open={pageToDelete !== null}
        onClose={() => setPageToDelete(null)}
        title="Delete Page"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => {
            if (pageToDelete) {
              handleDeletePage(pageToDelete);
              setPageToDelete(null);
            }
          }
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setPageToDelete(null)
          }
        ]}
      >
        <Modal.Section>
          <p>Are you sure you want to delete this page? This action cannot be undone.</p>
        </Modal.Section>
      </Modal>

      <Modal
        open={pagesToDelete.length > 0}
        onClose={() => setPagesToDelete([])}
        title="Delete Selected Pages"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => {
            handleDeleteSelectedPages();
            setPagesToDelete([]);
          }
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setPagesToDelete([])
          }
        ]}
      >
        <Modal.Section>
          <p>Are you sure you want to delete {pagesToDelete.length} selected pages? This action cannot be undone.</p>
        </Modal.Section>
      </Modal>

      {toastContent && (
        <Toast
          content={toastContent.message}
          error={toastContent.error}
          onDismiss={() => setToastContent(null)}
        />
      )}
    </Page>
  );
} 