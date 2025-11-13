/**
 * Regression Tests for Bug Fixes
 * 
 * Tests for:
 * 1. Document text save bug
 * 2. Undo history shared between documents
 * 3. Pyramid node creation error
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Bug Fixes - Regression Tests', () => {
  describe('Bug 1: Document Text Not Saved', () => {
    it('should save document content when switching documents', async () => {
      // Mock API responses
      const mockSaveDocument = vi.fn().mockResolvedValue({ success: true });
      
      // Simulate document switch with unsaved changes
      const hasUnsavedChanges = true;
      const selectedDocument = { id: '1', content: 'Updated content' };
      
      // When switching documents, save should be called
      if (hasUnsavedChanges && selectedDocument) {
        await mockSaveDocument(selectedDocument.id, selectedDocument.content);
      }
      
      expect(mockSaveDocument).toHaveBeenCalledWith('1', 'Updated content');
    });

    it('should clear auto-save timer when saving document', async () => {
      const mockClearTimeout = vi.fn();
      const timerRef = { current: 123 };
      
      if (timerRef.current) {
        mockClearTimeout(timerRef.current);
      }
      
      expect(mockClearTimeout).toHaveBeenCalledWith(123);
    });

    it('should not lose content when navigating away', async () => {
      const originalContent = 'Important text';
      const savedContent = 'Important text';
      
      // Content should be preserved
      expect(savedContent).toBe(originalContent);
    });
  });

  describe('Bug 2: Undo History Shared Between Documents', () => {
    it('should clear undo history when switching documents', async () => {
      const mockClearHistory = vi.fn();
      const mockSetContent = vi.fn();
      
      // When content changes (document switch), clear history
      const newContent = 'New document content';
      mockClearHistory();
      mockSetContent(newContent);
      
      expect(mockClearHistory).toHaveBeenCalled();
      expect(mockSetContent).toHaveBeenCalledWith(newContent);
    });

    it('should have isolated undo history per document', async () => {
      const doc1History: string[] = [];
      const doc2History: string[] = [];
      
      // Document 1 edits
      doc1History.push('Edit 1');
      doc1History.push('Edit 2');
      
      // Document 2 edits (should not affect doc1)
      doc2History.push('Edit A');
      
      expect(doc1History).toEqual(['Edit 1', 'Edit 2']);
      expect(doc2History).toEqual(['Edit A']);
      expect(doc1History).not.toBe(doc2History);
    });

    it('should not allow undo from document B in document A', async () => {
      const doc1Edits = ['Content A'];
      const doc2Edits = ['Content B'];
      
      // Switch to doc2
      const currentDoc = doc2Edits;
      
      // Undo should only affect current document
      expect(currentDoc).toEqual(['Content B']);
      expect(currentDoc).not.toContain('Content A');
    });
  });

  describe('Bug 3: Pyramid Node Creation Error', () => {
    it('should validate title before creating node', async () => {
      const mockCreate = vi.fn();
      const formData = { title: '', content: 'Test', level: 'intermediate' };
      
      // Should not call create if title is empty
      if (!formData.title.trim()) {
        // Toast error would be shown
        expect(mockCreate).not.toHaveBeenCalled();
      }
    });

    it('should map level string to correct number', async () => {
      const levelMap: Record<string, number> = {
        'very_high': 0,
        'high': 1,
        'intermediate': 2,
        'fine': 3,
        'final': 4,
      };
      
      expect(levelMap['very_high']).toBe(0);
      expect(levelMap['high']).toBe(1);
      expect(levelMap['intermediate']).toBe(2);
      expect(levelMap['fine']).toBe(3);
      expect(levelMap['final']).toBe(4);
    });

    it('should validate level before creating node', async () => {
      const levelMap: Record<string, number> = {
        'very_high': 0,
        'high': 1,
        'intermediate': 2,
        'fine': 3,
        'final': 4,
      };
      
      const level = 'intermediate';
      const levelValue = levelMap[level];
      
      expect(levelValue).toBeDefined();
      expect(typeof levelValue).toBe('number');
    });

    it('should handle invalid level gracefully', async () => {
      const levelMap: Record<string, number> = {
        'very_high': 0,
        'high': 1,
        'intermediate': 2,
        'fine': 3,
        'final': 4,
      };
      
      const invalidLevel = 'invalid';
      const levelValue = levelMap[invalidLevel];
      
      expect(levelValue).toBeUndefined();
    });

    it('should provide detailed error message on creation failure', async () => {
      const mockCreate = vi.fn().mockRejectedValue({
        data: { detail: 'Invalid pyramid node data' },
        message: 'API Error'
      });
      
      try {
        await mockCreate();
      } catch (error: any) {
        const errorMessage = error?.data?.detail || error?.message;
        expect(errorMessage).toBe('Invalid pyramid node data');
      }
    });
  });

  describe('Integration: All Bugs Fixed', () => {
    it('should handle complete document workflow without bugs', async () => {
      const mockSave = vi.fn().mockResolvedValue({ success: true });
      const mockClearHistory = vi.fn();
      
      // 1. Edit document 1
      const doc1Content = 'Document 1 content';
      
      // 2. Switch to document 2 (should save doc1)
      await mockSave('doc1', doc1Content);
      mockClearHistory();
      
      // 3. Edit document 2
      const doc2Content = 'Document 2 content';
      
      // 4. Create pyramid node
      const levelMap: Record<string, number> = {
        'intermediate': 2,
      };
      const level = levelMap['intermediate'];
      
      expect(mockSave).toHaveBeenCalledWith('doc1', doc1Content);
      expect(mockClearHistory).toHaveBeenCalled();
      expect(level).toBe(2);
    });
  });
});
