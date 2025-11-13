/**
 * AI Assistant panel for LLM-powered writing features
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { llmAPI } from "@/lib/api";
import { DEFAULT_CONTINUATION_LENGTH, MIN_CONTINUATION_LENGTH, MAX_CONTINUATION_LENGTH } from "@/const";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy, Check, RefreshCw, Wand2, Lightbulb, BarChart3 } from "lucide-react";

interface AIAssistantPanelProps {
  projectId: string;
  currentDocumentContent?: string;
}

export default function AIAssistantPanel({ projectId, currentDocumentContent }: AIAssistantPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Continuation state
  const [continuationText, setContinuationText] = useState("");
  const [continuationInstructions, setContinuationInstructions] = useState("");
  const [continuationLength, setContinuationLength] = useState([DEFAULT_CONTINUATION_LENGTH]);

  // Rewriting state
  const [rewriteText, setRewriteText] = useState("");
  const [rewriteGoals, setRewriteGoals] = useState("");
  const [rewriteInstructions, setRewriteInstructions] = useState("");

  // Suggestions state
  const [suggestionContext, setSuggestionContext] = useState("");
  const [suggestionQuestion, setSuggestionQuestion] = useState("");

  // Analysis state
  const [analysisText, setAnalysisText] = useState("");
  const [analysisFocus, setAnalysisFocus] = useState("");
  const [analysisInstructions, setAnalysisInstructions] = useState("");

  const handleContinuation = async () => {
    const textToUse = continuationText || currentDocumentContent || "";
    
    if (!textToUse.trim()) {
      toast.error("Veuillez fournir un texte à continuer");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await llmAPI.continuation(projectId, {
        existing_text: textToUse,
        user_instructions: continuationInstructions || undefined,
        target_length: continuationLength[0],
      });
      setResult(response.text);
      toast.success("Continuation générée !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!rewriteText.trim()) {
      toast.error("Veuillez fournir un texte à réécrire");
      return;
    }

    if (!rewriteGoals.trim()) {
      toast.error("Veuillez spécifier les objectifs de réécriture");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await llmAPI.rewrite(projectId, {
        text_to_rewrite: rewriteText,
        rewriting_goals: rewriteGoals,
        user_instructions: rewriteInstructions || undefined,
      });
      setResult(response.text);
      toast.success("Réécriture générée !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestions = async () => {
    const contextToUse = suggestionContext || currentDocumentContent || "";
    
    if (!contextToUse.trim()) {
      toast.error("Veuillez fournir un contexte");
      return;
    }

    if (!suggestionQuestion.trim()) {
      toast.error("Veuillez poser une question");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await llmAPI.suggestions(projectId, {
        current_context: contextToUse,
        user_question: suggestionQuestion,
      });
      setResult(response.text);
      toast.success("Suggestions générées !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    const textToAnalyze = analysisText || currentDocumentContent || "";
    
    if (!textToAnalyze.trim()) {
      toast.error("Veuillez fournir un texte à analyser");
      return;
    }

    if (!analysisFocus.trim()) {
      toast.error("Veuillez spécifier le focus de l'analyse");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await llmAPI.analyze(projectId, {
        text_to_analyze: textToAnalyze,
        analysis_focus: analysisFocus,
        user_instructions: analysisInstructions || undefined,
      });
      setResult(response.text);
      toast.success("Analyse générée !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Assistant IA
        </h2>
        <p className="text-muted-foreground">
          Utilisez l'intelligence artificielle pour améliorer votre écriture
        </p>
      </div>

      <Tabs defaultValue="continuation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="continuation">
            <RefreshCw className="w-4 h-4 mr-2" />
            Continuation
          </TabsTrigger>
          <TabsTrigger value="rewrite">
            <Wand2 className="w-4 h-4 mr-2" />
            Réécriture
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Lightbulb className="w-4 h-4 mr-2" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyse
          </TabsTrigger>
        </TabsList>

        {/* Continuation Tab */}
        <TabsContent value="continuation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Continuer le texte</CardTitle>
              <CardDescription>
                L'IA génère une suite cohérente à partir de votre texte existant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="continuation-text">
                  Texte à continuer
                  {currentDocumentContent && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (utilise le document actuel si vide)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="continuation-text"
                  placeholder="Il était une fois..."
                  value={continuationText}
                  onChange={(e) => setContinuationText(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="continuation-instructions">
                  Instructions spécifiques (optionnel)
                </Label>
                <Textarea
                  id="continuation-instructions"
                  placeholder="Ex: Introduire un conflit, ajouter un personnage mystérieux..."
                  value={continuationInstructions}
                  onChange={(e) => setContinuationInstructions(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Longueur cible: {continuationLength[0]} mots
                </Label>
                <Slider
                  value={continuationLength}
                  onValueChange={setContinuationLength}
                  min={MIN_CONTINUATION_LENGTH}
                  max={MAX_CONTINUATION_LENGTH}
                  step={50}
                />
              </div>
              <Button
                onClick={handleContinuation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer la continuation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewrite Tab */}
        <TabsContent value="rewrite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Réécrire le texte</CardTitle>
              <CardDescription>
                Améliorez votre texte selon vos objectifs spécifiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rewrite-text">Texte à réécrire</Label>
                <Textarea
                  id="rewrite-text"
                  placeholder="Le prince marchait dans la forêt..."
                  value={rewriteText}
                  onChange={(e) => setRewriteText(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rewrite-goals">Objectifs de réécriture *</Label>
                <Textarea
                  id="rewrite-goals"
                  placeholder="Ex: Améliorer le style, ajouter des détails sensoriels, rendre plus dynamique..."
                  value={rewriteGoals}
                  onChange={(e) => setRewriteGoals(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rewrite-instructions">
                  Instructions supplémentaires (optionnel)
                </Label>
                <Textarea
                  id="rewrite-instructions"
                  placeholder="Autres consignes..."
                  value={rewriteInstructions}
                  onChange={(e) => setRewriteInstructions(e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                onClick={handleRewrite}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Réécriture en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Réécrire le texte
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Obtenir des suggestions</CardTitle>
              <CardDescription>
                Posez une question et obtenez des idées créatives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suggestion-context">
                  Contexte actuel
                  {currentDocumentContent && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (utilise le document actuel si vide)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="suggestion-context"
                  placeholder="Le prince est perdu dans la forêt enchantée..."
                  value={suggestionContext}
                  onChange={(e) => setSuggestionContext(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggestion-question">Votre question *</Label>
                <Textarea
                  id="suggestion-question"
                  placeholder="Ex: Comment peut-il trouver son chemin ? Que pourrait-il découvrir ?"
                  value={suggestionQuestion}
                  onChange={(e) => setSuggestionQuestion(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSuggestions}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Obtenir des suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyser le texte</CardTitle>
              <CardDescription>
                Obtenez une analyse détaillée de votre écriture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="analysis-text">
                  Texte à analyser
                  {currentDocumentContent && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (utilise le document actuel si vide)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="analysis-text"
                  placeholder="Votre texte à analyser..."
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analysis-focus">Focus de l'analyse *</Label>
                <Textarea
                  id="analysis-focus"
                  placeholder="Ex: Rythme narratif, développement des personnages, cohérence temporelle..."
                  value={analysisFocus}
                  onChange={(e) => setAnalysisFocus(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analysis-instructions">
                  Instructions supplémentaires (optionnel)
                </Label>
                <Textarea
                  id="analysis-instructions"
                  placeholder="Autres consignes..."
                  value={analysisInstructions}
                  onChange={(e) => setAnalysisInstructions(e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                onClick={handleAnalysis}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analyser le texte
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Display */}
      {result && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Résultat
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
