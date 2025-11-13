/**
 * Dashboard page showing user's projects
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { projectsAPI, Project } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, Plus, Loader2, FileText, LogOut, Trash2 } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New project form state
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectLanguage, setNewProjectLanguage] = useState("fr");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.list();
      setProjects(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des projets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const newProject = await projectsAPI.create({
        title: newProjectTitle,
        description: newProjectDescription,
        language: newProjectLanguage,
      });

      setProjects([...projects, newProject]);
      toast.success("Projet créé avec succès !");
      setIsDialogOpen(false);
      setNewProjectTitle("");
      setNewProjectDescription("");
      setNewProjectLanguage("fr");
      
      // Navigate to the new project
      setLocation(`/project/${newProject.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du projet");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success("Projet supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression du projet");
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{APP_TITLE}</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Bienvenue, {user?.full_name || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex-shrink-0">
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline ml-2">Déconnexion</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Mes Projets</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Gérez vos projets d'écriture littéraire
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4" />
                <span className="ml-2 md:ml-2">Nouveau</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau projet</DialogTitle>
                  <DialogDescription>
                    Commencez un nouveau projet d'écriture littéraire
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      placeholder="Mon Premier Roman"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Une brève description de votre projet..."
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      disabled={isCreating}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select
                      value={newProjectLanguage}
                      onValueChange={setNewProjectLanguage}
                      disabled={isCreating}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer le projet"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre premier projet d'écriture
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un projet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setLocation(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || "Aucune description"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Langue: {project.language.toUpperCase()}</span>
                    <span>
                      {new Date(project.updated_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
