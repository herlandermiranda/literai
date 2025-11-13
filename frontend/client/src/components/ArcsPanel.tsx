/**
 * Panel for managing narrative arcs
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { arcsAPI, Arc, ArcCreate } from "@/lib/api";
import { ARC_COLORS } from "@/const";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArcsPanelProps {
  projectId: string;
}

export default function ArcsPanel({ projectId }: ArcsPanelProps) {
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArc, setEditingArc] = useState<Arc | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState<string>(ARC_COLORS[0]);

  useEffect(() => {
    loadArcs();
  }, [projectId]);

  const loadArcs = async () => {
    try {
      const data = await arcsAPI.list(projectId);
      setArcs(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des arcs narratifs");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingArc(null);
    setFormName("");
    setFormDescription("");
    setFormColor(ARC_COLORS[0]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (arc: Arc) => {
    setEditingArc(arc);
    setFormName(arc.name);
    setFormDescription(arc.description || "");
    setFormColor(arc.color || ARC_COLORS[0]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    try {
      if (editingArc) {
        // Update existing arc
        const updated = await arcsAPI.update(editingArc.id, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
        });
        setArcs(arcs.map((a) => (a.id === editingArc.id ? updated : a)));
        toast.success("Arc narratif mis à jour");
      } else {
        // Create new arc
        const newArc = await arcsAPI.create(projectId, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
        });
        setArcs([...arcs, newArc]);
        toast.success("Arc narratif créé");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (arcId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet arc narratif ?")) {
      return;
    }

    try {
      await arcsAPI.delete(arcId);
      setArcs(arcs.filter((a) => a.id !== arcId));
      toast.success("Arc narratif supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Arcs Narratifs</h2>
          <p className="text-muted-foreground">
            Organisez les différentes intrigues et fils narratifs de votre histoire
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Arc
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArc ? "Modifier l'arc narratif" : "Créer un nouvel arc narratif"}
              </DialogTitle>
              <DialogDescription>
                {editingArc
                  ? "Modifiez les informations de l'arc narratif"
                  : "Ajoutez un nouveau fil narratif à votre histoire"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="arc-name">Nom *</Label>
                <Input
                  id="arc-name"
                  placeholder="L'arc du héros"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arc-description">Description</Label>
                <Textarea
                  id="arc-description"
                  placeholder="Description de l'arc narratif..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="grid grid-cols-9 gap-2">
                  {ARC_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        formColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {editingArc ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Arcs List */}
      {arcs.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun arc narratif</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier arc narratif
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un arc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {arcs.map((arc) => (
            <Card key={arc.id} className="hover:shadow-md transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: arc.color || ARC_COLORS[0] }}
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-1">{arc.name}</CardTitle>
                      {arc.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {arc.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(arc)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(arc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
