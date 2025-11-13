/**
 * TextRenderer component
 * 
 * Renders text with semantic tags in different modes:
 * - brut: Plain text without tags (immersive reading)
 * - colored: Highlighted tags with tooltips and links
 * - code: Visible tags with syntax highlighting
 */

import React, { useMemo } from 'react';
import { parseTags, stripTags, getTagColor, getTagLabel, ParsedTag } from '@/lib/tagParser';

export type RenderMode = 'brut' | 'colored' | 'code';

interface TextRendererProps {
  text: string;
  mode: RenderMode;
  onTagClick?: (tag: ParsedTag) => void;
  className?: string;
}

export function TextRenderer({ text, mode, onTagClick, className = '' }: TextRendererProps) {
  const content = useMemo(() => {
    switch (mode) {
      case 'brut':
        return renderBrut(text);
      case 'colored':
        return renderColored(text, onTagClick);
      case 'code':
        return renderCode(text);
      default:
        return text;
    }
  }, [text, mode, onTagClick]);

  return (
    <div className={`text-renderer text-renderer--${mode} ${className}`}>
      {content}
    </div>
  );
}

/**
 * Mode Brut: Strip all tags for immersive reading
 */
function renderBrut(text: string): React.ReactNode {
  const cleanText = stripTags(text);
  
  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {cleanText}
    </div>
  );
}

/**
 * Mode Coloré: Highlight tags with colors, tooltips, and clickable links
 */
function renderColored(
  text: string,
  onTagClick?: (tag: ParsedTag) => void
): React.ReactNode {
  const { tags } = parseTags(text);
  
  if (tags.length === 0) {
    return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  tags.forEach((tag, idx) => {
    // Add text before tag
    if (tag.startPos > lastIndex) {
      elements.push(
        <span key={`text-${idx}`}>
          {text.substring(lastIndex, tag.startPos)}
        </span>
      );
    }

    // Add highlighted tag
    const color = getTagColor(tag.type);
    const label = getTagLabel(tag.type);

    elements.push(
      <span
        key={`tag-${idx}`}
        className="tag-highlight cursor-pointer relative group inline-block"
        style={{
          backgroundColor: `${color}20`,
          borderBottom: `2px solid ${color}`,
          padding: '0 2px',
          borderRadius: '2px'
        }}
        onClick={() => onTagClick?.(tag)}
      >
        {tag.text}
        
        {/* Tooltip */}
        <span
          className="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
          style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        >
          <span className="font-semibold">{label}</span>: {tag.text}
          {tag.attributes.id && (
            <span className="block text-xs text-gray-400 mt-1">
              ID: {tag.attributes.id}
            </span>
          )}
          {/* Arrow */}
          <span
            className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"
          />
        </span>
      </span>
    );

    lastIndex = tag.endPos;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {elements}
    </div>
  );
}

/**
 * Mode Code: Show tags with syntax highlighting
 */
function renderCode(text: string): React.ReactNode {
  const { tags } = parseTags(text);
  
  if (tags.length === 0) {
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
        {text}
      </pre>
    );
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  tags.forEach((tag, idx) => {
    // Add text before tag
    if (tag.startPos > lastIndex) {
      elements.push(
        <span key={`text-${idx}`} className="text-gray-700">
          {text.substring(lastIndex, tag.startPos)}
        </span>
      );
    }

    // Add syntax-highlighted tag
    const color = getTagColor(tag.type);
    
    // Detect syntax type
    const isMarkdown = tag.raw.startsWith('[[');
    
    if (isMarkdown) {
      // [[type:text]] or [[type:text#id]]
      elements.push(
        <span key={`tag-${idx}`} className="inline-block">
          <span className="text-gray-500">[[</span>
          <span className="font-semibold" style={{ color }}>{tag.type}</span>
          <span className="text-gray-500">:</span>
          <span className="text-gray-800">{tag.text}</span>
          {tag.attributes.id && (
            <>
              <span className="text-gray-500">#</span>
              <span className="text-purple-600">{tag.attributes.id}</span>
            </>
          )}
          <span className="text-gray-500">]]</span>
        </span>
      );
    } else {
      // <type>text</type> or <type id="uuid">text</type>
      elements.push(
        <span key={`tag-${idx}`} className="inline-block">
          <span className="text-gray-500">&lt;</span>
          <span className="font-semibold" style={{ color }}>{tag.type}</span>
          {tag.attributes.id && (
            <>
              <span className="text-gray-500"> id=</span>
              <span className="text-green-600">"{tag.attributes.id}"</span>
            </>
          )}
          <span className="text-gray-500">&gt;</span>
          <span className="text-gray-800">{tag.text}</span>
          <span className="text-gray-500">&lt;/</span>
          <span className="font-semibold" style={{ color }}>{tag.type}</span>
          <span className="text-gray-500">&gt;</span>
        </span>
      );
    }

    lastIndex = tag.endPos;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <span key="text-end" className="text-gray-700">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
      {elements}
    </pre>
  );
}
