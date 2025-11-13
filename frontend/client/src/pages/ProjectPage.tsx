/**
 * Main project page with document editor and sidebar
 */

import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { projectsAPI, documentsAPI, Project, Document, DocumentCreate } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, BookOpen, FileText, Users, GitBranch, Clock, Sparkles, Menu, X } from "lucide-react";
import { AUTO_SAVE_DELAY, DOCUMENT_TYPES } from "@/const";
import DocumentSidebar from "@/components/DocumentSidebar";
import RichTextEditorWithTags from "@/components/RichTextEditorWithTags";
import EntitiesPanel from "@/components/EntitiesPanel";
import ArcsPanel from "@/components/ArcsPanel";
import TimelinePanel from "@/components/TimelinePanel";
import TimelineView from "@/components/TimelineView";
import GraphView from "@/components/GraphView";
import ExportPanel from '@/components/ExportPanel';
import PyramidView from '@/components/PyramidView';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AIAssistantPanel from "@/components/AIAssistantPanel";

export default function ProjectPage() {
  const [, params] = useRoute("/project/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const projectId = params?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocumentParentId, setNewDocumentParentId] = useState<string | undefined>();

  // New document form
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("draft");

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Mobile state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadDocuments();
    }
  }, [projectId]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Save document when switching documents
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges && selectedDocument) {
        saveDocument();
      }
    };
  }, [selectedDocument?.id]);

  const loadProject = async () => {
    try {
      const data = await projectsAPI.get(projectId!);
      setProject(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement du projet");
      setLocation("/dashboard");
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await documentsAPI.list(projectId!);
      setDocuments(data);
      
      // Select first document if none selected
      if (data.length > 0 && !selectedDocument) {
        setSelectedDocument(data[0]);
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async (parentId?: string) => {
    setNewDocumentParentId(parentId);
    setIsCreateDialogOpen(true);
  };

  const submitCreateDocument = async () => {
    console.log("[DEBUG] submitCreateDocument called", { newDocTitle, newDocType, projectId });
    if (!newDocTitle.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    console.log("[DEBUG] Calling documentsAPI.create");
    try {
      const newDoc = await documentsAPI.create(projectId!, {
        title: newDocTitle.trim(),
        type: newDocType,
        parent_id: newDocumentParentId,
        content: "",
      });

      setDocuments([...documents, newDoc]);
      setSelectedDocument(newDoc);
      toast.success("Document créé");
      setIsCreateDialogOpen(false);
      setNewDocTitle("");
      setNewDocType("chapter");
      setNewDocumentParentId(undefined);
    } catch (error: any) {
      toast.error("Erreur lors de la création du document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    try {
      await documentsAPI.delete(documentId);
      setDocuments(documents.filter((d) => d.id !== documentId));
      
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(documents.find(d => d.id !== documentId) || null);
      }
      
      toast.success("Document supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression du document");
    }
  };

  const handleSelectDocument = (doc: Document) => {
    // Save current document before switching
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      setAutoSaveTimer(null);
    }
    if (hasUnsavedChanges && selectedDocument) {
      saveDocument();
    }
    setSelectedDocument(doc);
    setIsSidebarOpen(false);
  };

  const handleRenameDocument = async (documentId: string, newTitle: string) => {
    try {
      const updated = await documentsAPI.update(documentId, { title: newTitle });
      setDocuments(documents.map((d) => (d.id === documentId ? updated : d)));
      
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(prev => prev ? { ...prev, title: updated.title } : null);
      }
      
      toast.success("Document renommé");
    } catch (error: any) {
      toast.error("Erreur lors du renommage du document");
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    if (!selectedDocument) return;

    // Update local state
    setSelectedDocument(prev => prev ? { ...prev, content: newContent } : null);
    setHasUnsavedChanges(true);

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new auto-save timer
    const timer = setTimeout(() => {
      saveDocument(newContent);
    }, AUTO_SAVE_DELAY);

    setAutoSaveTimer(timer);
  }, [selectedDocument?.id, autoSaveTimer]);

  const saveDocument = async (content?: string) => {
    if (!selectedDocument) return;

    setIsSaving(true);
    try {
      const contentToSave = content !== undefined ? content : selectedDocument.content;
      await documentsAPI.update(selectedDocument.id, { content: contentToSave });
      
      // Update local state with saved content
      setSelectedDocument(prev => prev ? { ...prev, content: contentToSave } : null);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast.error("Erreur lors de la sauvegarde");
      console.error('[LiterAI] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      setAutoSaveTimer(null);
    }
    saveDocument();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline ml-2">Retour</span>
          </Button>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          )}
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
            <h1 className="text-sm md:text-lg font-semibold truncate">{project?.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">
              Modifications non sauvegardées
            </span>
          )}
          {isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile unless opened */}
        <div className={`${isMobile ? (isSidebarOpen ? 'fixed inset-0 top-16 z-30 w-64 bg-background border-r' : 'hidden') : 'w-64 shrink-0'}`}>
          <DocumentSidebar
            documents={documents}
            selectedDocumentId={selectedDocument?.id || null}
            onSelectDocument={(id) => {
              const doc = documents.find((d) => d.id === id);
              if (doc) handleSelectDocument(doc);
            }}
            onCreateDocument={handleCreateDocument}
            onDeleteDocument={handleDeleteDocument}
            onRenameDocument={handleRenameDocument}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <TabsList className="mx-2 md:mx-4 mt-2 md:mt-4 w-fit overflow-x-auto flex-wrap md:flex-nowrap">
              <TabsTrigger value="editor">
                <FileText className="w-4 h-4 mr-2" />
                Éditeur
              </TabsTrigger>
              <TabsTrigger value="entities">
                <Users className="w-4 h-4 mr-2" />
                Entités
              </TabsTrigger>
              <TabsTrigger value="arcs">
                <GitBranch className="w-4 h-4 mr-2" />
                Arcs Narratifs
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                Assistant IA
              </TabsTrigger>
              <TabsTrigger value="timeline-view">
                <Clock className="w-4 h-4 mr-2" />
                Timeline Interactive
              </TabsTrigger>
              <TabsTrigger value="graph">
                <GitBranch className="w-4 h-4 mr-2" />
                Graphe
              </TabsTrigger>
              <TabsTrigger value="export">
                <FileText className="w-4 h-4 mr-2" />
                Export
              </TabsTrigger>
              <TabsTrigger value="pyramid">
                <GitBranch className="w-4 h-4 mr-2" />
                Pyramide
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <FileText className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 overflow-auto p-4 mt-0">
              {selectedDocument ? (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">{selectedDocument.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Type: {DOCUMENT_TYPES.find((t) => t.value === selectedDocument.type)?.label || selectedDocument.type}
                    </p>
                  </div>
                  <RichTextEditorWithTags
                    content={selectedDocument.content}
                    onChange={handleContentChange}
                    projectId={projectId}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun document sélectionné</h3>
                    <p className="text-muted-foreground mb-4">
                      Sélectionnez un document dans la barre latérale ou créez-en un nouveau
                    </p>
                    <Button onClick={() => handleCreateDocument()}>
                      Créer un document
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="entities" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-6xl mx-auto">
                <EntitiesPanel projectId={projectId!} />
              </div>
            </TabsContent>

            <TabsContent value="arcs" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-4xl mx-auto">
                <ArcsPanel projectId={projectId!} />
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-4xl mx-auto">
                <TimelinePanel projectId={projectId!} />
              </div>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-4xl mx-auto">
                <AIAssistantPanel
                  projectId={projectId!}
                  currentDocumentContent={selectedDocument?.content}
                />
              </div>
            </TabsContent>

            <TabsContent value="timeline-view" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-6xl mx-auto">
                <TimelineView projectId={projectId!} />
              </div>
            </TabsContent>

            <TabsContent value="graph" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-6xl mx-auto">
                <GraphView projectId={projectId!} />
              </div>
            </TabsContent>

            <TabsContent value="export" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-4xl mx-auto">
                <ExportPanel projectId={projectId!} />
              </div>
            </TabsContent>
            
            <TabsContent value="pyramid" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-6xl mx-auto">
                <PyramidView projectId={projectId!} />
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="flex-1 overflow-auto mt-0">
              <AnalyticsDashboard projectId={projectId!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau document</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau document à votre projet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Titre *</Label>
              <Input
                id="doc-title"
                placeholder="Chapitre 1"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-type">Type</Label>
              <Select value={newDocType} onValueChange={setNewDocType}>
                <SelectTrigger id="doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={submitCreateDocument}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
