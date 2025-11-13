/**
 * Advanced Graph Visualization Component with Cytoscape.js
 * Features: force-directed layout, impact detection, interactive filters, LLM analysis
 */

import { useEffect, useRef, useState } from "react";
import cytoscape, { Core, ElementDefinition } from "cytoscape";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Download, Sparkles, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { entitiesAPI, arcsAPI, timelineAPI, llmAPI, Entity, Arc, TimelineEvent } from "@/lib/api";

interface GraphViewProps {
  projectId: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: "entity" | "arc" | "event";
  data: Entity | Arc | TimelineEvent;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  impact?: "positive" | "negative" | "neutral";
}

export default function GraphView({ projectId }: GraphViewProps) {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<Core | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, isolated: 0, loops: 0 });

  useEffect(() => {
    loadGraphData();
  }, [projectId]);

  useEffect(() => {
    if (cyRef.current && nodes.length > 0) {
      initializeGraph();
    }
  }, [nodes, edges, filterType]);

  const loadGraphData = async () => {
    try {
      setIsLoading(true);
      
      // Load entities, arcs, and timeline events
      const [entities, arcs, events] = await Promise.all([
        entitiesAPI.list(projectId),
        arcsAPI.list(projectId),
        timelineAPI.list(projectId),
      ]);

      // Convert to graph nodes
      const graphNodes: GraphNode[] = [
        ...entities.map(e => ({
          id: `entity-${e.id}`,
          label: e.name,
          type: "entity" as const,
          data: e,
        })),
        ...arcs.map(a => ({
          id: `arc-${a.id}`,
          label: a.name,
          type: "arc" as const,
          data: a,
        })),
        ...events.map(ev => ({
          id: `event-${ev.id}`,
          label: ev.title,
          type: "event" as const,
          data: ev,
        })),
      ];

      // Create edges based on relationships
      // For now, create simple connections between entities and arcs
      const graphEdges: GraphEdge[] = [];
      
      // Connect entities mentioned in arc descriptions
      arcs.forEach(arc => {
        entities.forEach(entity => {
          if (arc.description?.toLowerCase().includes(entity.name.toLowerCase())) {
            graphEdges.push({
              id: `edge-${arc.id}-${entity.id}`,
              source: `arc-${arc.id}`,
              target: `entity-${entity.id}`,
              label: "involves",
              impact: "neutral",
            });
          }
        });
      });

      // Connect events with entities
      events.forEach(event => {
        entities.forEach(entity => {
          if (event.description?.toLowerCase().includes(entity.name.toLowerCase())) {
            graphEdges.push({
              id: `edge-${event.id}-${entity.id}`,
              source: `event-${event.id}`,
              target: `entity-${entity.id}`,
              label: "involves",
              impact: "neutral",
            });
          }
        });
      });

      setNodes(graphNodes);
      setEdges(graphEdges);
      
      // Calculate stats
      calculateStats(graphNodes, graphEdges);
    } catch (error: any) {
      toast.error("Erreur lors du chargement du graphe");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (graphNodes: GraphNode[], graphEdges: GraphEdge[]) => {
    // Count isolated nodes (no connections)
    const connectedNodeIds = new Set<string>();
    graphEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    const isolated = graphNodes.filter(n => !connectedNodeIds.has(n.id)).length;

    // Detect loops (simplified: check if any node connects to itself)
    const loops = graphEdges.filter(e => e.source === e.target).length;

    setStats({
      nodes: graphNodes.length,
      edges: graphEdges.length,
      isolated,
      loops,
    });
  };

  const initializeGraph = () => {
    if (!cyRef.current) return;

    // Filter nodes based on selected type
    const filteredNodes = filterType === "all" 
      ? nodes 
      : nodes.filter(n => n.type === filterType);

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => 
      filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );

    // Convert to Cytoscape format
    const elements: ElementDefinition[] = [
      ...filteredNodes.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
        },
        classes: `node-${node.type}`,
      })),
      ...filteredEdges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          impact: edge.impact,
        },
        classes: `edge-${edge.impact}`,
      })),
    ];

    // Initialize or update Cytoscape
    if (cyInstance.current) {
      cyInstance.current.destroy();
    }

    cyInstance.current = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#666",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "color": "#fff",
            "text-outline-width": 2,
            "text-outline-color": "#666",
            "width": 40,
            "height": 40,
          },
        },
        {
          selector: ".node-entity",
          style: {
            "background-color": "hsl(var(--primary))",
            "shape": "ellipse",
          },
        },
        {
          selector: ".node-arc",
          style: {
            "background-color": "hsl(var(--accent))",
            "shape": "rectangle",
          },
        },
        {
          selector: ".node-event",
          style: {
            "background-color": "hsl(var(--secondary))",
            "shape": "diamond",
          },
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "label": "data(label)",
            "font-size": "10px",
            "text-rotation": "autorotate",
          },
        },
        {
          selector: ".edge-positive",
          style: {
            "line-color": "#22c55e",
            "target-arrow-color": "#22c55e",
          },
        },
        {
          selector: ".edge-negative",
          style: {
            "line-color": "#ef4444",
            "target-arrow-color": "#ef4444",
          },
        },
        {
          selector: ":selected",
          style: {
            "background-color": "#fbbf24",
            "line-color": "#fbbf24",
            "target-arrow-color": "#fbbf24",
            "border-width": 3,
            "border-color": "#fbbf24",
          },
        },
      ],
      layout: {
        name: "cose",
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
      minZoom: 0.5,
      maxZoom: 3,
    });

    // Add event listeners
    cyInstance.current.on("tap", "node", (event) => {
      const nodeId = event.target.id();
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        setIsDetailDialogOpen(true);
        
        // Highlight connected nodes
        cyInstance.current?.elements().removeClass("highlighted");
        event.target.addClass("highlighted");
        event.target.neighborhood().addClass("highlighted");
      }
    });
  };

  const handleZoomIn = () => {
    if (cyInstance.current) {
      cyInstance.current.zoom(cyInstance.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyInstance.current) {
      cyInstance.current.zoom(cyInstance.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyInstance.current) {
      cyInstance.current.fit();
    }
  };

  const handleExportSVG = () => {
    if (cyInstance.current) {
      // Export as PNG since SVG export requires additional plugin
      const png = cyInstance.current.png({ scale: 2, full: true, bg: "white" });
      const link = document.createElement("a");
      link.href = png;
      link.download = "graph.png";
      link.click();
      toast.success("Graphe exporté en PNG");
    }
  };

  const handleAnalyzeImpacts = async () => {
    if (!selectedNode) {
      toast.error("Veuillez sélectionner un nœud");
      return;
    }

    setIsAnalyzing(true);
    try {
      const nodeData = selectedNode.data as any;
      const context = `Élément: ${selectedNode.label}\nType: ${selectedNode.type}\nDescription: ${nodeData.description || nodeData.summary || "N/A"}`;
      
      const result = await llmAPI.analyze(projectId, {
        text_to_analyze: context,
        analysis_focus: "Analyse l'impact de cet élément sur les autres éléments narratifs et suggère des connexions potentielles.",
      });
      
      toast.success("Analyse terminée ! Consultez le panel IA pour les résultats.");
    } catch (error: any) {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
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
    <div className="space-y-2 md:space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleAnalyzeImpacts} variant="outline" size="sm" disabled={!selectedNode || isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Analyser Impacts
          </Button>
          
          <Button onClick={handleExportSVG} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter PNG
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleZoomIn} variant="outline" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} variant="outline" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button onClick={handleFit} variant="outline" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les éléments</SelectItem>
              <SelectItem value="entity">Entités</SelectItem>
              <SelectItem value="arc">Arcs narratifs</SelectItem>
              <SelectItem value="event">Événements</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="border rounded-lg p-4 bg-background">
        <div ref={cyRef} style={{ width: "100%", height: "600px" }} />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="secondary">
          {stats.nodes} nœud{stats.nodes > 1 ? "s" : ""}
        </Badge>
        <Badge variant="secondary">
          {stats.edges} lien{stats.edges > 1 ? "s" : ""}
        </Badge>
        {stats.isolated > 0 && (
          <Badge variant="destructive">
            {stats.isolated} nœud{stats.isolated > 1 ? "s" : ""} isolé{stats.isolated > 1 ? "s" : ""}
          </Badge>
        )}
        {stats.loops > 0 && (
          <Badge variant="outline">
            {stats.loops} boucle{stats.loops > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Node Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNode?.label}</DialogTitle>
            <DialogDescription>
              Type: {selectedNode?.type === "entity" ? "Entité" : selectedNode?.type === "arc" ? "Arc narratif" : "Événement"}
            </DialogDescription>
          </DialogHeader>

          {selectedNode && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {(selectedNode.data as any).description || (selectedNode.data as any).summary || "Aucune description"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Styles */}
      <style>{`
        .highlighted {
          opacity: 1 !important;
        }
        
        [class*="node-"]:not(.highlighted) {
          opacity: 0.3;
        }
        
        [class*="edge-"]:not(.highlighted) {
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
}
