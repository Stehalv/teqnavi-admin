import { useState, useCallback } from "react";

export function useCollapsibleSections() {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const isCollapsed = useCallback((sectionId: string) => {
    return collapsedSections.has(sectionId);
  }, [collapsedSections]);

  const expandAll = useCallback(() => {
    setCollapsedSections(new Set());
  }, []);

  const collapseAll = useCallback((sectionIds: string[]) => {
    setCollapsedSections(new Set(sectionIds));
  }, []);

  return {
    isCollapsed,
    toggleCollapse,
    expandAll,
    collapseAll
  };
} 