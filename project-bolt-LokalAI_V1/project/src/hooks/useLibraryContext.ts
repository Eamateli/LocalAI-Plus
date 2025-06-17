import { useState, useEffect, useCallback } from 'react';
import { Library, LibraryContext, ChatSession, Message } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || 'localai-plus-default-key';

export function useLibraryContext() {
  const [libraryContexts, setLibraryContexts] = useState<Record<string, LibraryContext>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Build context for a library
  const buildLibraryContext = useCallback(async (
    library: Library,
    sessions: ChatSession[]
  ): Promise<LibraryContext | null> => {
    if (!library.contextEnabled) return null;

    try {
      setIsLoading(true);

      // Get all sessions in this library
      const librarySessions = sessions.filter(session => 
        session.libraryId === library.id
      );

      // Extract conversation summaries
      const conversationSummaries = librarySessions
        .filter(session => session.messages.length > 0)
        .map(session => {
          const lastMessages = session.messages.slice(-5); // Last 5 messages
          const summary = lastMessages
            .map(msg => `${msg.role}: ${msg.content.slice(0, 100)}`)
            .join(' | ');
          return `[${session.title}] ${summary}`;
        });

      // Extract key insights from session metadata
      const sharedKnowledge = librarySessions
        .flatMap(session => session.extractedInsights || [])
        .filter((insight, index, arr) => arr.indexOf(insight) === index); // Remove duplicates

      // Get active goals
      const activeGoals = library.projectContext?.goals?.filter(goal => !goal.completed) || [];

      // Get completed milestones
      const completedMilestones = library.projectContext?.goals
        ?.filter(goal => goal.completed)
        .map(goal => goal.text) || [];

      // Extract key insights using AI summarization (mock for now)
      const keyInsights = await extractKeyInsights(conversationSummaries);

      const context: LibraryContext = {
        libraryId: library.id,
        conversationSummaries: conversationSummaries.slice(-10), // Keep last 10
        sharedKnowledge,
        activeGoals,
        completedMilestones,
        keyInsights,
        lastUpdated: new Date()
      };

      setLibraryContexts(prev => ({
        ...prev,
        [library.id]: context
      }));

      return context;
    } catch (error) {
      console.error('Error building library context:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extract key insights from conversations (AI-powered)
  const extractKeyInsights = async (summaries: string[]): Promise<string[]> => {
    if (summaries.length === 0) return [];

    try {
      // Mock AI insight extraction - in production, this would call the AI API
      const mockInsights = [
        'Identified key patterns in transformer architecture discussions',
        'Discovered optimization techniques for model fine-tuning',
        'Established best practices for RAG implementation',
        'Documented common pitfalls in AI deployment'
      ];

      // Return relevant insights based on content (simplified)
      return mockInsights.slice(0, Math.min(3, summaries.length));
    } catch (error) {
      console.error('Error extracting insights:', error);
      return [];
    }
  };

  // Inject library context into chat messages
  const injectLibraryContext = useCallback((
    messages: Message[],
    library: Library,
    context?: LibraryContext
  ): Message[] => {
    if (!library.contextEnabled || !context) return messages;

    // Create system message with library context
    const contextMessage: Message = {
      id: `context-${Date.now()}`,
      role: 'system',
      content: buildContextPrompt(library, context),
      timestamp: new Date()
    };

    // Insert context at the beginning (after any existing system messages)
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const otherMessages = messages.filter(msg => msg.role !== 'system');

    return [...systemMessages, contextMessage, ...otherMessages];
  }, []);

  // Build context prompt for AI
  const buildContextPrompt = (library: Library, context: LibraryContext): string => {
    const parts = [];

    // Library instructions
    if (library.projectContext?.systemPrompt) {
      parts.push(`Library Context: ${library.projectContext.systemPrompt}`);
    }

    // Active goals
    if (context.activeGoals.length > 0) {
      parts.push(`Current Goals: ${context.activeGoals.map(g => g.text).join(', ')}`);
    }

    // Key insights
    if (context.keyInsights.length > 0) {
      parts.push(`Key Insights: ${context.keyInsights.join('; ')}`);
    }

    // Recent context
    if (context.conversationSummaries.length > 0) {
      parts.push(`Recent Discussions: ${context.conversationSummaries.slice(-3).join('; ')}`);
    }

    // Knowledge base references
    if (library.projectContext?.knowledgeBase && library.projectContext.knowledgeBase.length > 0) {
      const fileNames = library.projectContext.knowledgeBase.map(f => f.name).join(', ');
      parts.push(`Available Documents: ${fileNames}`);
    }

    return parts.join('\n\n');
  };

  // Update context when session ends
  const updateContextFromSession = useCallback(async (
    session: ChatSession,
    library: Library
  ) => {
    if (!library.contextEnabled) return;

    try {
      // Extract insights from the completed session
      const insights = await extractSessionInsights(session);
      
      // Update session with extracted insights
      session.extractedInsights = insights;

      // Check for goal progress
      await updateGoalProgress(session, library);

      // Rebuild context
      // This would typically be called with all sessions
      // buildLibraryContext(library, [session]);
    } catch (error) {
      console.error('Error updating context from session:', error);
    }
  }, []);

  // Extract insights from a completed session
  const extractSessionInsights = async (session: ChatSession): Promise<string[]> => {
    if (session.messages.length < 3) return [];

    try {
      // Mock insight extraction - in production, use AI
      const content = session.messages
        .map(msg => msg.content)
        .join(' ')
        .toLowerCase();

      const insights = [];

      // Simple keyword-based insight extraction (replace with AI)
      if (content.includes('solution') || content.includes('solved')) {
        insights.push(`Found solution approach in ${session.title}`);
      }
      if (content.includes('error') || content.includes('problem')) {
        insights.push(`Identified issue in ${session.title}`);
      }
      if (content.includes('best practice') || content.includes('recommendation')) {
        insights.push(`Documented best practice from ${session.title}`);
      }

      return insights;
    } catch (error) {
      console.error('Error extracting session insights:', error);
      return [];
    }
  };

  // Update goal progress based on session content
  const updateGoalProgress = async (session: ChatSession, library: Library) => {
    if (!library.projectContext?.goals) return;

    try {
      // Mock goal progress detection - in production, use AI
      const content = session.messages
        .map(msg => msg.content)
        .join(' ')
        .toLowerCase();

      library.projectContext.goals.forEach(goal => {
        if (!goal.completed && content.includes(goal.text.toLowerCase().slice(0, 20))) {
          // Increment progress (simplified)
          goal.progress = Math.min((goal.progress || 0) + 10, 100);
          
          // Mark as completed if progress reaches 100%
          if (goal.progress >= 100) {
            goal.completed = true;
            goal.completedAt = new Date();
          }
        }
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  // Get context for a library
  const getLibraryContext = useCallback((libraryId: string): LibraryContext | null => {
    return libraryContexts[libraryId] || null;
  }, [libraryContexts]);

  // Clear context cache
  const clearContext = useCallback((libraryId?: string) => {
    if (libraryId) {
      setLibraryContexts(prev => {
        const { [libraryId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setLibraryContexts({});
    }
  }, []);

  return {
    buildLibraryContext,
    injectLibraryContext,
    updateContextFromSession,
    getLibraryContext,
    clearContext,
    isLoading,
    libraryContexts
  };
}