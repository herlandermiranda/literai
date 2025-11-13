import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { History, GitCommit, RotateCcw, FileText, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface Version {
  id: string;
  node_id: string;
  version_number: number;
  commit_message: string | null;
  is_auto_commit: boolean;
  title: string;
  content: string;
  summary: string | null;
  level: string;
  tags: string[];
  node_metadata_snapshot: Record<string, any>;
  diff_from_previous: any;
  created_at: string;
}

interface VersionHistoryPanelProps {
  nodeId: string;
  currentContent: string;
  currentTitle: string;
  onRestore: (version: Version) => void;
}

export default function VersionHistoryPanel({ nodeId, currentContent, currentTitle, onRestore }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [nodeId]);

  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/versioning/nodes/${nodeId}/history/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load version history');

      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Impossible de charger l\'historique des versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: Version) => {
    if (!confirm(`Restaurer la version ${version.version_number} ? Cela créera une nouvelle version.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/versioning/nodes/${nodeId}/restore/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            version_number: version.version_number,
            create_new_version: true,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to restore version');

      const data = await response.json();
      toast.success(`Version ${version.version_number} restaurée avec succès`);
      
      // Reload history
      await loadVersionHistory();
      
      // Notify parent component
      onRestore(version);

      // Show impact analysis if available
      if (data.impact_analysis) {
        console.log('Impact analysis:', data.impact_analysis);
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Impossible de restaurer la version');
    }
  };

  const handleCompare = async (version1: Version, version2: Version) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/versioning/nodes/${nodeId}/diff/?version1=${version1.version_number}&version2=${version2.version_number}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to compare versions');

      const diff = await response.json();
      setCompareVersion({ ...version1, ...diff });
      setShowDiff(true);
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Impossible de comparer les versions');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Historique des Versions</h3>
        </div>
        <Button variant="outline" size="sm" onClick={loadVersionHistory} disabled={loading}>
          Actualiser
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {versions.map((version, index) => (
            <Card key={version.id} className={index === 0 ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GitCommit className="h-4 w-4" />
                    <CardTitle className="text-sm">
                      Version {version.version_number}
                      {index === 0 && <Badge variant="default" className="ml-2">Actuelle</Badge>}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVersion(version)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Version {version.version_number} - {version.title}</DialogTitle>
                          <DialogDescription>
                            {formatDate(version.created_at)}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh]">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Contenu:</h4>
                              <div className="whitespace-pre-wrap bg-muted p-4 rounded">
                                {version.content}
                              </div>
                            </div>
                            {version.summary && (
                              <div>
                                <h4 className="font-semibold mb-2">Résumé:</h4>
                                <p className="text-sm text-muted-foreground">{version.summary}</p>
                              </div>
                            )}
                            {version.tags.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Tags:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {version.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    
                    {index > 0 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompare(versions[0], version)}
                        >
                          Diff
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(version)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-4 text-xs mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(version.created_at)}
                  </span>
                  {version.is_auto_commit ? (
                    <Badge variant="outline" className="text-xs">Auto</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Manuel</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm font-medium mb-1">{version.title}</p>
                {version.commit_message && (
                  <p className="text-xs text-muted-foreground italic">
                    "{version.commit_message}"
                  </p>
                )}
                {version.diff_from_previous && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="text-green-600">+{version.diff_from_previous.lines_added}</span>
                    {' / '}
                    <span className="text-red-600">-{version.diff_from_previous.lines_deleted}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {versions.length === 0 && !loading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune version disponible
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Diff Dialog */}
      <Dialog open={showDiff} onOpenChange={setShowDiff}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comparaison de Versions</DialogTitle>
            <DialogDescription>
              Différences entre les versions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            {compareVersion && (compareVersion as any).old_title && (
              <ReactDiffViewer
                oldValue={(compareVersion as any).old_title + '\n\n' + ((compareVersion as any).old_summary || '')}
                newValue={(compareVersion as any).new_title + '\n\n' + ((compareVersion as any).new_summary || '')}
                splitView={true}
                leftTitle={`Version ${(compareVersion as any).old_version}`}
                rightTitle={`Version ${(compareVersion as any).new_version}`}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
