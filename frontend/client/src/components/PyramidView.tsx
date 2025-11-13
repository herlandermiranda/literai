import React, { useState, useEffect, useRef } from 'react';
import { Tree, NodeRendererProps } from 'react-arborist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  History,
} from 'lucide-react';
import VersionHistoryPanel from './VersionHistoryPanel';
import { llmAPI, pyramidAPI, type PyramidNode } from '@/lib/api';

interface PyramidViewProps {
  projectId: string;
}

const LEVEL_LABELS: Record<string, string> = {
  very_high: 'Très haut niveau',
  high: 'Haut niveau',
  intermediate: 'Intermédiaire',
  fine: 'Fin',
  final: 'Final',
};

const LEVEL_COLORS: Record<string, string> = {
  very_high: 'bg-purple-100 text-purple-800 border-purple-300',
  high: 'bg-blue-100 text-blue-800 border-blue-300',
  intermediate: 'bg-green-100 text-green-800 border-green-300',
  fine: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  final: 'bg-red-100 text-red-800 border-red-300',
};

interface TreeNode {
  id: string;
  project_id: string;
  parent_id: string | null;
  level: string;
  order_index: number;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  is_generated: boolean;
  generation_prompt: string | null;
  coherence_score: number | null;
  coherence_issues: any[];
  created_at: string;
  updated_at: string;
  children?: TreeNode[];
}

export default function PyramidView({ projectId }: PyramidViewProps) {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDownwardOpen, setIsGenerateDownwardOpen] = useState(false);
  const [isGenerateUpwardOpen, setIsGenerateUpwardOpen] = useState(false);
  const [isCoherenceCheckOpen, setIsCoherenceCheckOpen] = useState(false);
  const [coherenceResult, setCoherenceResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedNodeForHistory, setSelectedNodeForHistory] = useState<TreeNode | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    level: 'intermediate' as string,
    parent_id: null as string | null,
  });
  
  const [generateDownwardData, setGenerateDownwardData] = useState({
    target_level: 'fine' as string,
    count: 3,
    context: '',
  });
  
  const treeRef = useRef<any>(null);

  useEffect(() => {
    loadNodes();
  }, [projectId]);

  const loadNodes = async () => {
    try {
      setLoading(true);
      const data = await pyramidAPI.getTree(projectId);
      setNodes(data);
    } catch (error) {
      console.error('Error loading pyramid nodes:', error);
      toast.error('Erreur lors du chargement de la pyramide');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validate form data
      if (!formData.title.trim()) {
        toast.error('Le titre est requis');
        return;
      }
      
      // Convert level string to int
      const levelMap: Record<string, number> = {
        'very_high': 0,
        'high': 1,
        'intermediate': 2,
        'fine': 3,
        'final': 4,
      };
      
      const levelValue = levelMap[formData.level];
      if (levelValue === undefined) {
        toast.error('Niveau invalide');
        return;
      }
      
      await pyramidAPI.create(projectId, {
        title: formData.title.trim(),
        content: formData.content,
        level: levelValue,
        order: 0,
        parent_id: formData.parent_id || undefined,
      });
      toast.success('Nœud créé avec succès');
      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        content: '',
        summary: '',
        level: 'intermediate',
        parent_id: null,
      });
      await loadNodes();
    } catch (error: any) {
      console.error('Error creating node:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Erreur lors de la création du nœud';
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async (node: TreeNode) => {
    try {
      if (!node.title.trim()) {
        toast.error('Le titre est requis');
        return;
      }
      
      await pyramidAPI.update(projectId, node.id, {
        title: node.title.trim(),
        content: node.content,
        summary: node.summary,
        level: node.level,
        tags: node.tags || [],
      });
      toast.success('Nœud mis à jour');
      setEditingNode(null);
      await loadNodes();
    } catch (error: any) {
      console.error('Error updating node:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (nodeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce nœud et tous ses enfants ?')) {
      return;
    }
    
    try {
      await pyramidAPI.delete(projectId, nodeId);
      toast.success('Nœud supprimé');
      await loadNodes();
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleGenerateDownward = async () => {
    if (!selectedNode) return;
    
    try {
      const result = await pyramidAPI.generateDownward(projectId, {
        parent_id: selectedNode.id,
        target_level: generateDownwardData.target_level,
        count: generateDownwardData.count,
        context: generateDownwardData.context || undefined,
      });
      
      toast.success(`${result.nodes.length} nœuds générés avec succès`);
      setIsGenerateDownwardOpen(false);
      setGenerateDownwardData({
        target_level: 'fine',
        count: 3,
        context: '',
      });
      await loadNodes();
    } catch (error) {
      console.error('Error generating downward:', error);
      toast.error('Erreur lors de la génération descendante');
    }
  };

  const handleCheckCoherence = async () => {
    try {
      const result = await pyramidAPI.checkCoherence(projectId, {
        node_id: selectedNode?.id,
        check_children: true,
      });
      
      setCoherenceResult(result);
      setIsCoherenceCheckOpen(true);
      
      if (result.issues_found === 0) {
        toast.success('Aucun problème de cohérence détecté');
      } else {
        toast.warning(`${result.issues_found} problème(s) de cohérence détecté(s)`);
      }
    } catch (error) {
      console.error('Error checking coherence:', error);
      toast.error('Erreur lors de la vérification de cohérence');
    }
  };

  const Node = ({ node, style, dragHandle }: NodeRendererProps<TreeNode>) => {
    const isSelected = selectedNode?.id === node.data.id;
    const hasCoherenceIssues = node.data.coherence_score && node.data.coherence_score < 80;
    
    return (
      <div
        style={style}
        ref={dragHandle}
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-accent ${
          isSelected ? 'bg-accent' : ''
        }`}
        onClick={() => setSelectedNode(node.data)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            node.toggle();
          }}
          className="p-1 hover:bg-muted rounded"
        >
          {node.isInternal ? (
            node.isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>
        
        <Badge variant="outline" className={`${LEVEL_COLORS[node.data.level]} text-xs`}>
          {LEVEL_LABELS[node.data.level]}
        </Badge>
        
        <span className="flex-1 truncate">{node.data.title}</span>
        
        {node.data.is_generated && (
          <Sparkles className="w-4 h-4 text-purple-500" />
        )}
        
        {hasCoherenceIssues && (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
        
        {node.data.coherence_score && node.data.coherence_score >= 80 && (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
      </div>
    );
  };

  const buildTree = (nodes: PyramidNode[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];
    
    // First pass: create all nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });
    
    // Second pass: build tree structure
    nodes.forEach(node => {
      const treeNode = nodeMap.get(node.id)!;
      if (node.parent_id) {
        const parent = nodeMap.get(node.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(treeNode);
        } else {
          roots.push(treeNode);
        }
      } else {
        roots.push(treeNode);
      }
    });
    
    // Sort children by order_index
    const sortChildren = (node: TreeNode) => {
      if (node.children) {
        node.children.sort((a, b) => a.order_index - b.order_index);
        node.children.forEach(sortChildren);
      }
    };
    roots.forEach(sortChildren);
    
    return roots;
  };

  const treeData = buildTree(nodes);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement de la pyramide...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2 md:gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
        <Button
          onClick={() => {
            setFormData({ ...formData, parent_id: selectedNode?.id || null });
            setIsCreateDialogOpen(true);
          }}
          size="sm"
          className="text-xs md:text-sm"
        >
          <Plus className="w-3 md:w-4 h-3 md:h-4" />
          <span className="hidden md:inline ml-2">Nouveau nœud</span>
          <span className="md:hidden ml-1">Nouveau</span>
        </Button>
        
        {selectedNode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingNode(selectedNode)}
              className="text-xs md:text-sm"
            >
              <Edit className="w-3 md:w-4 h-3 md:h-4" />
              <span className="hidden md:inline ml-2">Éditer</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateDownwardOpen(true)}
              className="text-xs md:text-sm"
            >
              <ArrowDown className="w-3 md:w-4 h-3 md:h-4" />
              <span className="hidden md:inline ml-2">Développer</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedNodeForHistory(selectedNode);
                setShowHistory(true);
              }}
              className="text-xs md:text-sm"
            >
              <History className="w-3 md:w-4 h-3 md:h-4" />
              <span className="hidden md:inline ml-2">Historique</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckCoherence}
              className="text-xs md:text-sm"
            >
              <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4" />
              <span className="hidden md:inline ml-2">Vérifier</span>
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(selectedNode.id)}
              className="text-xs md:text-sm"
            >
              <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
              <span className="hidden md:inline ml-2">Supprimer</span>
            </Button>
          </>
        )}
      </div>

      {/* Tree View */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        {treeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <p>Aucun nœud dans la pyramide</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier nœud
            </Button>
          </div>
        ) : (
          <Tree
            ref={treeRef}
            data={treeData}
            openByDefault={false}
            width="100%"
            height={600}
            indent={24}
            rowHeight={36}
            overscanCount={1}
            paddingTop={8}
            paddingBottom={8}
          >
            {Node}
          </Tree>
        )}
      </div>

      {/* Selected Node Details */}
      {selectedNode && !editingNode && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{selectedNode.title}</h3>
            <Badge variant="outline" className={LEVEL_COLORS[selectedNode.level]}>
              {LEVEL_LABELS[selectedNode.level]}
            </Badge>
          </div>
          
          {selectedNode.summary && (
            <p className="text-sm text-muted-foreground italic">{selectedNode.summary}</p>
          )}
          
          <p className="text-sm whitespace-pre-wrap">{selectedNode.content}</p>
          
          {selectedNode.tags && selectedNode.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedNode.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
          
          {selectedNode.coherence_score !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Score de cohérence:</span>
              <Badge variant={selectedNode.coherence_score >= 80 ? 'default' : 'destructive'}>
                {selectedNode.coherence_score}/100
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Edit Node Dialog */}
      {editingNode && (
        <Dialog open={true} onOpenChange={() => setEditingNode(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Éditer le nœud</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Niveau</label>
                <Select
                  value={editingNode.level}
                  onValueChange={(value) => setEditingNode({ ...editingNode, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Résumé (optionnel)</label>
                <Input
                  value={editingNode.summary || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, summary: e.target.value })}
                  placeholder="Résumé en 1-2 phrases"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Contenu</label>
                <Textarea
                  value={editingNode.content}
                  onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNode(null)}>
                Annuler
              </Button>
              <Button onClick={() => handleUpdate(editingNode)}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Node Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau nœud</DialogTitle>
            <DialogDescription>
              {formData.parent_id ? `Nœud enfant de: ${selectedNode?.title}` : 'Nœud racine'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre du nœud"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Niveau</label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Résumé (optionnel)</label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Résumé en 1-2 phrases"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Contenu</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                placeholder="Contenu détaillé du nœud"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Downward Dialog */}
      <Dialog open={isGenerateDownwardOpen} onOpenChange={setIsGenerateDownwardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Développer avec l'IA</DialogTitle>
            <DialogDescription>
              Générer des nœuds enfants plus détaillés à partir de: {selectedNode?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Niveau cible</label>
              <Select
                value={generateDownwardData.target_level}
                onValueChange={(value) => setGenerateDownwardData({ ...generateDownwardData, target_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Nombre de nœuds</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={generateDownwardData.count}
                onChange={(e) => setGenerateDownwardData({ ...generateDownwardData, count: parseInt(e.target.value) || 3 })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Instructions additionnelles (optionnel)</label>
              <Textarea
                value={generateDownwardData.context}
                onChange={(e) => setGenerateDownwardData({ ...generateDownwardData, context: e.target.value })}
                rows={4}
                placeholder="Ajoutez des instructions pour guider l'IA..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDownwardOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerateDownward}>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coherence Check Dialog */}
      <Dialog open={isCoherenceCheckOpen} onOpenChange={setIsCoherenceCheckOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Résultats de la vérification de cohérence</DialogTitle>
          </DialogHeader>
          
          {coherenceResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Nœuds vérifiés: {coherenceResult.checked_nodes}
                </div>
                <div className="text-sm text-muted-foreground">
                  Problèmes trouvés: {coherenceResult.issues_found}
                </div>
              </div>
              
              {coherenceResult.issues && coherenceResult.issues.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Problèmes détectés:</h4>
                  <div className="space-y-2">
                    {coherenceResult.issues.map((issue: any, i: number) => (
                      <div key={i} className="border rounded p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline">{issue.type}</Badge>
                        </div>
                        <p className="text-sm">{issue.description}</p>
                        <p className="text-xs text-muted-foreground">Localisation: {issue.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {coherenceResult.suggestions && coherenceResult.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Suggestions d'amélioration:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {coherenceResult.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {coherenceResult.issues_found === 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Aucun problème de cohérence détecté !</span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsCoherenceCheckOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Historique des Versions - {selectedNodeForHistory?.title}</DialogTitle>
          </DialogHeader>
          {selectedNodeForHistory && (
            <VersionHistoryPanel
              nodeId={selectedNodeForHistory.id}
              currentContent={selectedNodeForHistory.content}
              currentTitle={selectedNodeForHistory.title}
              onRestore={(version) => {
                // Reload the tree after restore
                loadNodes();
                setShowHistory(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
