import { FormLayout, TextField, Select, Checkbox } from "@shopify/polaris";
import { useState } from "react";

interface ProductConfigProps {
  config: string;
  onUpdate: (config: string) => void;
}

export function ProductConfig({ config, onUpdate }: ProductConfigProps) {
  const parsedConfig = JSON.parse(config);
  const [maxProducts, setMaxProducts] = useState(parsedConfig.maxProducts || 1);
  const [showPrice, setShowPrice] = useState(parsedConfig.showPrice ?? true);

  const handleUpdate = () => {
    onUpdate(JSON.stringify({
      maxProducts,
      showPrice
    }));
  };

  return (
    <FormLayout>
      <TextField
        label="Max Products"
        type="number"
        value={maxProducts.toString()}
        onChange={(value) => {
          setMaxProducts(parseInt(value, 10));
          handleUpdate();
        }}
        autoComplete="off"
      />
      <Checkbox
        label="Show Price"
        checked={showPrice}
        onChange={(checked) => {
          setShowPrice(checked);
          handleUpdate();
        }}
      />
    </FormLayout>
  );
} 