import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// Storage keys for tracking milestones
const STORAGE_KEYS = {
  AI_INTERACTIONS: 'review_ai_interactions',
  CONTENT_COUNT: 'review_content_count',
  COLLECTIONS_DATA: 'review_collections_data',
  SEARCH_INTERACTIONS: 'review_search_interactions',
  ORGANIZATION_SESSIONS: 'review_organization_sessions',
  LAST_REVIEW_REQUEST: 'review_last_request',
  REVIEW_REQUESTED_COUNT: 'review_requested_count',
} as const;

// Milestone thresholds
const MILESTONES = {
  AI_FIRST_SUCCESS: 1,
  CONTENT_LIBRARY: 15,
  COLLECTION_ITEMS: 3,
  SEARCH_SUCCESS: 1,
  ORGANIZATION_ACTIONS: 3,
} as const;

// Review request limits
const REVIEW_LIMITS = {
  MAX_REQUESTS: 3, // Maximum times to ask for review
  MIN_DAYS_BETWEEN: 30, // Minimum days between review requests
} as const;

export interface CollectionData {
  id: string;
  itemCount: number;
  createdAt: number;
}

export interface SearchInteraction {
  query: string;
  resultsFound: boolean;
  interacted: boolean;
  timestamp: number;
}

export interface OrganizationSession {
  actions: number;
  startTime: number;
  endTime: number;
}

class ReviewTriggerService {
  // Check if we can request a review (respecting frequency limits)
  private async canRequestReview(): Promise<boolean> {
    try {
      const lastRequestStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REVIEW_REQUEST);
      const requestCountStr = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED_COUNT);
      
      const requestCount = requestCountStr ? parseInt(requestCountStr) : 0;
      
      // Don't ask if we've already requested the maximum times
      if (requestCount >= REVIEW_LIMITS.MAX_REQUESTS) {
        return false;
      }

      if (lastRequestStr) {
        const lastRequest = parseInt(lastRequestStr);
        const daysSinceLastRequest = (Date.now() - lastRequest) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastRequest < REVIEW_LIMITS.MIN_DAYS_BETWEEN) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }
  }

  // Request store review with proper checks
  private async requestReview(): Promise<void> {
    try {
      const canRequest = await this.canRequestReview();
      if (!canRequest) {
        return;
      }

      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        await StoreReview.requestReview();
        
        // Update tracking
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_REVIEW_REQUEST, Date.now().toString());
        const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED_COUNT);
        const newCount = (currentCount ? parseInt(currentCount) : 0) + 1;
        await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED_COUNT, newCount.toString());
        
        console.log('Store review requested successfully');
      }
    } catch (error) {
      console.error('Error requesting review:', error);
    }
  }

  // Track AI interaction completion
  async trackAIInteraction(): Promise<void> {
    try {
      const currentCountStr = await AsyncStorage.getItem(STORAGE_KEYS.AI_INTERACTIONS);
      const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;
      const newCount = currentCount + 1;
      
      await AsyncStorage.setItem(STORAGE_KEYS.AI_INTERACTIONS, newCount.toString());
      
      // Trigger review on first successful AI interaction
      if (newCount === MILESTONES.AI_FIRST_SUCCESS) {
        console.log('🎉 AI Milestone reached! Requesting review...');
        await this.requestReview();
      }
    } catch (error) {
      console.error('Error tracking AI interaction:', error);
    }
  }

  // Track content addition (links, notes, documents, etc.)
  async trackContentAddition(): Promise<void> {
    try {
      const currentCountStr = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT_COUNT);
      const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;
      const newCount = currentCount + 1;
      
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT_COUNT, newCount.toString());
      
      // Trigger review when reaching content library milestone
      if (newCount === MILESTONES.CONTENT_LIBRARY) {
        console.log('📚 Content Library Milestone reached! Requesting review...');
        await this.requestReview();
      }
    } catch (error) {
      console.error('Error tracking content addition:', error);
    }
  }

  // Track collection creation and item additions
  async trackCollectionItemAddition(collectionId: string): Promise<void> {
    try {
      const collectionsDataStr = await AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS_DATA);
      const collectionsData: CollectionData[] = collectionsDataStr ? JSON.parse(collectionsDataStr) : [];
      
      const existingCollection = collectionsData.find(c => c.id === collectionId);
      
      if (existingCollection) {
        existingCollection.itemCount += 1;
        
        // Check if this collection just reached the milestone
        if (existingCollection.itemCount === MILESTONES.COLLECTION_ITEMS) {
          console.log('📁 Collection Milestone reached! Requesting review...');
          await this.requestReview();
        }
      } else {
        // New collection with first item
        collectionsData.push({
          id: collectionId,
          itemCount: 1,
          createdAt: Date.now(),
        });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS_DATA, JSON.stringify(collectionsData));
    } catch (error) {
      console.error('Error tracking collection item addition:', error);
    }
  }

  // Track successful search interactions
  async trackSearchInteraction(query: string, resultsFound: boolean): Promise<void> {
    try {
      const interactionsStr = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_INTERACTIONS);
      const interactions: SearchInteraction[] = interactionsStr ? JSON.parse(interactionsStr) : [];
      
      const newInteraction: SearchInteraction = {
        query,
        resultsFound,
        interacted: false,
        timestamp: Date.now(),
      };
      
      interactions.push(newInteraction);
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_INTERACTIONS, JSON.stringify(interactions));
    } catch (error) {
      console.error('Error tracking search interaction:', error);
    }
  }

  // Track when user clicks on search results
  async trackSearchResultInteraction(): Promise<void> {
    try {
      const interactionsStr = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_INTERACTIONS);
      const interactions: SearchInteraction[] = interactionsStr ? JSON.parse(interactionsStr) : [];
      
      // Mark the most recent search as interacted
      if (interactions.length > 0) {
        const lastInteraction = interactions[interactions.length - 1];
        if (!lastInteraction.interacted && lastInteraction.resultsFound) {
          lastInteraction.interacted = true;
          
          // Count successful search interactions
          const successfulInteractions = interactions.filter(i => i.interacted && i.resultsFound).length;
          
          if (successfulInteractions === MILESTONES.SEARCH_SUCCESS) {
            console.log('🔍 Search Milestone reached! Requesting review...');
            await this.requestReview();
          }
          
          await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_INTERACTIONS, JSON.stringify(interactions));
        }
      }
    } catch (error) {
      console.error('Error tracking search result interaction:', error);
    }
  }

  // Start tracking an organization session
  async startOrganizationSession(): Promise<string> {
    const sessionId = Date.now().toString();
    const session: OrganizationSession = {
      actions: 0,
      startTime: Date.now(),
      endTime: 0,
    };
    
    try {
      await AsyncStorage.setItem(`org_session_${sessionId}`, JSON.stringify(session));
      return sessionId;
    } catch (error) {
      console.error('Error starting organization session:', error);
      return sessionId;
    }
  }

  // Track organization actions (moving items, adding tags, etc.)
  async trackOrganizationAction(sessionId: string): Promise<void> {
    try {
      const sessionStr = await AsyncStorage.getItem(`org_session_${sessionId}`);
      if (!sessionStr) return;
      
      const session: OrganizationSession = JSON.parse(sessionStr);
      session.actions += 1;
      
      await AsyncStorage.setItem(`org_session_${sessionId}`, JSON.stringify(session));
    } catch (error) {
      console.error('Error tracking organization action:', error);
    }
  }

  // End organization session and check for milestone
  async endOrganizationSession(sessionId: string): Promise<void> {
    try {
      const sessionStr = await AsyncStorage.getItem(`org_session_${sessionId}`);
      if (!sessionStr) return;
      
      const session: OrganizationSession = JSON.parse(sessionStr);
      session.endTime = Date.now();
      
      // Check if this session qualifies for milestone
      if (session.actions >= MILESTONES.ORGANIZATION_ACTIONS) {
        console.log('🗂️ Organization Milestone reached! Requesting review...');
        await this.requestReview();
      }
      
      // Clean up session data
      await AsyncStorage.removeItem(`org_session_${sessionId}`);
      
      // Store completed session for analytics if needed
      const sessionsStr = await AsyncStorage.getItem(STORAGE_KEYS.ORGANIZATION_SESSIONS);
      const sessions: OrganizationSession[] = sessionsStr ? JSON.parse(sessionsStr) : [];
      sessions.push(session);
      
      // Keep only last 10 sessions to avoid storage bloat
      if (sessions.length > 10) {
        sessions.splice(0, sessions.length - 10);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ORGANIZATION_SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error ending organization session:', error);
    }
  }

  // Get current milestone progress (for debugging/analytics)
  async getMilestoneProgress(): Promise<{
    aiInteractions: number;
    contentCount: number;
    collectionsData: CollectionData[];
    searchInteractions: number;
    organizationSessions: number;
    reviewRequestCount: number;
  }> {
    try {
      const [
        aiInteractions,
        contentCount,
        collectionsData,
        searchInteractions,
        organizationSessions,
        reviewRequestCount
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AI_INTERACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CONTENT_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.SEARCH_INTERACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.ORGANIZATION_SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED_COUNT),
      ]);

      return {
        aiInteractions: aiInteractions ? parseInt(aiInteractions) : 0,
        contentCount: contentCount ? parseInt(contentCount) : 0,
        collectionsData: collectionsData ? JSON.parse(collectionsData) : [],
        searchInteractions: searchInteractions ? JSON.parse(searchInteractions).filter((i: SearchInteraction) => i.interacted && i.resultsFound).length : 0,
        organizationSessions: organizationSessions ? JSON.parse(organizationSessions).length : 0,
        reviewRequestCount: reviewRequestCount ? parseInt(reviewRequestCount) : 0,
      };
    } catch (error) {
      console.error('Error getting milestone progress:', error);
      return {
        aiInteractions: 0,
        contentCount: 0,
        collectionsData: [],
        searchInteractions: 0,
        organizationSessions: 0,
        reviewRequestCount: 0,
      };
    }
  }
}

export const reviewTriggerService = new ReviewTriggerService(); 