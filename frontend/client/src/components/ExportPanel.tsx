/**
 * Export Panel Component
 * Provides interface for exporting projects to multiple formats with preview
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Download, Eye, FileText, BookOpen, FileCode, FileSpreadsheet } from "lucide-react";
import { DOCUMENT_TYPES } from "@/const";

interface ExportPanelProps {
  projectId: string;
}

interface ExportOptions {
  include_levels?: string[];
  preserve_metadata: boolean;
  polish_with_llm: boolean;
  title?: string;
  author?: string;
}

export default function ExportPanel({ projectId }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  
  // Export options
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [preserveMetadata, setPreserveMetadata] = useState(false);
  const [polishWithLLM, setPolishWithLLM] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  
  const exportFormats = [
    { value: "pdf", label: "PDF", icon: FileText, description: "Format universel pour impression et lecture" },
    { value: "epub", label: "ePub", icon: BookOpen, description: "Format pour liseuses électroniques" },
    { value: "docx", label: "Word (DOCX)", icon: FileText, description: "Format Microsoft Word" },
    { value: "markdown", label: "Markdown", icon: FileCode, description: "Format texte avec balisage léger" },
    { value: "rtf", label: "RTF", icon: FileText, description: "Format texte enrichi universel" },
    { value: "csv", label: "CSV (Scrivener)", icon: FileSpreadsheet, description: "Format compatible Scrivener" },
  ];
  
  const getExportOptions = (): ExportOptions => {
    return {
      include_levels: selectedLevels.length > 0 ? selectedLevels : undefined,
      preserve_metadata: preserveMetadata,
      polish_with_llm: polishWithLLM,
      title: customTitle || undefined,
      author: customAuthor || undefined,
    };
  };
  
  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const options = getExportOptions();
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/export/preview/${projectId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(options),
        }
      );
      
      if (!response.ok) {
        throw new Error("Échec de la génération du preview");
      }
      
      const data = await response.json();
      setPreviewContent(data.preview);
      setShowPreview(true);
    } catch (error: any) {
      toast.error("Erreur lors de la génération du preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };
  
  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      const options = getExportOptions();
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/export/${projectId}/${format}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(options),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Échec de l'export ${format.toUpperCase()}`);
      }
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project_${projectId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Export ${format.toUpperCase()} réussi !`);
    } catch (error: any) {
      toast.error(`Erreur lors de l'export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Options d'Export</CardTitle>
          <CardDescription>
            Configurez les options pour personnaliser votre export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Title and Author */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre personnalisé (optionnel)</Label>
              <Input
                id="title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Titre du projet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Auteur (optionnel)</Label>
              <Input
                id="author"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                placeholder="Nom de l'auteur"
              />
            </div>
          </div>
          
          {/* Document Types Filter */}
          <div className="space-y-2">
            <Label>Types de documents à inclure</Label>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={selectedLevels.includes(type.value)}
                    onCheckedChange={() => toggleLevel(type.value)}
                  />
                  <label
                    htmlFor={`type-${type.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedLevels.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Tous les types seront inclus par défaut
              </p>
            )}
          </div>
          
          {/* Advanced Options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={preserveMetadata}
                onCheckedChange={(checked) => setPreserveMetadata(checked as boolean)}
              />
              <label
                htmlFor="metadata"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Préserver les métadonnées
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="polish"
                checked={polishWithLLM}
                onCheckedChange={(checked) => setPolishWithLLM(checked as boolean)}
              />
              <label
                htmlFor="polish"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Améliorer avec l'IA avant export (plus lent)
              </label>
            </div>
          </div>
          
          {/* Preview Button */}
          <Button
            onClick={handlePreview}
            variant="outline"
            className="w-full"
            disabled={isPreviewLoading}
          >
            {isPreviewLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Prévisualiser
          </Button>
        </CardContent>
      </Card>
      
      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Formats d'Export</CardTitle>
          <CardDescription>
            Choisissez le format de fichier pour votre export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <Card key={format.value} className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">{format.label}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {format.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() => handleExport(format.value)}
                      disabled={isExporting}
                      size="sm"
                      className="w-full"
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Exporter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l'Export</DialogTitle>
            <DialogDescription>
              Aperçu du contenu qui sera exporté (format Markdown)
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg overflow-x-auto">
              {previewContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
