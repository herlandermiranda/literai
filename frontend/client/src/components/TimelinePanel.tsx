/**
 * Panel for managing timeline events
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { timelineAPI, TimelineEvent, TimelineEventCreate } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelinePanelProps {
  projectId: string;
}

export default function TimelinePanel({ projectId }: TimelinePanelProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");

  useEffect(() => {
    loadEvents();
  }, [projectId]);

  const loadEvents = async () => {
    try {
      const data = await timelineAPI.list(projectId);
      setEvents(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement de la timeline");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormTitle("");
    setFormDescription("");
    setFormDate("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || "");
    setFormDate(event.date || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    try {
      if (editingEvent) {
        // Update existing event
        const updated = await timelineAPI.update(editingEvent.id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          date: formDate.trim() || undefined,
        });
        setEvents(events.map((e) => (e.id === editingEvent.id ? updated : e)));
        toast.success("Événement mis à jour");
      } else {
        // Create new event
        const newEvent = await timelineAPI.create(projectId, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          date: formDate.trim() || undefined,
          order_index: events.length,
        });
        setEvents([...events, newEvent]);
        toast.success("Événement créé");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    try {
      await timelineAPI.delete(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
      toast.success("Événement supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="text-muted-foreground">
            Organisez chronologiquement les événements de votre histoire
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Modifier l'événement" : "Créer un nouvel événement"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? "Modifiez les informations de l'événement"
                  : "Ajoutez un nouvel événement à la chronologie"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Titre *</Label>
                <Input
                  id="event-title"
                  placeholder="La bataille décisive"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Date (optionnel)</Label>
                <Input
                  id="event-date"
                  placeholder="Année 1250, Printemps, 15 mars 2024..."
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format libre : date fictive, historique, ou réelle
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Description de l'événement..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {editingEvent ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline View */}
      {events.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier événement
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un événement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-primary border-4 border-background" />

                <Card className="hover:shadow-md transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {event.date && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{event.date}</span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                        {event.description && (
                          <CardDescription className="line-clamp-3 mt-2">
                            {event.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(event)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
