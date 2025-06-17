export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  folderId?: string | null;
  settings: Record<string, any>;
  // Enhanced with library context
  libraryId?: string;
  sectionId?: string;
  contextSummary?: string;
  extractedInsights?: string[];
  // Simple chat features
  isStarred?: boolean;
}

export interface ChatFolder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: Date;
  color?: string;
}

// Enhanced Library with Project features
export interface Library {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  sections: LibrarySection[];
  // Enhanced Project Features
  contextEnabled: boolean;
  projectContext?: ProjectContext;
  lastContextUpdate?: Date;
  totalTokensUsed?: number;
  version: '1.0' | '2.0'; // Track enhanced libraries
}

export interface LibrarySection {
  id: string;
  name: string;
  libraryId: string;
  chatCount: number;
  lastActivity: Date;
  color?: string;
  // Enhanced with context tracking
  contextSummary?: string;
  sectionGoals?: string[];
}

// Library III Advanced Structures
export interface LibraryIII {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  sections: LibrarySectionIII[];
  totalChats: number;
  tags: string[];
  isStarred: boolean;
  lastActivity: Date;
  usage: LibraryUsage;
}

export interface LibrarySectionIII {
  id: string;
  name: string;
  libraryId: string;
  chatIds: string[];
  createdAt: Date;
  color?: string;
  description?: string;
  isCollapsed: boolean;
  tags: string[];
  lastActivity: Date;
  usage: SectionUsage;
}

export interface LibraryUsage {
  totalMessages: number;
  averageSessionLength: number;
  mostActiveSection: string;
}

export interface SectionUsage {
  totalMessages: number;
  averageSessionLength: number;
}

// New Project Context interface
export interface ProjectContext {
  systemPrompt?: string;
  modelPreferences?: ModelConfig;
  knowledgeBase?: UploadedFile[];
  goals?: ProjectGoal[];
  persistentMemory?: string;
  autoSummarize: boolean;
  webSources?: string[];
}

export interface ModelConfig {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
  processed: boolean;
}

export interface ProjectGoal {
  id: string;
  text: string;
  completed: boolean;
  sectionId?: string;
  createdAt: Date;
  completedAt?: Date;
  progress?: number;
}

// Cross-chat context management
export interface LibraryContext {
  libraryId: string;
  conversationSummaries: string[];
  sharedKnowledge: string[];
  activeGoals: ProjectGoal[];
  completedMilestones: string[];
  lastUpdated: Date;
  keyInsights: string[];
}

// Enhanced chat context for injection
export interface EnhancedChatContext {
  messages: Message[];
  libraryContext?: {
    libraryName: string;
    libraryInstructions?: string;
    recentInsights: string[];
    availableKnowledge: string[];
    currentGoals: string[];
    sectionContext?: string;
  };
}

// Library II Advanced Features
export interface LibraryIISystem {
  smartOrganization: SmartOrganization;
  analytics: AnalyticsDashboard;
  crossLibraryFeatures: CrossLibraryFeatures;
  advancedSearch: AdvancedSearchFeatures;
}

export interface SmartOrganization {
  aiSuggestions: boolean;
  contentAnalysis: boolean;
  topicDetection: boolean;
  duplicateDetection: boolean;
  autoTagging: boolean;
}

export interface AnalyticsDashboard {
  totalConversations: number;
  knowledgeDomains: number;
  trendingTopics: string[];
  growthRate: number;
  topCategories: CategoryStats[];
}

export interface CategoryStats {
  name: string;
  count: number;
  growth: number;
}

export interface CrossLibraryFeatures {
  findSimilar: boolean;
  suggestMerge: boolean;
  duplicateAlert: boolean;
  knowledgeGaps: boolean;
  crossReference: boolean;
}

export interface AdvancedSearchFeatures {
  semanticSearch: boolean;
  timelineSearch: boolean;
  tagBasedFiltering: boolean;
  relationshipMapping: boolean;
  contentAnalysis: boolean;
  conceptClustering: boolean;
}

// Projects System (Claude-style)
export interface ProjectsSystem {
  workspaces: ProjectWorkspace[];
  templates: ProjectTemplate[];
  contextManager: ProjectContextManager;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'active' | 'planning' | 'completed' | 'archived';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  model: string;
  contextTokens: number;
  goals: ProjectGoal[];
  knowledgeBase: ProjectFile[];
  conversations: ProjectConversation[];
  aiContext: string;
  persistentMemory: string;
  customInstructions: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultGoals: string[];
  systemPrompt: string;
  sections: string[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  processed: boolean;
  content?: string;
}

export interface ProjectConversation {
  id: string;
  title: string;
  messages: number;
  lastActivity: Date;
  projectId: string;
}

export interface ProjectContextManager {
  persistentMemory: Record<string, string>;
  conversationSummaries: Record<string, string[]>;
  keyDecisions: Record<string, Decision[]>;
  activeGoals: Record<string, ProjectGoal[]>;
  knowledgeConnections: Record<string, Connection[]>;
}

export interface Decision {
  id: string;
  text: string;
  context: string;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
}

export interface Connection {
  from: string;
  to: string;
  type: 'reference' | 'dependency' | 'similarity' | 'evolution';
  strength: number;
}

// Unified Data Access
export interface UnifiedDataAccess {
  allChats: ChatSession[];
  libraryData: Library[];
  libraryIIData: LibraryIISystem;
  projectsData: ProjectsSystem;
  chatToLibraryMapping: Record<string, string>;
  chatToProjectMapping: Record<string, string>;
  crossSystemInsights: Insight[];
  relatedContentSuggestions: Suggestion[];
  knowledgeConnections: Connection[];
}

export interface Insight {
  id: string;
  type: 'pattern' | 'gap' | 'connection' | 'trend';
  title: string;
  description: string;
  confidence: number;
  sources: string[];
  timestamp: Date;
}

export interface Suggestion {
  id: string;
  type: 'organize' | 'link' | 'merge' | 'create';
  title: string;
  description: string;
  action: string;
  confidence: number;
  targetSystem: 'library' | 'library-ii' | 'projects';
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  format?: string;
  loaded?: boolean;
  config?: Record<string, any>;
}

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: FunctionCall;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  source?: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface RAGSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export interface ExecutionResult {
  id: string;
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  exitCode: number;
}