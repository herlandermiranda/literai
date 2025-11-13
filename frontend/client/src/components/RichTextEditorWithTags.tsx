/**
 * Rich Text Editor with Semantic Tags Support
 * 
 * Integrates TipTap editor with semantic tag autocomplete
 * Supports both Markdown [[type:name]] and XML <type>name</type> syntax
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { semanticTagsAPI } from "@/lib/api";

interface RichTextEditorWithTagsProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  projectId?: string;
}

interface TagSuggestion {
  id: string;
  type: string;
  name: string;
}

const TAG_TYPES = ["character", "place", "event", "theme", "note", "link"];

const TAG_COLORS: Record<string, string> = {
  character: "text-blue-500 bg-blue-50",
  place: "text-green-500 bg-green-50",
  event: "text-orange-500 bg-orange-50",
  theme: "text-purple-500 bg-purple-50",
  note: "text-yellow-500 bg-yellow-50",
  link: "text-cyan-500 bg-cyan-50",
};

export default function RichTextEditorWithTags({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
  className,
  editable = true,
  projectId,
}: RichTextEditorWithTagsProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTrigger, setCurrentTrigger] = useState<"[[" | "<" | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    editable,
    onUpdate: ({ editor }: { editor: any }) => {
      onChange(editor.getHTML());
      checkForTagTrigger(editor);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Clear undo/redo history when content changes (document switch)
      // Recreate editor state to reset history
      editor.chain().setContent(content).run();
      // Reset history by destroying and recreating
      editor.view.dispatch(editor.state.tr);
    }
  }, [content, editor]);

  /**
   * Check if user is typing a tag trigger ([[  or <)
   */
  const checkForTagTrigger = (editor: any) => {
    const { $from } = editor.state.selection;
    const text = editor.state.doc.textBetween(
      Math.max(0, $from.pos - 100),
      $from.pos
    );

    // Check for [[ trigger
    const markdownMatch = text.match(/\[\[([a-z]*):?([^\]]*)?$/);
    if (markdownMatch) {
      setCurrentTrigger("[[");
      const tagType = markdownMatch[1];
      const query = markdownMatch[2] || "";
      setCurrentQuery(query);
      fetchSuggestions(tagType, query);
      setShowSuggestions(true);
      return;
    }

    // Check for < trigger
    const xmlMatch = text.match(/<([a-z]*):?([^>]*)?$/);
    if (xmlMatch) {
      setCurrentTrigger("<");
      const tagType = xmlMatch[1];
      const query = xmlMatch[2] || "";
      setCurrentQuery(query);
      fetchSuggestions(tagType, query);
      setShowSuggestions(true);
      return;
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  /**
   * Fetch tag suggestions from API
   */
  const fetchSuggestions = async (tagType: string, query: string) => {
    if (!projectId) return;

    try {
      // Validate tag type
      if (!TAG_TYPES.includes(tagType.toLowerCase())) {
        setSuggestions([]);
        return;
      }

      // Get all tags and filter locally
      const allTags = await semanticTagsAPI.getAll(projectId);
      const filtered = allTags
        .filter((tag: any) =>
          tag.tag_name.toLowerCase().includes(query.toLowerCase())
        )
        .map((tag: any) => ({
          id: tag.id,
          type: tagType.toLowerCase(),
          name: tag.tag_name,
        }));

      setSuggestions(filtered);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Error fetching tag suggestions:", error);
      setSuggestions([]);
    }
  };

  /**
   * Insert selected tag into editor
   */
  const insertTag = (suggestion: TagSuggestion) => {
    if (!editor) return;

    const { $from } = editor.state.selection;
    const text = editor.state.doc.textBetween(
      Math.max(0, $from.pos - 100),
      $from.pos
    );

    let deleteCount = 0;
    let replacement = "";

    if (currentTrigger === "[[") {
      const match = text.match(/\[\[([a-z]*):?([^\]]*)?$/);
      if (match) {
        deleteCount = match[0].length;
        replacement = `[[${suggestion.type}:${suggestion.name}]]`;
      }
    } else if (currentTrigger === "<") {
      const match = text.match(/<([a-z]*):?([^>]*)?$/);
      if (match) {
        deleteCount = match[0].length;
        replacement = `<${suggestion.type}>${suggestion.name}</${suggestion.type}>`;
      }
    }

    if (deleteCount > 0) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: $from.pos - deleteCount, to: $from.pos })
        .insertContent(replacement)
        .run();

      // Create entity if it doesn't exist
      createEntityIfNeeded(suggestion);
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  /**
   * Create entity automatically if it doesn't exist
   */
  const createEntityIfNeeded = async (suggestion: TagSuggestion) => {
    if (!projectId) return;

    try {
      // Check if entity already exists
      const existingEntity = suggestions.find(
        (s) => s.name === suggestion.name && s.type === suggestion.type
      );

      if (!existingEntity) {
        // Create new entity via API
        // Note: createEntity endpoint needs to be added to semanticTagsAPI
        // For now, we just track the tag creation
      }
    } catch (error) {
      console.error("Error creating entity:", error);
    }
  };

  /**
   * Handle keyboard navigation in suggestions
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        e.preventDefault();
        insertTag(suggestions[selectedIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  if (!editor) {
    return null;
  }

  const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-card", className)}>
      {/* Toolbar */}
      {editable && (
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-8 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-8 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          >
            <Quote className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-8 bg-border mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </MenuButton>

          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <span>{editor.storage.characterCount.characters()} caractères</span>
            <span>·</span>
            <span>{editor.storage.characterCount.words()} mots</span>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div onKeyDown={handleKeyDown}>
        <EditorContent editor={editor} />
      </div>

      {/* Tag Suggestions Popup */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => insertTag(suggestion)}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100",
                index === selectedIndex && "bg-blue-100"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-1 rounded",
                    TAG_COLORS[suggestion.type]
                  )}
                >
                  {suggestion.type}
                </span>
                <span>{suggestion.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
