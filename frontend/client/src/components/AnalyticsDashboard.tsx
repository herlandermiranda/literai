import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL, API_V1_PREFIX } from '@/const';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, BookOpen, FileText, Users, Target, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsDashboardProps {
  projectId: string;
}

const LEVEL_LABELS: Record<string, string> = {
  very_high: 'Très haut niveau',
  high: 'Haut niveau',
  intermediate: 'Intermédiaire',
  fine: 'Fin',
  final: 'Final',
};

const LEVEL_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [pyramidMetrics, setPyramidMetrics] = useState<any>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [structuralAnalysis, setStructuralAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productivityDays, setProductivityDays] = useState(30);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load all metrics in parallel
      const [pyramidRes, productivityRes, overviewRes] = await Promise.all([
        fetch(`${API_BASE_URL}${API_V1_PREFIX}/analytics/projects/${projectId}/pyramid-metrics/`, { headers }),
        fetch(`${API_BASE_URL}${API_V1_PREFIX}/analytics/projects/${projectId}/productivity/?days=${productivityDays}`, { headers }),
        fetch(`${API_BASE_URL}${API_V1_PREFIX}/analytics/projects/${projectId}/overview/`, { headers }),
      ]);

      if (pyramidRes.ok) {
        setPyramidMetrics(await pyramidRes.json());
      }
      if (productivityRes.ok) {
        setProductivityMetrics(await productivityRes.json());
      }
      if (overviewRes.ok) {
        setOverview(await overviewRes.json());
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const runStructuralAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}${API_V1_PREFIX}/analytics/projects/${projectId}/structural-analysis/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const analysis = await response.json();
        setStructuralAnalysis(analysis);
        toast.success('Analyse structurelle terminée');
      } else {
        toast.error('Erreur lors de l\'analyse structurelle');
      }
    } catch (error) {
      console.error('Error running structural analysis:', error);
      toast.error('Erreur lors de l\'analyse structurelle');
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, productivityDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const pyramidLevelData = pyramidMetrics ? Object.entries(pyramidMetrics.nodes_by_level).map(([level, count]) => ({
    level: LEVEL_LABELS[level] || level,
    nodes: count,
    words: pyramidMetrics.words_by_level[level] || 0,
    completion: pyramidMetrics.completion_by_level[level]?.percentage || 0,
  })) : [];

  const productivityData = productivityMetrics?.daily_stats?.slice(-30) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tableau de Bord Analytique</h2>
          <p className="text-muted-foreground">Statistiques et métriques du projet</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nœuds Pyramidaux</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.pyramid_nodes}</div>
              <p className="text-xs text-muted-foreground">
                {overview.total_pyramid_words.toLocaleString()} mots
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.documents}</div>
              <p className="text-xs text-muted-foreground">
                {overview.total_document_words.toLocaleString()} mots
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entités</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.entities}</div>
              <p className="text-xs text-muted-foreground">
                {overview.arcs} arcs narratifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mots</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_words.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {overview.timeline_events} événements timeline
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pyramid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pyramid">Structure Pyramidale</TabsTrigger>
          <TabsTrigger value="productivity">Productivité</TabsTrigger>
          <TabsTrigger value="structural">Analyse Structurelle</TabsTrigger>
        </TabsList>

        {/* Pyramid Tab */}
        <TabsContent value="pyramid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Nodes by Level */}
            <Card>
              <CardHeader>
                <CardTitle>Nœuds par Niveau</CardTitle>
                <CardDescription>Distribution des nœuds dans la pyramide</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pyramidLevelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="nodes" fill="#8b5cf6" name="Nœuds" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Words by Level */}
            <Card>
              <CardHeader>
                <CardTitle>Mots par Niveau</CardTitle>
                <CardDescription>Volume de contenu par niveau</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pyramidLevelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="words" fill="#a78bfa" name="Mots" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Completion by Level */}
            <Card>
              <CardHeader>
                <CardTitle>Taux de Complétion</CardTitle>
                <CardDescription>Pourcentage de nœuds complétés par niveau</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pyramidLevelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completion" fill="#c4b5fd" name="Complétion %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution des Nœuds</CardTitle>
                <CardDescription>Répartition en camembert</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pyramidLevelData}
                      dataKey="nodes"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {pyramidLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Période :</span>
            <Button
              variant={productivityDays === 7 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProductivityDays(7)}
            >
              7 jours
            </Button>
            <Button
              variant={productivityDays === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProductivityDays(30)}
            >
              30 jours
            </Button>
            <Button
              variant={productivityDays === 90 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProductivityDays(90)}
            >
              90 jours
            </Button>
          </div>

          {productivityMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Nœuds Créés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productivityMetrics.total_nodes_created}</div>
                  <p className="text-xs text-muted-foreground">
                    Moyenne : {productivityMetrics.avg_nodes_per_day.toFixed(1)} / jour
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mots Écrits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productivityMetrics.total_words_written.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Moyenne : {productivityMetrics.avg_words_per_day.toFixed(0)} / jour
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Période</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productivityMetrics.period_days} jours</div>
                  <p className="text-xs text-muted-foreground">
                    Données récentes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Nodes Created Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Nœuds Créés</CardTitle>
                <CardDescription>Évolution quotidienne</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="nodes_created" stroke="#8b5cf6" name="Nœuds" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Words Written Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Mots Écrits</CardTitle>
                <CardDescription>Évolution quotidienne</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="words_written" stroke="#a78bfa" name="Mots" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Structural Analysis Tab */}
        <TabsContent value="structural" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Structurelle</CardTitle>
              <CardDescription>Détection automatique des déséquilibres avec IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!structuralAnalysis ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Aucune analyse structurelle n'a encore été effectuée.
                  </p>
                  <Button onClick={runStructuralAnalysis}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Lancer l'analyse
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Health Score */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Score de Santé Global</h4>
                      <p className="text-sm text-muted-foreground">
                        Évaluation de la structure pyramidale
                      </p>
                    </div>
                    <div className="text-4xl font-bold">
                      {structuralAnalysis.overall_health_score}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  {structuralAnalysis.has_imbalances && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          structuralAnalysis.severity === 'high'
                            ? 'destructive'
                            : structuralAnalysis.severity === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        Sévérité : {structuralAnalysis.severity}
                      </Badge>
                    </div>
                  )}

                  {/* Issues */}
                  {structuralAnalysis.issues && structuralAnalysis.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Problèmes Détectés</h4>
                      <div className="space-y-2">
                        {structuralAnalysis.issues.map((issue: any, i: number) => (
                          <div key={i} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{issue.level}</Badge>
                              <Badge
                                variant={
                                  issue.severity === 'high'
                                    ? 'destructive'
                                    : issue.severity === 'medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {issue.severity}
                              </Badge>
                              <span className="text-sm font-medium">{issue.type}</span>
                            </div>
                            <p className="text-sm">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {structuralAnalysis.suggestions && structuralAnalysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions d'Amélioration</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {structuralAnalysis.suggestions.map((suggestion: string, i: number) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* No Issues */}
                  {!structuralAnalysis.has_imbalances && (
                    <div className="flex items-center gap-2 text-green-600 p-4 border rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                      <span>Aucun déséquilibre structurel détecté ! La pyramide est bien équilibrée.</span>
                    </div>
                  )}

                  <Button onClick={runStructuralAnalysis} variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Relancer l'analyse
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
