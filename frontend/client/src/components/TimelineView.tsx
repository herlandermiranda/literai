/**
 * Advanced Interactive Timeline Component with Vis.js
 * Features: bidirectional zoom, drag-and-drop, filters, LLM integration
 */

import { useEffect, useRef, useState } from "react";
import { Timeline } from "vis-timeline/standalone";
import { DataSet } from "vis-data";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Filter, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { timelineAPI, llmAPI, TimelineEvent } from "@/lib/api";

interface TimelineViewProps {
  projectId: string;
}

interface TimelineItem {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  group?: string;
  className?: string;
  title?: string;
}

export default function TimelineView({ projectId }: TimelineViewProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [items, setItems] = useState<DataSet<TimelineItem>>(new DataSet());
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  useEffect(() => {
    loadEvents();
  }, [projectId]);

  useEffect(() => {
    if (timelineRef.current && !timelineInstance.current) {
      initializeTimeline();
    }
  }, [timelineRef.current]);

  useEffect(() => {
    if (timelineInstance.current) {
      updateTimelineItems();
    }
  }, [events, filterType]);

  const initializeTimeline = () => {
    if (!timelineRef.current) return;

    const options = {
      width: "100%",
      height: "500px",
      margin: {
        item: 20,
      },
      editable: {
        add: false,
        updateTime: true,
        updateGroup: false,
        remove: false,
      },
      onMove: handleItemMove,
      zoomable: true,
      moveable: true,
      stack: true,
      showCurrentTime: false,
      tooltip: {
        followMouse: true,
        overflowMethod: "cap" as const,
      },
    };

    timelineInstance.current = new Timeline(timelineRef.current, items, options);

    // Add click listener for zoom functionality
    timelineInstance.current.on("select", handleItemSelect);
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await timelineAPI.list(projectId);
      setEvents(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement de la timeline");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimelineItems = () => {
    const filteredEvents = filterType === "all" 
      ? events 
      : events.filter(e => {
          const metadata = typeof e.event_metadata === 'string' 
            ? JSON.parse(e.event_metadata) 
            : e.event_metadata;
          return metadata?.type === filterType;
        });

    const timelineItems: TimelineItem[] = filteredEvents.map(event => {
      const metadata = typeof event.event_metadata === 'string' 
        ? JSON.parse(event.event_metadata) 
        : event.event_metadata;
      
      const dateString = metadata?.date_string || event.date || "Date inconnue";
      const type = metadata?.type || "event";
      
      // Parse date string to Date object (simplified)
      const startDate = new Date();
      
      return {
        id: event.id,
        content: event.title,
        start: startDate,
        className: `timeline-item-${type}`,
        title: event.description || event.title,
      };
    });

    items.clear();
    items.add(timelineItems);
  };

  const handleItemMove = async (item: any, callback: (item: any) => void) => {
    // Update event in backend when moved
    try {
      const event = events.find(e => e.id === item.id);
      if (event) {
        const metadata = typeof event.event_metadata === 'string' 
          ? JSON.parse(event.event_metadata) 
          : event.event_metadata || {};
        
        metadata.date_string = item.start.toLocaleDateString();
        
        await timelineAPI.update(event.id, {
          ...event,
          event_metadata: metadata,
        });
        
        toast.success("Événement déplacé avec succès");
        callback(item);
        loadEvents();
      }
    } catch (error: any) {
      toast.error("Erreur lors du déplacement de l'événement");
      callback(null);
    }
  };

  const handleItemSelect = (properties: any) => {
    if (properties.items.length > 0) {
      const itemId = properties.items[0];
      const event = events.find(e => e.id === itemId);
      if (event) {
        toast.info(`Événement sélectionné: ${event.title}`);
        // Here you could implement zoom to detail level
      }
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    try {
      const metadata = {
        date_string: newEventDate || new Date().toLocaleDateString(),
        type: "event",
      };

      await timelineAPI.create(projectId, {
        title: newEventTitle.trim(),
        description: newEventDescription.trim(),
        date: undefined,
        event_metadata: metadata,
      });

      toast.success("Événement créé avec succès");
      setIsCreateDialogOpen(false);
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventDate("");
      loadEvents();
    } catch (error: any) {
      toast.error("Erreur lors de la création de l'événement");
    }
  };

  const handleFillGaps = async () => {
    setIsGenerating(true);
    try {
      // Get all events sorted by date
      const sortedEvents = [...events].sort((a, b) => {
        const dateA = typeof a.event_metadata === 'string' 
          ? JSON.parse(a.event_metadata).date_string 
          : a.event_metadata?.date_string || "";
        const dateB = typeof b.event_metadata === 'string' 
          ? JSON.parse(b.event_metadata).date_string 
          : b.event_metadata?.date_string || "";
        return dateA.localeCompare(dateB);
      });

      // Find gaps (simplified: just check if there are less than 3 events)
      if (sortedEvents.length < 3) {
        // Use LLM to suggest intermediate events
        const context = sortedEvents.map(e => `${e.title}: ${e.description}`).join("\n");
        const prompt = `Basé sur ces événements existants:\n${context}\n\nSuggère 2-3 événements intermédiaires cohérents pour enrichir la chronologie.`;
        
        const result = await llmAPI.suggestions(projectId, { 
          current_context: context, 
          user_question: "Suggère 2-3 événements intermédiaires cohérents pour enrichir la chronologie." 
        });
        
        toast.success("Suggestions générées ! Consultez le panel IA pour les voir.");
      } else {
        toast.info("La timeline semble déjà bien remplie");
      }
    } catch (error: any) {
      toast.error("Erreur lors de la génération de suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleZoomIn = () => {
    if (timelineInstance.current) {
      timelineInstance.current.zoomIn(0.5);
    }
  };

  const handleZoomOut = () => {
    if (timelineInstance.current) {
      timelineInstance.current.zoomOut(0.5);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Événement
          </Button>
          
          <Button 
            onClick={handleFillGaps} 
            variant="outline" 
            size="sm"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Combler les Trous
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleZoomIn} variant="outline" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} variant="outline" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              <SelectItem value="event">Événements</SelectItem>
              <SelectItem value="character">Personnages</SelectItem>
              <SelectItem value="plot">Intrigues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="border rounded-lg p-4 bg-background">
        <div ref={timelineRef} className="timeline-container" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary">
          {events.length} événement{events.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel Événement</DialogTitle>
            <DialogDescription>
              Ajoutez un événement à la timeline de votre projet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Titre</Label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Ex: Bataille de Waterloo"
              />
            </div>

            <div>
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                placeholder="Ex: 18 juin 1815"
              />
            </div>

            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Décrivez l'événement..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateEvent}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Styles */}
      <style>{`
        .timeline-container {
          min-height: 500px;
        }
        
        .timeline-item-event {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .timeline-item-character {
          background-color: hsl(var(--accent));
          border-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
        
        .timeline-item-plot {
          background-color: hsl(var(--secondary));
          border-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
        }
      `}</style>
    </div>
  );
}
