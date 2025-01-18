import { useState } from "react";
import type { Block, Section } from "../types.js";

type Item = Block | Section;

export function useSettings<T extends Item>(
  item: T,
  onChange: (updatedItem: T) => void
) {
  const [settings, setSettings] = useState(item.settings);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onChange({
      ...item,
      settings: newSettings
    });
  };

  return {
    settings,
    handleSettingChange
  };
} 