/**
 * Client-side parser for semantic tags
 * 
 * Supports two syntaxes:
 * - Markdown-like: [[type:text]] or [[type:text#id]]
 * - XML-like: <type>text</type> or <type id="uuid">text</type>
 */

export interface ParsedTag {
  type: 'character' | 'place' | 'event' | 'theme' | 'note' | 'link';
  text: string;
  startPos: number;
  endPos: number;
  attributes: {
    id?: string;
    level?: number;
    timelineId?: string;
  };
  raw: string;
}

export interface ParseResult {
  tags: ParsedTag[];
  errors: Array<{
    message: string;
    position: number;
  }>;
}

/**
 * Parse text and return array of text and tag segments
 * This is the client-friendly API used by the UI
 */
export interface TaggedSegment {
  type: 'text' | 'tag';
  content: string;
  tagType?: 'character' | 'place' | 'event' | 'theme' | 'note' | 'link';
  startPos?: number;
  endPos?: number;
}

export function parseTaggedText(text: string): TaggedSegment[] {
  const result = parseTags(text);
  const segments: TaggedSegment[] = [];
  
  if (result.tags.length === 0) {
    // No tags found, return entire text as single segment
    return [{ type: 'text', content: text }];
  }

  // Sort tags by position
  const sortedTags = [...result.tags].sort((a, b) => a.startPos - b.startPos);
  
  let lastPos = 0;
  
  for (const tag of sortedTags) {
    // Add text before tag
    if (tag.startPos > lastPos) {
      segments.push({
        type: 'text',
        content: text.substring(lastPos, tag.startPos)
      });
    }
    
    // Add tag
    segments.push({
      type: 'tag',
      content: tag.text,
      tagType: tag.type,
      startPos: tag.startPos,
      endPos: tag.endPos
    });
    
    lastPos = tag.endPos;
  }
  
  // Add remaining text after last tag (even if empty)
  segments.push({
    type: 'text',
    content: text.substring(lastPos)
  });
  
  return segments;
}

/**
 * Parse text containing semantic tags
 */
export function parseTags(text: string): ParseResult {
  const tags: ParsedTag[] = [];
  const errors: Array<{ message: string; position: number }> = [];

  // Regex for Markdown-style tags: [[type:text]] or [[type:text#id]] or [[type:text|attr=val|...]]
  // Supports any content including special characters until ]] or # or |
  const markdownRegex = /\[\[([a-z]+):([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
  
  // Regex for XML-style tags: <type>text</type> or <type id="uuid">text</type>
  const xmlOpenRegex = /<([a-z]+)(?:\s+([^>]+))?>/g;
  
  let match;

  // Parse Markdown-style tags
  while ((match = markdownRegex.exec(text)) !== null) {
    const [raw, type, tagText, id] = match;
    const startPos = match.index;
    const endPos = startPos + raw.length;

    if (isValidTagType(type)) {
      tags.push({
        type: type as ParsedTag['type'],
        text: tagText.trim(),
        startPos,
        endPos,
        attributes: id ? { id } : {},
        raw
      });
    } else {
      errors.push({
        message: `Invalid tag type: ${type}`,
        position: startPos
      });
    }
  }

  // Parse XML-style tags
  const xmlTags: Array<{
    type: string;
    attributes: Record<string, string>;
    startPos: number;
    openTagEnd: number;
  }> = [];

  while ((match = xmlOpenRegex.exec(text)) !== null) {
    const [raw, type, attrString] = match;
    const startPos = match.index;
    const openTagEnd = startPos + raw.length;

    const attributes = parseAttributes(attrString || '');

    if (isValidTagType(type)) {
      xmlTags.push({
        type,
        attributes,
        startPos,
        openTagEnd
      });
    } else {
      errors.push({
        message: `Invalid tag type: ${type}`,
        position: startPos
      });
    }
  }

  // Match closing tags for XML-style
  for (const openTag of xmlTags) {
    const closeRegex = new RegExp(`</${openTag.type}>`, 'g');
    closeRegex.lastIndex = openTag.openTagEnd;
    
    const closeMatch = closeRegex.exec(text);
    
    if (closeMatch) {
      const tagText = text.substring(openTag.openTagEnd, closeMatch.index);
      const endPos = closeMatch.index + closeMatch[0].length;

      tags.push({
        type: openTag.type as ParsedTag['type'],
        text: tagText.trim(),
        startPos: openTag.startPos,
        endPos,
        attributes: {
          id: openTag.attributes.id,
          level: openTag.attributes.level ? parseInt(openTag.attributes.level) : undefined,
          timelineId: openTag.attributes['timeline-id']
        },
        raw: text.substring(openTag.startPos, endPos)
      });
    } else {
      errors.push({
        message: `Unclosed tag: <${openTag.type}>`,
        position: openTag.startPos
      });
    }
  }

  // Sort tags by position
  tags.sort((a, b) => a.startPos - b.startPos);

  return { tags, errors };
}

/**
 * Strip all tags from text (for "brut" mode)
 */
export function stripTags(text: string): string {
  // Remove Markdown-style tags with attributes: [[type:text|attr=val|...]]
  let result = text.replace(/\[\[([a-z]+):([^\]|]+)(?:\|[^\]]*?)?\]\]/g, '$2');

  // Remove XML-style tags
  result = result.replace(/<([a-z]+)(?:\s+[^>]+)?>(.*?)<\/\1>/g, '$2');

  return result;
}

/**
 * Check if a tag type is valid
 */
function isValidTagType(type: string): boolean {
  return ['character', 'place', 'event', 'theme', 'note', 'link'].includes(type);
}

/**
 * Parse XML-style attributes
 */
function parseAttributes(attrString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  if (!attrString) return attributes;

  // Match attribute="value" or attribute='value'
  const attrRegex = /([a-z-]+)=["']([^"']*)["']/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

/**
 * Get tag color by type
 */
export function getTagColor(type: ParsedTag['type']): string {
  const colors: Record<ParsedTag['type'], string> = {
    character: '#3b82f6', // blue
    place: '#10b981',     // green
    event: '#f97316',     // orange
    theme: '#8b5cf6',     // purple
    note: '#eab308',      // yellow
    link: '#06b6d4'       // cyan
  };

  return colors[type] || '#6b7280'; // gray fallback
}

/**
 * Get tag label by type
 */
export function getTagLabel(type: ParsedTag['type']): string {
  const labels: Record<ParsedTag['type'], string> = {
    character: 'Personnage',
    place: 'Lieu',
    event: 'Événement',
    theme: 'Thème',
    note: 'Note',
    link: 'Lien'
  };

  return labels[type] || type;
}
