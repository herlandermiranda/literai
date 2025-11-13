/**
 * Hook for managing tag autocomplete in the editor
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TagSuggestion } from '@/components/TagAutocomplete';

interface UseTagAutocompleteOptions {
  projectId: string;
  onInsertTag: (tag: string) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  trigger: '[[' | '<' | null;
  query: string;
  position: { top: number; left: number };
}

export function useTagAutocomplete({ projectId, onInsertTag }: UseTagAutocompleteOptions) {
  const [state, setState] = useState<AutocompleteState>({
    isOpen: false,
    trigger: null,
    query: '',
    position: { top: 0, left: 0 },
  });

  const editorRef = useRef<HTMLElement | null>(null);

  // Detect tag trigger in text
  const handleTextChange = useCallback((text: string, cursorPosition: number) => {
    // Look for [[ or < before cursor
    const beforeCursor = text.slice(0, cursorPosition);
    
    // Check for [[ trigger
    const markdownMatch = beforeCursor.match(/\[\[([^\]]*?)$/);
    if (markdownMatch) {
      const query = markdownMatch[1];
      setState({
        isOpen: true,
        trigger: '[[',
        query,
        position: getCursorPosition(),
      });
      return;
    }

    // Check for < trigger
    const xmlMatch = beforeCursor.match(/<([^>]*?)$/);
    if (xmlMatch) {
      const query = xmlMatch[1];
      // Only trigger if it looks like a tag (not HTML)
      if (!query.match(/^(div|span|p|h[1-6]|ul|ol|li|a|img|br|hr)/i)) {
        setState({
          isOpen: true,
          trigger: '<',
          query,
          position: getCursorPosition(),
        });
        return;
      }
    }

    // Close autocomplete if no trigger found
    if (state.isOpen) {
      setState({
        isOpen: false,
        trigger: null,
        query: '',
        position: { top: 0, left: 0 },
      });
    }
  }, [state.isOpen]);

  // Get cursor position for popup placement
  const getCursorPosition = (): { top: number; left: number } => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { top: 0, left: 0 };
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return {
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    };
  };

  // Handle tag selection
  const handleSelectTag = useCallback((suggestion: TagSuggestion, syntax: 'markdown' | 'xml') => {
    let tagText = '';
    
    if (syntax === 'markdown') {
      tagText = `[[${suggestion.type}:${suggestion.name}]]`;
    } else {
      tagText = `<${suggestion.type}>${suggestion.name}</${suggestion.type}>`;
    }

    onInsertTag(tagText);

    setState({
      isOpen: false,
      trigger: null,
      query: '',
      position: { top: 0, left: 0 },
    });
  }, [onInsertTag]);

  // Close autocomplete
  const handleClose = useCallback(() => {
    setState({
      isOpen: false,
      trigger: null,
      query: '',
      position: { top: 0, left: 0 },
    });
  }, []);

  return {
    state,
    handleTextChange,
    handleSelectTag,
    handleClose,
    setEditorRef: (ref: HTMLElement | null) => {
      editorRef.current = ref;
    },
  };
}
