/**
 * Tag Autocomplete Component
 * 
 * Provides autocomplete suggestions for semantic tags in the editor
 */

import React, { useState, useEffect, useRef } from 'react';
import { semanticTagsAPI } from '@/lib/api';

export interface TagSuggestion {
  id: string;
  type: 'character' | 'place' | 'event' | 'theme' | 'note' | 'link';
  name: string;
  description?: string;
}

interface TagAutocompleteProps {
  projectId: string;
  onSelect: (suggestion: TagSuggestion, syntax: 'markdown' | 'xml') => void;
  trigger: string; // '[[' or '<'
  query: string;
  position: { top: number; left: number };
  onClose: () => void;
}

const typeColors: Record<TagSuggestion['type'], string> = {
  character: '#3b82f6',
  place: '#10b981',
  event: '#f97316',
  theme: '#8b5cf6',
  note: '#eab308',
  link: '#06b6d4',
};

const typeLabels: Record<TagSuggestion['type'], string> = {
  character: 'Personnage',
  place: 'Lieu',
  event: 'Événement',
  theme: 'Thème',
  note: 'Note',
  link: 'Lien',
};

export function TagAutocomplete({
  projectId,
  onSelect,
  trigger,
  query,
  position,
  onClose,
}: TagAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Detect syntax type
  const syntax: 'markdown' | 'xml' = trigger === '[[' ? 'markdown' : 'xml';

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        // Utiliser getAll pour récupérer tous les tags et filtrer localement
        const allTags = await semanticTagsAPI.getAll(projectId);
        const filtered = allTags
          .filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
          .map(tag => ({
            id: tag.id,
            type: (tag.category as any) || 'note',
            name: tag.name,
            description: tag.description,
          }));
        setSuggestions(filtered);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [query, projectId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex], syntax);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onSelect, onClose, syntax]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (loading) {
    return (
      <div
        ref={popupRef}
        className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        style={{ top: position.top, left: position.left }}
      >
        <div className="text-sm text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div
        ref={popupRef}
        className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        style={{ top: position.top, left: position.left }}
      >
        <div className="text-sm text-gray-500">Aucune suggestion</div>
      </div>
    );
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto min-w-[250px]"
      style={{ top: position.top, left: position.left }}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id}
          className={`px-4 py-2 cursor-pointer transition-colors ${
            index === selectedIndex
              ? 'bg-blue-50 text-blue-900'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(suggestion, syntax)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: typeColors[suggestion.type] }}
            />
            <span className="font-medium">{suggestion.name}</span>
            <span className="text-xs text-gray-500">{typeLabels[suggestion.type]}</span>
          </div>
          {suggestion.description && (
            <div className="text-xs text-gray-600 mt-1 ml-4">{suggestion.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
