/**
 * API client for communicating with the FastAPI backend
 */

import { API_V1_PREFIX } from "@/const";
import { apiClient } from "./api_client";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Get the authentication token from the API client
 */
function getAuthToken(): string | null {
  return apiClient.getAccessToken();
}

/**
 * Set the authentication token in the API client
 */
export function setAuthToken(token: string): void {
  apiClient.setAccessToken(token);
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('literai_auth_token', token);
  }
}

/**
 * Remove the authentication token from the API client
 */
export function clearAuthToken(): void {
  apiClient.setAccessToken(null);
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('literai_auth_token');
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = apiClient.getBaseUrl();
  const url = `${baseUrl}${API_V1_PREFIX}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }

    throw new APIError(
      errorData.detail || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ============================================================================
// Authentication API
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export const authAPI = {
  login: (data: LoginRequest) =>
    apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    apiRequest<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiRequest<User>("/auth/me"),
};

// ============================================================================
// Projects API
// ============================================================================

export interface Project {
  id: string;
  title: string;
  description?: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
  language?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  language?: string;
}

export const projectsAPI = {
  list: () => apiRequest<Project[]>("/projects"),

  get: (id: string) => apiRequest<Project>(`/projects/${id}`),

  create: (data: ProjectCreate) =>
    apiRequest<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ProjectUpdate) =>
    apiRequest<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// Documents API
// ============================================================================

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string;
  type: string;
  parent_id?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreate {
  title: string;
  content?: string;
  type?: string;
  parent_id?: string;
  order_index?: number;
}

export interface DocumentUpdate {
  title?: string;
  content?: string;
  type?: string;
  parent_id?: string;
  order_index?: number;
}

export const documentsAPI = {
  list: (projectId: string) =>
    apiRequest<Document[]>(`/documents?project_id=${projectId}`),

  get: (id: string) => apiRequest<Document>(`/documents/${id}`),

  create: (projectId: string, data: DocumentCreate) =>
    apiRequest<Document>(`/documents/?project_id=${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: DocumentUpdate) =>
    apiRequest<Document>(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/documents/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// Entities API
// ============================================================================

export interface Entity {
  id: string;
  project_id: string;
  name: string;
  type: string;
  description?: string;
  entity_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EntityCreate {
  name: string;
  type: string;
  description?: string;
  entity_metadata?: Record<string, any>;
}

export interface EntityUpdate {
  name?: string;
  type?: string;
  description?: string;
  entity_metadata?: Record<string, any>;
}

export const entitiesAPI = {
  list: (projectId: string) =>
    apiRequest<Entity[]>(`/entities?project_id=${projectId}`),

  get: (id: string) => apiRequest<Entity>(`/entities/${id}`),

  create: (projectId: string, data: EntityCreate) =>
    apiRequest<Entity>(`/entities/?project_id=${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: EntityUpdate) =>
    apiRequest<Entity>(`/entities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/entities/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// Arcs API
// ============================================================================

export interface Arc {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  color?: string;
  arc_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ArcCreate {
  name: string;
  description?: string;
  color?: string;
  arc_metadata?: Record<string, any>;
}

export interface ArcUpdate {
  name?: string;
  description?: string;
  color?: string;
  arc_metadata?: Record<string, any>;
}

export interface ArcLink {
  id: string;
  arc_id: string;
  document_id: string;
  created_at: string;
}

export const arcsAPI = {
  list: (projectId: string) => apiRequest<Arc[]>(`/arcs?project_id=${projectId}`),

  get: (id: string) => apiRequest<Arc>(`/arcs/${id}`),

  create: (projectId: string, data: ArcCreate) =>
    apiRequest<Arc>(`/arcs/?project_id=${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ArcUpdate) =>
    apiRequest<Arc>(`/arcs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/arcs/${id}`, {
      method: "DELETE",
    }),

  linkDocument: (arcId: string, documentId: string) =>
    apiRequest<ArcLink>(`/arcs/${arcId}/documents/${documentId}`, {
      method: "POST",
    }),

  unlinkDocument: (arcId: string, documentId: string) =>
    apiRequest<void>(`/arcs/${arcId}/documents/${documentId}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// Timeline API
// ============================================================================

export interface TimelineEvent {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  date?: string;
  order_index: number;
  event_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TimelineEventCreate {
  title: string;
  description?: string;
  date?: string;
  order_index?: number;
  event_metadata?: Record<string, any>;
}

export interface TimelineEventUpdate {
  title?: string;
  description?: string;
  date?: string;
  order_index?: number;
  event_metadata?: Record<string, any>;
}

export interface TimelineLink {
  id: string;
  event_id: string;
  document_id: string;
  created_at: string;
}

export const timelineAPI = {
  list: (projectId: string) =>
    apiRequest<TimelineEvent[]>(`/timeline?project_id=${projectId}`),

  get: (id: string) => apiRequest<TimelineEvent>(`/timeline/${id}`),

  create: (projectId: string, data: TimelineEventCreate) =>
    apiRequest<TimelineEvent>(`/timeline/?project_id=${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: TimelineEventUpdate) =>
    apiRequest<TimelineEvent>(`/timeline/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/timeline/${id}`, {
      method: "DELETE",
    }),

  linkDocument: (eventId: string, documentId: string) =>
    apiRequest<TimelineLink>(`/timeline/${eventId}/documents/${documentId}`, {
      method: "POST",
    }),

  unlinkDocument: (eventId: string, documentId: string) =>
    apiRequest<void>(`/timeline/${eventId}/documents/${documentId}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// Tags API
// ============================================================================

export interface TagInstance {
  id: string;
  document_id: string;
  tag_name: string;
  start_pos: number;
  end_pos: number;
  tag_metadata?: Record<string, any>;
  created_at: string;
}

export interface TagInstanceCreate {
  tag_name: string;
  start_pos: number;
  end_pos: number;
  tag_metadata?: Record<string, any>;
}

export const tagsAPI = {
  list: (documentId: string) =>
    apiRequest<TagInstance[]>(`/tags?document_id=${documentId}`),

  create: (documentId: string, data: TagInstanceCreate) =>
    apiRequest<TagInstance>(`/tags/?document_id=${documentId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/tags/${id}`, {
      method: "DELETE",
    }),
};

// ============================================================================
// LLM API
// ============================================================================

export interface ContinuationRequest {
  existing_text: string;
  user_instructions?: string;
  target_length?: number;
  entity_ids?: string[];
  arc_ids?: string[];
  event_ids?: string[];
}

export interface RewritingRequest {
  text_to_rewrite: string;
  rewriting_goals: string;
  user_instructions?: string;
}

export interface SuggestionRequest {
  current_context: string;
  user_question: string;
  entity_ids?: string[];
  arc_ids?: string[];
  event_ids?: string[];
}

export interface AnalysisRequest {
  text_to_analyze: string;
  analysis_focus: string;
  user_instructions?: string;
}

export interface LLMResponse {
  text: string;
  request_id: string;
}

export interface LLMRequestHistory {
  id: string;
  request_type: string;
  prompt: string;
  response: string;
  model: string;
  tokens_used?: number;
  status: string;
  created_at: string;
}

export const llmAPI = {
  continuation: (projectId: string, data: ContinuationRequest & { project_id?: string }) =>
    apiRequest<LLMResponse>(`/llm/continuation`, {
      method: "POST",
      body: JSON.stringify({ ...data, project_id: projectId }),
    }),

  rewrite: (projectId: string, data: RewritingRequest & { project_id?: string }) =>
    apiRequest<LLMResponse>(`/llm/rewrite`, {
      method: "POST",
      body: JSON.stringify({ ...data, project_id: projectId }),
    }),

  suggestions: (projectId: string, data: SuggestionRequest & { project_id?: string }) =>
    apiRequest<LLMResponse>(`/llm/suggestions`, {
      method: "POST",
      body: JSON.stringify({ ...data, project_id: projectId }),
    }),

  analyze: (projectId: string, data: AnalysisRequest & { project_id?: string }) =>
    apiRequest<LLMResponse>(`/llm/analyze`, {
      method: "POST",
      body: JSON.stringify({ ...data, project_id: projectId }),
    }),

  history: (projectId: string, skip = 0, limit = 50) =>
    apiRequest<LLMRequestHistory[]>(
      `/llm/history/${projectId}?skip=${skip}&limit=${limit}`
    ),
};


// Pyramid types
export interface PyramidNode {
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
}

export interface PyramidNodeCreate {
  parent_id?: string | null;
  level: number;
  title: string;
  content: string;
  order?: number;
}

export interface PyramidNodeUpdate {
  level?: string;
  title?: string;
  content?: string;
  summary?: string | null;
  tags?: string[];
}

export interface PyramidGenerateRequest {
  parent_id?: string;
  target_level: string;
  count: number;
  context?: string;
}

export interface PyramidGenerateResponse {
  nodes: PyramidNode[];
  prompt_used: string;
}

export interface PyramidCoherenceCheckRequest {
  node_id?: string;
  check_children: boolean;
}

export interface PyramidCoherenceCheckResponse {
  checked_nodes: number;
  issues_found: number;
  issues: any[];
  suggestions: string[];
}

export const pyramidAPI = {
  // Get all nodes for a project
  getAll: (projectId: string) =>
    apiRequest<PyramidNode[]>(`/pyramid/projects/${projectId}`),

  // Get tree structure
  getTree: (projectId: string) =>
    apiRequest<PyramidNode[]>(`/pyramid/projects/${projectId}`),

  // Get single node
  get: (projectId: string, nodeId: string) =>
    apiRequest<PyramidNode>(`/pyramid/${nodeId}`),

  // Create node
  create: (projectId: string, data: PyramidNodeCreate) =>
    apiRequest<PyramidNode>("/pyramid/nodes", {
      method: "POST",
      body: JSON.stringify({...data, project_id: projectId}),
    }),

  // Update node
  update: (projectId: string, nodeId: string, data: PyramidNodeUpdate) =>
    apiRequest<PyramidNode>(`/pyramid/${nodeId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete node
  delete: (projectId: string, nodeId: string) =>
    apiRequest<void>(`/pyramid/${nodeId}`, {
      method: "DELETE",
    }),

  // Move node
  move: (projectId: string, nodeId: string, newParentId: string | null) =>
    apiRequest<PyramidNode>(`/pyramid/${projectId}/nodes/${nodeId}/move`, {
      method: "POST",
      body: JSON.stringify({ new_parent_id: newParentId }),
    }),

  // Reorder nodes
  reorder: (projectId: string, nodeIds: string[]) =>
    apiRequest<PyramidNode[]>(`/pyramid/${projectId}/reorder`, {
      method: "POST",
      body: JSON.stringify({ node_ids: nodeIds }),
    }),

  // Generate downward (develop node into children)
  generateDownward: (projectId: string, data: PyramidGenerateRequest) =>
    apiRequest<PyramidGenerateResponse>(`/pyramid-llm/${projectId}/generate-downward/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Generate upward (synthesize children into parent)
  generateUpward: (projectId: string, data: { node_ids: string[]; target_level: string }) =>
    apiRequest<{ summary_node: PyramidNode; prompt_used: string }>(`/pyramid-llm/${projectId}/generate-upward/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Check coherence
  checkCoherence: (projectId: string, data: PyramidCoherenceCheckRequest) =>
    apiRequest<PyramidCoherenceCheckResponse>(`/pyramid-llm/${projectId}/check-coherence/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Detect impacts
  detectImpacts: (projectId: string, nodeId: string) =>
    apiRequest<any>(`/pyramid-llm/${projectId}/detect-impacts/${nodeId}`, {
      method: "POST",
    }),
};


// ============================================================================
// Semantic Tags API
// ============================================================================

export interface Tag {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  category?: string;
  color?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EntityResolution {
  id: string;
  tag_id: string;
  entity_id: string;
  confidence: number;
  context?: string;
  created_at: string;
}

export interface TagCreateRequest {
  project_id: string;
  name: string;
  category?: string;
  color?: string;
  description?: string;
}

export interface EntityResolutionRequest {
  tag_id: string;
  entity_id: string;
  confidence: number;
  context?: string;
}

export const semanticTagsAPI = {
  // Get all tags for a project
  getAll: (projectId: string) =>
    apiRequest<Tag[]>(`/semantic-tags/projects/${projectId}/tags`),

  // Create a tag
  create: (data: TagCreateRequest) =>
    apiRequest<Tag>(`/semantic-tags/tags/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get a specific tag
  get: (tagId: string) =>
    apiRequest<Tag>(`/semantic-tags/tags/${tagId}`),

  // Update a tag
  update: (tagId: string, data: Partial<TagCreateRequest>) =>
    apiRequest<Tag>(`/semantic-tags/tags/${tagId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete a tag
  delete: (tagId: string) =>
    apiRequest<void>(`/semantic-tags/tags/${tagId}`, {
      method: "DELETE",
    }),

  // Get entity resolutions for a tag
  getResolutions: (tagId: string) =>
    apiRequest<EntityResolution[]>(`/semantic-tags/tags/${tagId}/resolutions/`),

  // Create entity resolution
  createResolution: (data: EntityResolutionRequest) =>
    apiRequest<EntityResolution>(`/semantic-tags/resolutions/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Auto-tag entities in a document
  autoTag: (documentId: string) =>
    apiRequest<{ tags_created: number; resolutions_created: number }>(`/semantic-tags/documents/${documentId}/auto-tag`, {
      method: "POST",
    }),

  // Suggest tags for a document
  suggestTags: (documentId: string) =>
    apiRequest<{ suggested_tags: Array<{ name: string; category: string; confidence: number }> }>(`/semantic-tags/documents/${documentId}/suggest-tags`, {
      method: "POST",
    }),
};

// ============================================================================
// Versions API
// ============================================================================

export interface Version {
  id: string;
  project_id: string;
  document_id?: string;
  pyramid_node_id?: string;
  commit_message: string;
  author_email: string;
  content_snapshot: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface VersionCreateRequest {
  project_id: string;
  document_id?: string;
  pyramid_node_id?: string;
  commit_message: string;
  author_email: string;
  content_snapshot: string;
  metadata?: Record<string, any>;
}

export interface VersionDiff {
  additions: number;
  deletions: number;
  changes: Array<{ type: string; content: string }>;
}

export const versionsAPI = {
  // Get all versions for a project
  getByProject: (projectId: string) =>
    apiRequest<Version[]>(`/versions/projects/${projectId}/versions/`),

  // Get all versions for a document
  getByDocument: (documentId: string) =>
    apiRequest<Version[]>(`/versions/documents/${documentId}/versions/`),

  // Get all versions for a pyramid node
  getByNode: (nodeId: string) =>
    apiRequest<Version[]>(`/versions/pyramid-nodes/${nodeId}/versions/`),

  // Create a version
  create: (data: VersionCreateRequest) =>
    apiRequest<Version>(`/versions/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get a specific version
  get: (versionId: string) =>
    apiRequest<Version>(`/versions/${versionId}`),

  // Compare two versions
  compare: (versionId1: string, versionId2: string) =>
    apiRequest<VersionDiff>(`/versions/compare/${versionId1}/${versionId2}`),

  // Restore a version
  restore: (versionId: string) =>
    apiRequest<{ document?: any; pyramid_node?: any }>(`/versions/${versionId}/restore`, {
      method: "POST",
    }),
};

// ============================================================================
// Analytics API
// ============================================================================

export interface WordCountStats {
  total_words: number;
  total_characters: number;
  total_characters_no_spaces: number;
  average_word_length: number;
  by_document: Record<string, number>;
}

export interface WritingProgressStats {
  words_per_day: Record<string, number>;
  total_sessions: number;
  average_session_length: number;
  most_productive_day: string;
  most_productive_hour: number;
}

export interface EntityStats {
  total_entities: number;
  by_type: Record<string, number>;
  most_mentioned: Array<{ name: string; count: number; type: string }>;
}

export interface ArcStats {
  total_arcs: number;
  completed_arcs: number;
  in_progress_arcs: number;
  average_arc_length: number;
}

export interface TimelineStats {
  total_events: number;
  events_with_date: number;
  events_without_date: number;
  timeline_span_days: number;
}

export interface ProjectAnalytics {
  project_id: string;
  generated_at: string;
  word_count: WordCountStats;
  writing_progress: WritingProgressStats;
  entities: EntityStats;
  arcs: ArcStats;
  timeline: TimelineStats;
  llm_usage: Record<string, number>;
}

export const analyticsAPI = {
  // Get complete project analytics
  getProjectAnalytics: (projectId: string) =>
    apiRequest<ProjectAnalytics>(`/analytics/projects/${projectId}/analytics/`),

  // Get word count stats
  getWordCountStats: (projectId: string) =>
    apiRequest<WordCountStats>(`/analytics/projects/${projectId}/word-count/`),

  // Get writing progress stats
  getWritingProgressStats: (projectId: string) =>
    apiRequest<WritingProgressStats>(`/analytics/projects/${projectId}/writing-progress/`),

  // Get entity stats
  getEntityStats: (projectId: string) =>
    apiRequest<EntityStats>(`/analytics/projects/${projectId}/entities/`),

  // Get arc stats
  getArcStats: (projectId: string) =>
    apiRequest<ArcStats>(`/analytics/projects/${projectId}/arcs/`),

  // Get timeline stats
  getTimelineStats: (projectId: string) =>
    apiRequest<TimelineStats>(`/analytics/projects/${projectId}/timeline/`),
};

// ============================================================================
// Export API
// ============================================================================

export interface ExportRequest {
  project_id: string;
  export_type?: string;
  format?: string;
  style?: string;
}

export const exportAPI = {
  // Export project to Markdown
  exportToMarkdown: (projectId: string) =>
    apiRequest<any>(`/export/markdown/`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    }).then((response: any) => {
      // Si la réponse est du texte brut, la retourner directement
      if (typeof response === 'string') {
        return response;
      }
      // Sinon, extraire le contenu markdown
      return response.content || '';
    }),

  // Export entities to CSV
  exportEntitiesToCSV: (projectId: string) =>
    apiRequest<any>(`/export/csv/`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, export_type: "entities" }),
    }).then((response: any) => {
      if (typeof response === 'string') {
        return response;
      }
      return response.content || '';
    }),

  // Export timeline to CSV
  exportTimelineToCSV: (projectId: string) =>
    apiRequest<any>(`/export/csv/`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, export_type: "timeline" }),
    }).then((response: any) => {
      if (typeof response === 'string') {
        return response;
      }
      return response.content || '';
    }),

  // Export arcs to CSV
  exportArcsToCSV: (projectId: string) =>
    apiRequest<any>(`/export/csv/`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, export_type: "arcs" }),
    }).then((response: any) => {
      if (typeof response === 'string') {
        return response;
      }
      return response.content || '';
    }),

  // Enhance text for export
  enhanceText: (projectId: string, text: string, style: string = "professional") =>
    apiRequest<{ enhanced_text: string }>(`/export/enhance/`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, text, style }),
    }),
};
