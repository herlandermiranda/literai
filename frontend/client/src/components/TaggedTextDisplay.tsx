/**
 * Tagged Text Display Component
 * 
 * Displays text with semantic tags in different modes:
 * - raw: Strip all tags, show only text
 * - colored: Syntax highlighting with colors
 * - code: Show raw markup
 */

import React, { useEffect, useState } from 'react';
import { parseTags, stripTags, getTagColor, type ParsedTag } from '@/lib/tagParser';

export type DisplayMode = 'raw' | 'colored' | 'code';

interface TaggedTextDisplayProps {
  text: string;
  mode: DisplayMode;
  projectId: string;
  className?: string;
}

const typeColors: Record<string, string> = {
  character: '#3b82f6',
  place: '#10b981',
  event: '#f97316',
  theme: '#8b5cf6',
  note: '#eab308',
  link: '#06b6d4',
};

export function TaggedTextDisplay({
  text,
  mode,
  projectId,
  className = '',
}: TaggedTextDisplayProps) {
  const [parsedTags, setParsedTags] = useState<ParsedTag[]>([]);

  useEffect(() => {
    const result = parseTags(text);
    setParsedTags(result.tags);
  }, [text]);

  // Raw mode: strip all tags
  if (mode === 'raw') {
    const cleanText = stripTags(text);
    return <div className={className}>{cleanText}</div>;
  }

  // Code mode: show raw markup
  if (mode === 'code') {
    return (
      <pre className={`bg-gray-100 p-4 rounded overflow-x-auto text-sm ${className}`}>
        <code>{text}</code>
      </pre>
    );
  }

  // Colored mode: syntax highlighting
  const renderColoredText = () => {
    if (parsedTags.length === 0) {
      return <span>{text}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    parsedTags.forEach((tag, index) => {
      // Add text before tag
      if (tag.startPos > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>{text.slice(lastIndex, tag.startPos)}</span>
        );
      }

      // Add colored tag
      const color = getTagColor(tag.type);
      
      parts.push(
        <span
          key={`tag-${index}`}
          style={{
            color,
            fontWeight: 600,
            backgroundColor: `${color}15`,
            padding: '2px 4px',
            borderRadius: '3px',
            border: `1px solid ${color}40`,
          }}
          title={`Type: ${tag.type}${tag.attributes ? ` | Attributs: ${JSON.stringify(tag.attributes)}` : ''}`}
        >
          {tag.text}
        </span>
      );

      lastIndex = tag.endPos;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {renderColoredText()}
    </div>
  );
}
