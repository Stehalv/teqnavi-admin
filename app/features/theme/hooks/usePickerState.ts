import { useState, useCallback } from "react";

interface PickerState {
  isOpen: boolean;
  mode: 'section' | 'block' | null;
  context?: { sectionId?: string };
}

export function usePickerState() {
  const [pickerState, setPickerState] = useState<PickerState>({
    isOpen: false,
    mode: null,
    context: {}
  });

  const openPicker = useCallback((mode: 'section' | 'block', sectionId?: string) => {
    setPickerState({
      isOpen: true,
      mode,
      context: sectionId ? { sectionId } : {}
    });
  }, []);

  const closePicker = useCallback(() => {
    setPickerState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const isPickerOpen = useCallback((mode: 'section' | 'block', sectionId?: string) => {
    return pickerState.isOpen && 
           pickerState.mode === mode && 
           (!sectionId || pickerState.context?.sectionId === sectionId);
  }, [pickerState]);

  return {
    pickerState,
    openPicker,
    closePicker,
    isPickerOpen
  };
} 