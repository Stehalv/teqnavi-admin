import { useState, useCallback, useEffect } from 'react';
import { Modal, TextContainer, TextField, Button, Spinner, Tabs, Box, Card, Text, Banner } from '@shopify/polaris';
import { useSubmit, useNavigation, useNavigate } from '@remix-run/react';

interface AIModalProps {
  open: boolean;
  onClose: () => void;
  description?: string;
  placeholder?: string;
  generateButtonText?: string;
}

interface JobProgress {
  stage: string;
  message: string;
  timestamp: Date;
}

interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: JobProgress[];
  data?: any;
  error?: string;
}

export function AIModal({ 
  open, 
  onClose,
  description = "Describe the page you want to create and our AI will generate it for you.",
  placeholder = "e.g. Create a modern homepage with a hero section, featured products, and newsletter signup",
  generateButtonText = "Generate Page"
}: AIModalProps) {
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isGenerating = navigation.state === 'submitting' || job?.status === 'processing';

  const handleGenerate = useCallback(async () => {
    const formData = new FormData();
    formData.append('prompt', prompt);

    try {
      const response = await fetch('/api/ai/generate-page/init', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.jobId) {
        setJobId(data.jobId);
      } else {
        throw new Error(data.error || 'Failed to start generation');
      }
    } catch (error) {
      console.error('Error starting generation:', error);
    }
  }, [prompt]);

  // Poll for job status
  useEffect(() => {
    if (!jobId || job?.status === 'completed' || job?.status === 'error') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/generate-page/status?jobId=${jobId}`);
        const data = await response.json();
        
        if (data.success && data.job) {
          setJob(data.job);
          
          if (data.job.status === 'completed' || data.job.status === 'error') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [jobId, job?.status]);

  const tabs = [
    {
      id: 'progress',
      content: 'Progress',
      accessibilityLabel: 'Progress',
      panelID: 'progress-panel',
    },
    {
      id: 'response',
      content: 'OpenAI Response',
      accessibilityLabel: 'OpenAI Response',
      panelID: 'response-panel',
    },
    {
      id: 'page',
      content: 'Generated Page',
      accessibilityLabel: 'Generated Page',
      panelID: 'page-panel',
    },
    {
      id: 'templates',
      content: 'Templates',
      accessibilityLabel: 'Templates',
      panelID: 'templates-panel',
    },
  ];

  const renderProgress = () => {
    if (!job?.progress.length) return null;

    return (
      <Card>
        <div>
          {job.progress.map((p, i) => (
            <Box key={i} paddingBlockEnd="200">
              <Text as="p" variant="bodyMd">
                <Text as="span" variant="bodyMd" fontWeight="bold">{p.stage}:</Text> {p.message}
              </Text>
            </Box>
          ))}
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    if (!job) {
      return (
        <TextContainer>
          <Text as="p" variant="bodyMd">{description}</Text>
          <TextField
            label="What kind of page would you like to create?"
            value={prompt}
            onChange={setPrompt}
            multiline={4}
            autoComplete="off"
            disabled={isGenerating}
            placeholder={placeholder}
          />
        </TextContainer>
      );
    }

    if (job.status === 'error') {
      return (
        <Banner tone="critical">
          <p>Error: {job.error}</p>
        </Banner>
      );
    }

    return (
      <>
        {isGenerating && (
          <Box paddingBlockEnd="400">
            <TextContainer>
              <Box paddingBlockEnd="400">
                <Spinner size="large" />
              </Box>
              <Text as="p" variant="bodyMd">Generating your page...</Text>
            </TextContainer>
          </Box>
        )}
        
        <Tabs
          tabs={tabs}
          selected={selectedTab}
          onSelect={setSelectedTab}
        >
          <Box padding="400">
            {selectedTab === 0 && renderProgress()}
            {selectedTab === 1 && job.data?.rawResponse && (
              <Card>
                <div>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {job.data.rawResponse}
                  </pre>
                </div>
              </Card>
            )}
            {selectedTab === 2 && job.data?.page && (
              <Card>
                <div>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {job.data.page}
                  </pre>
                </div>
              </Card>
            )}
            {selectedTab === 3 && job.data?.templates && (
              <Card>
                <div>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(job.data.templates, null, 2)}
                  </pre>
                </div>
              </Card>
            )}
          </Box>
        </Tabs>
      </>
    );
  };

  const handleGoToPage = () => {
    if (job?.data?.page) {
      const pageData = JSON.parse(job.data.page);
      navigate(`/app/pagebuilder/${pageData.id}`);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Page with AI"
      primaryAction={{
        content: job ? 'Generate Another' : generateButtonText,
        onAction: job ? () => {
          setJob(null);
          setJobId(null);
          setPrompt('');
        } : handleGenerate,
        disabled: (!prompt && !job) || isGenerating,
        loading: isGenerating
      }}
      secondaryActions={[
        ...(job?.status === 'completed' ? [{
          content: 'Go to Page',
          onAction: handleGoToPage
        }] : []),
        {
          content: 'Close',
          onAction: onClose,
        }
      ]}
    >
      <Modal.Section>
        {renderContent()}
      </Modal.Section>
    </Modal>
  );
} 