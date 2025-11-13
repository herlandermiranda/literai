/**
 * Panel for managing entities (characters, locations, objects, etc.)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { entitiesAPI, Entity, EntityCreate } from "@/lib/api";
import { ENTITY_TYPES } from "@/const";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, User, MapPin, Package, Lightbulb, Building, Calendar } from "lucide-react";

interface EntitiesPanelProps {
  projectId: string;
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case "character":
      return <User className="w-4 h-4" />;
    case "location":
      return <MapPin className="w-4 h-4" />;
    case "object":
      return <Package className="w-4 h-4" />;
    case "concept":
      return <Lightbulb className="w-4 h-4" />;
    case "organization":
      return <Building className="w-4 h-4" />;
    case "event":
      return <Calendar className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

export default function EntitiesPanel({ projectId }: EntitiesPanelProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("character");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    loadEntities();
  }, [projectId]);

  const loadEntities = async () => {
    try {
      const data = await entitiesAPI.list(projectId);
      setEntities(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des entités");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEntity(null);
    setFormName("");
    setFormType("character");
    setFormDescription("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (entity: Entity) => {
    setEditingEntity(entity);
    setFormName(entity.name);
    setFormType(entity.type);
    setFormDescription(entity.description || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    try {
      if (editingEntity) {
        // Update existing entity
        const updated = await entitiesAPI.update(editingEntity.id, {
          name: formName.trim(),
          type: formType,
          description: formDescription.trim() || undefined,
        });
        setEntities(entities.map((e) => (e.id === editingEntity.id ? updated : e)));
        toast.success("Entité mise à jour");
      } else {
        // Create new entity
        const newEntity = await entitiesAPI.create(projectId, {
          name: formName.trim(),
          type: formType,
          description: formDescription.trim() || undefined,
        });
        setEntities([...entities, newEntity]);
        toast.success("Entité créée");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (entityId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entité ?")) {
      return;
    }

    try {
      await entitiesAPI.delete(entityId);
      setEntities(entities.filter((e) => e.id !== entityId));
      toast.success("Entité supprimée");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredEntities = selectedType === "all"
    ? entities
    : entities.filter((e) => e.type === selectedType);

  const entitiesByType = ENTITY_TYPES.map((type) => ({
    ...type,
    count: entities.filter((e) => e.type === type.value).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entités</h2>
          <p className="text-muted-foreground">
            Gérez les personnages, lieux, objets et concepts de votre histoire
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Entité
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEntity ? "Modifier l'entité" : "Créer une nouvelle entité"}
              </DialogTitle>
              <DialogDescription>
                {editingEntity
                  ? "Modifiez les informations de l'entité"
                  : "Ajoutez un nouveau personnage, lieu, objet ou concept"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="entity-name">Nom *</Label>
                <Input
                  id="entity-name"
                  placeholder="Jean Dupont"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity-type">Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger id="entity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity-description">Description</Label>
                <Textarea
                  id="entity-description"
                  placeholder="Description détaillée de l'entité..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {editingEntity ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">
            Tous ({entities.length})
          </TabsTrigger>
          {entitiesByType.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label} ({type.count})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Entities Grid */}
      {filteredEntities.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              {getEntityIcon(selectedType === "all" ? "character" : selectedType)}
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune entité</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première entité
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une entité
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <Card key={entity.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getEntityIcon(entity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-1">{entity.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {ENTITY_TYPES.find((t) => t.value === entity.type)?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(entity)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(entity.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {entity.description && (
                <CardContent>
                  <CardDescription className="line-clamp-3">
                    {entity.description}
                  </CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
