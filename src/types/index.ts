/**
 * NETFLOW Type Definitions
 * Connect. Discover. Learn. Grow.
 */

export type UserRole = 'student' | 'teacher' | 'institution' | 'creator';

export type LearningCategory =
  | 'Mathematics'
  | 'English Language'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Artificial Intelligence'
  | 'Programming'
  | 'History'
  | 'Geography'
  | 'Economics'
  | 'Languages'
  | 'Music and Creative Arts'
  | 'Professional Development';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  institution?: string;
  department?: string;
  gradeLevel?: string;
  verifiedEducator: boolean;
  subjects: LearningCategory[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  savedCount: number;
  rating?: number; // For teachers
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: LearningCategory;
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  submissionsCount: number;
  avgScore: number;
  createdAt: string;
}

export interface PDFMaterial {
  id: string;
  title: string;
  description: string;
  category: LearningCategory;
  pageCount: number;
  fileSize: string;
  downloadUrl: string;
  previewPages: string[];
  authorId: string;
  authorName: string;
  downloadsCount: number;
  createdAt: string;
}

export type PostType = 'text' | 'image' | 'video' | 'pdf' | 'quiz' | 'flow';

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    role: UserRole;
    verifiedEducator?: boolean;
  };
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    role: UserRole;
    institution?: string;
    verifiedEducator?: boolean;
  };
  type: PostType;
  category: LearningCategory;
  title?: string;
  content: string;
  mediaUrl?: string;
  mediaAspectRatio?: string;
  pdfMaterial?: PDFMaterial;
  quiz?: Quiz;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  createdAt: string;
  readTime?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: LearningCategory;
  coverImage: string;
  avatar: string;
  type: 'subject' | 'school' | 'study_group';
  institution?: string;
  membersCount: number;
  postsCount: number;
  isJoined?: boolean;
  moderators: string[];
  rules: string[];
  announcement?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string;
  content: string;
  attachmentType?: 'image' | 'pdf' | 'quiz_link';
  attachmentUrl?: string;
  attachmentTitle?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
  };
  type: 'like' | 'comment' | 'follow' | 'message' | 'community' | 'ai_recommendation';
  title: string;
  message: string;
  targetId?: string;
  targetType?: 'post' | 'quiz' | 'community' | 'message';
  read: boolean;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionSuggestions?: string[];
  quizData?: Quiz;
  formula?: string;
}
