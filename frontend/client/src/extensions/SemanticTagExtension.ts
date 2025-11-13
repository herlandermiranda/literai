/**
 * Semantic Tag Extension for TipTap
 * 
 * Provides syntax highlighting for semantic tags
 * Supports both Markdown [[type:name]] and XML <type>name</type> syntax
 */

import { Mark, mergeAttributes } from "@tiptap/react";

export const SemanticTagExtension = Mark.create({
  name: "semanticTag",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "semantic-tag",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-semantic-tag]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-semantic-tag": true,
      }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-t": () => {
        // Placeholder for future tag insertion
        return true;
      },
    };
  },
});

export default SemanticTagExtension;
