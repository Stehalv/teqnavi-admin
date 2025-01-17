import { Card, FormLayout, TextField, Button } from "@shopify/polaris";

interface FormPreviewProps {
  config: string;
}

export function FormPreview({ config }: FormPreviewProps) {
  const parsedConfig = JSON.parse(config);
  
  return (
    <Card>
      <FormLayout>
        {parsedConfig.type === 'customer' ? (
          <>
            <TextField label="Email" disabled autoComplete="off" />
            <TextField label="Password" type="password" disabled autoComplete="off" />
          </>
        ) : (
          <>
            <TextField label="Name" disabled autoComplete="off" />
            <TextField label="Email" disabled autoComplete="off" />
          </>
        )}
        <Button disabled>Submit</Button>
      </FormLayout>
    </Card>
  );
} 