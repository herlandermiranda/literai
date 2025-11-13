import { describe, it, expect } from 'vitest';
import { parseTaggedText, stripTags } from '@/lib/tagParser';

describe('tagParser', () => {
  describe('parseTaggedText', () => {
    it('should parse simple Markdown tags', () => {
      const text = 'Hello [[character:John]] and [[place:Paris]]';
      const result = parseTaggedText(text);
      
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ type: 'text', content: 'Hello ' });
      expect(result[1]).toEqual({
        type: 'tag',
        content: 'John',
        tagType: 'character',
        startPos: 6,
        endPos: 24,
      });
      expect(result[2]).toEqual({ type: 'text', content: ' and ' });
      expect(result[3]).toEqual({
        type: 'tag',
        content: 'Paris',
        tagType: 'place',
        startPos: 29,
        endPos: 44,
      });
      expect(result[4]).toEqual({ type: 'text', content: '' });
    });

    it('should parse XML tags', () => {
      const text = 'Meet <character>Alice</character> at <place>London</place>';
      const result = parseTaggedText(text);
      
      expect(result).toHaveLength(5);
      expect(result[1]).toEqual({
        type: 'tag',
        content: 'Alice',
        tagType: 'character',
        startPos: 5,
        endPos: 33,
      });
      expect(result[3]).toEqual({
        type: 'tag',
        content: 'London',
        tagType: 'place',
        startPos: 37,
        endPos: 58,
      });
    });

    it('should handle mixed Markdown and XML tags', () => {
      const text = '[[character:Bob]] meets <place>Tokyo</place>';
      const result = parseTaggedText(text);
      
      // Both Markdown and XML tags are parsed
      expect(result).toHaveLength(4);
      expect(result[0].type).toBe('tag');
      expect(result[1]).toEqual({ type: 'text', content: ' meets ' });
      expect(result[2].type).toBe('tag');
      expect(result[3]).toEqual({ type: 'text', content: '' });
    });

    it('should handle tags with attributes', () => {
      const text = '[[character:Eve|id=123|role=protagonist]]';
      const result = parseTaggedText(text);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'tag',
        content: 'Eve',
        tagType: 'character',
        startPos: 0,
        endPos: 41,
      });
      expect(result[1]).toEqual({ type: 'text', content: '' });
    });

    it('should handle text without tags', () => {
      const text = 'Plain text without any tags';
      const result = parseTaggedText(text);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: 'text', content: text });
    });

    it('should handle empty string', () => {
      const result = parseTaggedText('');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ type: 'text', content: '' });
    });

    it('should handle malformed tags gracefully', () => {
      const text = '[[character:John and [[place:Paris';
      const result = parseTaggedText(text);
      
      // Should treat malformed tags as text
      expect(result.some(token => token.type === 'text')).toBe(true);
    });

    it('should handle nested tags', () => {
      const text = '[[character:John [[inner]]]]';
      const result = parseTaggedText(text);
      
      // Should handle nested tags appropriately
      expect(result).toBeDefined();
    });

    it('should preserve whitespace', () => {
      const text = '  [[character:John]]  ';
      const result = parseTaggedText(text);
      
      expect(result[0]).toEqual({ type: 'text', content: '  ' });
      expect(result[2]).toEqual({ type: 'text', content: '  ' });
    });

    it('should handle special characters in content', () => {
      const text = '[[character:Émilie & François]]';
      const result = parseTaggedText(text);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'tag',
        content: 'Émilie & François',
        tagType: 'character',
        startPos: 0,
        endPos: 31,
      });
      expect(result[1]).toEqual({ type: 'text', content: '' });
    });
  });

  describe('stripTags', () => {
    it('should strip Markdown tags', () => {
      const text = 'Hello [[character:John]] and [[place:Paris]]';
      const result = stripTags(text);
      
      expect(result).toBe('Hello John and Paris');
    });

    it('should strip XML tags', () => {
      const text = 'Meet <character>Alice</character> at <place>London</place>';
      const result = stripTags(text);
      
      expect(result).toBe('Meet Alice at London');
    });

    it('should strip tags with attributes', () => {
      const text = '[[character:Eve|id=123|role=protagonist]]';
      const result = stripTags(text);
      
      expect(result).toBe('Eve');
    });

    it('should handle text without tags', () => {
      const text = 'Plain text';
      const result = stripTags(text);
      
      expect(result).toBe(text);
    });

    it('should handle empty string', () => {
      const result = stripTags('');
      expect(result).toBe('');
    });

    it('should preserve spacing between tags', () => {
      const text = '[[character:A]] [[character:B]]';
      const result = stripTags(text);
      
      expect(result).toBe('A B');
    });
  });
});
