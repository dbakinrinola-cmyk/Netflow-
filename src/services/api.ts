/**
 * NETFLOW Client API Service
 * Centralized fetch helpers with JWT token and real-time SSE listener
 */

import { User, Post, Community, Message, Conversation, NotificationItem, Quiz, PDFMaterial, LearningCategory } from '../types/index.js';

const TOKEN_KEY = 'netflow_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User }> {
    return apiFetch('/api/auth/me');
  },
  async login(email: string): Promise<{ user: User; token: string }> {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setStoredToken(data.token);
    return data;
  },
  async register(payload: Partial<User> & { password?: string }): Promise<{ user: User; token: string }> {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(data.token);
    return data;
  },
  async demoLogin(userId: string): Promise<{ user: User; token: string }> {
    const data = await apiFetch('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    setStoredToken(data.token);
    return data;
  },
  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    return apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },

  // Posts & Feed
  async getPosts(params: { feedType?: string; category?: string; search?: string; authorId?: string }): Promise<{ posts: Post[] }> {
    const query = new URLSearchParams();
    if (params.feedType) query.set('feedType', params.feedType);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.authorId) query.set('authorId', params.authorId);
    return apiFetch(`/api/posts?${query.toString()}`);
  },
  async createPost(post: Partial<Post>): Promise<{ post: Post }> {
    return apiFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },
  async likePost(postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
  },
  async bookmarkPost(postId: string): Promise<{ isBookmarked: boolean; bookmarksCount: number }> {
    return apiFetch(`/api/posts/${postId}/bookmark`, { method: 'POST' });
  },
  async repost(postId: string): Promise<{ repostsCount: number }> {
    return apiFetch(`/api/posts/${postId}/repost`, { method: 'POST' });
  },
  async getComments(postId: string): Promise<{ comments: any[] }> {
    return apiFetch(`/api/posts/${postId}/comments`);
  },
  async addComment(postId: string, content: string): Promise<{ comment: any; commentsCount: number }> {
    return apiFetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  async deletePost(postId: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
  },

  // Users
  async getUser(id: string): Promise<{ user: User; isFollowing: boolean }> {
    return apiFetch(`/api/users/${id}`);
  },
  async getRecommendedTeachers(): Promise<{ teachers: User[] }> {
    return apiFetch('/api/users/recommended-teachers');
  },
  async followUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    return apiFetch(`/api/users/${userId}/follow`, { method: 'POST' });
  },
  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async searchUsers(query: string): Promise<{ users: User[] }> {
    return apiFetch(`/api/users/search?q=${encodeURIComponent(query)}`);
  },

  // Communities
  async getCommunities(category?: string): Promise<{ communities: Community[] }> {
    const url = category ? `/api/communities?category=${encodeURIComponent(category)}` : '/api/communities';
    return apiFetch(url);
  },
  async getCommunity(id: string): Promise<{ community: Community }> {
    return apiFetch(`/api/communities/${id}`);
  },
  async joinCommunity(id: string): Promise<{ isJoined: boolean; membersCount: number }> {
    return apiFetch(`/api/communities/${id}/join`, { method: 'POST' });
  },
  async createCommunity(data: Partial<Community>): Promise<{ community: Community }> {
    return apiFetch('/api/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Materials & Quizzes
  async uploadMaterial(data: Partial<PDFMaterial>): Promise<{ material: PDFMaterial }> {
    return apiFetch('/api/materials/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getMaterials(): Promise<{ materials: PDFMaterial[] }> {
    return apiFetch('/api/materials');
  },
  async createQuiz(data: Partial<Quiz>): Promise<{ quiz: Quiz }> {
    return apiFetch('/api/quizzes/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async submitQuiz(quizId: string, answers: number[]): Promise<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    results: any[];
    passed: boolean;
  }> {
    return apiFetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Messages
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    return apiFetch('/api/messages/conversations');
  },
  async getMessages(conversationId: string): Promise<{ messages: Message[] }> {
    return apiFetch(`/api/messages/${conversationId}`);
  },
  async sendMessage(payload: {
    conversationId?: string;
    recipientId?: string;
    content: string;
    attachmentType?: string;
    attachmentTitle?: string;
    attachmentUrl?: string;
  }): Promise<{ message: Message; conversationId: string }> {
    return apiFetch('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return apiFetch('/api/notifications');
  },
  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return apiFetch('/api/notifications/read-all', { method: 'POST' });
  },

  // AI Services (Gemini 3.8 Flash)
  async aiChat(message: string, history: any[], contextSubject?: string): Promise<{ text: string; actionSuggestions: string[] }> {
    return apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, contextSubject }),
    });
  },
  async aiExplain(topic: string, level: string, category: string): Promise<{ explanation: string }> {
    return apiFetch('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ topic, level, category }),
    });
  },
  async aiHomeworkGuide(problemStatement: string, subject: string, studentAttempt?: string): Promise<{
    explanation: string;
    hints: string[];
    nextStepPrompt: string;
  }> {
    return apiFetch('/api/ai/homework-guide', {
      method: 'POST',
      body: JSON.stringify({ problemStatement, subject, studentAttempt }),
    });
  },
  async aiSummarize(content: string, subject: string): Promise<{
    summary: string;
    keyTakeaways: string[];
    flashcards: { term: string; definition: string }[];
  }> {
    return apiFetch('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ content, subject }),
    });
  },
  async aiGenerateQuiz(topic: string, category: string, difficulty?: string): Promise<{ quiz: Partial<Quiz> }> {
    return apiFetch('/api/ai/generate-quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, category, difficulty }),
    });
  },
  async aiStudyPlan(targetGoal: string, subject: string, hoursPerDay: number): Promise<{
    schedule: { day: string; title: string; tasks: string[]; timeMinutes: number }[];
    proTip: string;
  }> {
    return apiFetch('/api/ai/study-plan', {
      method: 'POST',
      body: JSON.stringify({ targetGoal, subject, hoursPerDay }),
    });
  },
};
