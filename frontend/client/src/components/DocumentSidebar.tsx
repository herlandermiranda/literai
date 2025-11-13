/**
 * Sidebar component for document navigation
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Document } from "@/lib/api";
import { FileText, FolderOpen, Folder, Plus, Trash2, Edit2, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentSidebarProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (documentId: string) => void;
  onCreateDocument: (parentId?: string) => void;
  onDeleteDocument: (documentId: string) => void;
  onRenameDocument: (documentId: string, newTitle: string) => void;
}

export default function DocumentSidebar({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onRenameDocument,
}: DocumentSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Build document tree
  const rootDocuments = documents.filter((doc) => !doc.parent_id);
  const getChildren = (parentId: string) =>
    documents.filter((doc) => doc.parent_id === parentId).sort((a, b) => a.order_index - b.order_index);

  const toggleFolder = (documentId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(documentId)) {
      newExpanded.delete(documentId);
    } else {
      newExpanded.add(documentId);
    }
    setExpandedFolders(newExpanded);
  };

  const startRename = (document: Document) => {
    setEditingDocumentId(document.id);
    setEditingTitle(document.title);
  };

  const finishRename = () => {
    if (editingDocumentId && editingTitle.trim()) {
      onRenameDocument(editingDocumentId, editingTitle.trim());
    }
    setEditingDocumentId(null);
    setEditingTitle("");
  };

  const renderDocument = (document: Document, level = 0) => {
    const children = getChildren(document.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders.has(document.id);
    const isSelected = selectedDocumentId === document.id;
    const isEditing = editingDocumentId === document.id;

    return (
      <div key={document.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent group",
                isSelected && "bg-accent",
                level > 0 && `ml-${level * 4}`
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => !isEditing && onSelectDocument(document.id)}
            >
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(document.id);
                  }}
                  className="hover:bg-muted rounded p-0.5"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-5" />}
              
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-primary shrink-0" />
                )
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              )}

              {isEditing ? (
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") finishRename();
                    if (e.key === "Escape") {
                      setEditingDocumentId(null);
                      setEditingTitle("");
                    }
                  }}
                  className="h-6 px-1 text-sm"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm truncate flex-1">{document.title}</span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onCreateDocument(document.id)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau document
            </ContextMenuItem>
            <ContextMenuItem onClick={() => startRename(document)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Renommer
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onDeleteDocument(document.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderDocument(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-4 border-b">
        <Button
          onClick={() => onCreateDocument()}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Document
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {rootDocuments.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Aucun document
            </div>
          ) : (
            rootDocuments.map((doc) => renderDocument(doc))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
