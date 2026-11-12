/**
 * NETFLOW Express Application
 * Exportable app configuration for local, Docker, and Vercel Serverless deployments.
 */

import express, { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import {
  generateAIChatResponse,
  explainSubjectConcept,
  guideHomeworkProblem,
  summarizeLearningMaterial,
  generateQuizFromTopic,
  generateStudyPlan,
} from './gemini.js';
import { User, Post, Community, Message, Conversation, NotificationItem, Quiz, PDFMaterial } from '../types/index.js';

export const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Simulated JWT Token Helpers
function generateToken(userId: string): string {
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded.exp && decoded.exp > Date.now()) {
      return { userId: decoded.userId };
    }
    return null;
  } catch {
    return null;
  }
}

// Authentication Middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    (req as any).user = db.users.get('u_alex');
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  const verified = verifyToken(token);
  if (verified && db.users.has(verified.userId)) {
    (req as any).user = db.users.get(verified.userId);
  } else {
    (req as any).user = db.users.get('u_alex');
  }
  next();
}

// In-Memory SSE Client Connections for Real-Time Socket-Like Events
const sseClients: { id: string; res: Response; userId?: string }[] = [];

export function broadcastEvent(event: string, data: any, targetUserId?: string) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    if (!targetUserId || client.userId === targetUserId) {
      try {
        client.res.write(payload);
      } catch (err) {
        // Connection dropped
      }
    }
  });
}

// -------------------------------------------------------------
// Real-Time Event Stream (SSE)
// -------------------------------------------------------------
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `${Date.now()}_${Math.random()}`;
  sseClients.push({ id: clientId, res, userId });

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) sseClients.splice(index, 1);
  });
});

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, institution, subjects, bio } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  for (const existing of db.users.values()) {
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
  }

  const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
  const newUser: User = {
    id: `u_${Date.now()}`,
    username,
    name,
    email,
    role: role || 'student',
    avatar: role === 'teacher'
      ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    bio: bio || (role === 'teacher' ? `Educator in ${institution || 'Higher Education'}` : 'Student eager to connect and learn.'),
    institution: institution || (role === 'teacher' ? 'Independent Educator' : 'High School / University'),
    verifiedEducator: role === 'teacher' || role === 'institution',
    subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects : ['Mathematics', 'Computer Science'],
    followersCount: 0,
    followingCount: 3,
    postsCount: 0,
    savedCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.users.set(newUser.id, newUser);
  db.follows.set(newUser.id, new Set(['u_elena', 'u_marcus', 'u_maya']));

  const token = generateToken(newUser.id);
  res.json({ user: newUser, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  let foundUser: User | undefined;
  for (const user of db.users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'No account found with this email. Please check or register.' });
  }

  const token = generateToken(foundUser.id);
  res.json({ user: foundUser, token });
});

app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.users.get(userId || 'u_alex');
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found.' });
  }
  const token = generateToken(user.id);
  res.json({ user, token });
});

app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
});

// Password Recovery
const passwordResetTokens = new Map<string, { email: string; expires: number }>();

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const resetToken = `reset_${Math.random().toString(36).substring(2, 10)}`;
  passwordResetTokens.set(resetToken, { email, expires: Date.now() + 30 * 60 * 1000 });

  res.json({
    success: true,
    message: `A password reset instruction link has been generated for ${email}.`,
    resetToken,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required.' });
  }
  const entry = passwordResetTokens.get(resetToken);
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired password reset link.' });
  }

  passwordResetTokens.delete(resetToken);
  res.json({ success: true, message: 'Your password has been successfully updated. You may now sign in.' });
});

// -------------------------------------------------------------
// Feed & Posts Endpoints
// -------------------------------------------------------------
app.get('/api/posts', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const feedType = (req.query.feedType as string) || 'for_you';
  const category = req.query.category as string;
  const search = (req.query.search as string || '').toLowerCase();
  const authorId = req.query.authorId as string;

  let allPosts = Array.from(db.posts.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (authorId) {
    allPosts = allPosts.filter((p) => p.author.id === authorId);
  }

  if (category && category !== 'All') {
    allPosts = allPosts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    allPosts = allPosts.filter(
      (p) =>
        p.content.toLowerCase().includes(search) ||
        p.title?.toLowerCase().includes(search) ||
        p.hashtags.some((h) => h.toLowerCase().includes(search)) ||
        p.author.name.toLowerCase().includes(search)
    );
  }

  if (feedType === 'following' && currentUser) {
    const followingSet = db.follows.get(currentUser.id) || new Set();
    allPosts = allPosts.filter((p) => followingSet.has(p.author.id) || p.author.id === currentUser.id);
  } else if (feedType === 'bookmarks' && currentUser) {
    const userBookmarks = db.bookmarks.get(currentUser.id) || new Set();
    allPosts = allPosts.filter((p) => userBookmarks.has(p.id));
  } else if (feedType === 'flows') {
    allPosts = allPosts.filter((p) => p.type === 'flow' || p.type === 'video');
  }

  const userLikes = currentUser ? db.likes : new Map();
  const userBookmarksSet = currentUser ? db.bookmarks.get(currentUser.id) || new Set() : new Set();

  const enrichedPosts = allPosts.map((post) => {
    const postLikes = userLikes.get(post.id) || new Set();
    return {
      ...post,
      isLiked: currentUser ? postLikes.has(currentUser.id) : false,
      isBookmarked: userBookmarksSet.has(post.id),
      likesCount: postLikes.size || post.likesCount,
    };
  });

  res.json({ posts: enrichedPosts });
});

app.post('/api/posts', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const { title, content, type, category, mediaUrl, mediaAspectRatio, hashtags, pdfMaterial, quiz } = req.body;

  if (!content && !mediaUrl && !pdfMaterial && !quiz) {
    return res.status(400).json({ error: 'Post must contain text content or learning material.' });
  }

  const newPost: Post = {
    id: `post_${Date.now()}`,
    author: {
      id: currentUser.id,
      name: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role,
      institution: currentUser.institution,
      verifiedEducator: currentUser.verifiedEducator,
    },
    type: type || 'text',
    category: category || 'General Education',
    title: title || undefined,
    content: content || '',
    mediaUrl: mediaUrl || undefined,
    mediaAspectRatio: mediaAspectRatio || (type === 'flow' ? '9:16' : '16:9'),
    hashtags: Array.isArray(hashtags) ? hashtags : [],
    pdfMaterial: pdfMaterial || undefined,
    quiz: quiz || undefined,
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    bookmarksCount: 0,
    createdAt: new Date().toISOString(),
    readTime: '2 min read',
  };

  db.posts.set(newPost.id, newPost);
  currentUser.postsCount += 1;

  broadcastEvent('new_post', newPost);
  res.status(201).json({ post: newPost });
});

app.post('/api/posts/:id/like', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const postId = req.params.id;
  const post = db.posts.get(postId);

  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (!db.likes.has(postId)) {
    db.likes.set(postId, new Set());
  }

  const postLikes = db.likes.get(postId)!;
  let isLiked = false;

  if (postLikes.has(currentUser.id)) {
    postLikes.delete(currentUser.id);
    post.likesCount = Math.max(0, postLikes.size);
    isLiked = false;
  } else {
    postLikes.add(currentUser.id);
    post.likesCount = postLikes.size;
    isLiked = true;

    if (post.author.id !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: post.author.id,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
        type: 'like',
        title: 'Post Liked',
        message: `${currentUser.name} liked your post on ${post.category}.`,
        targetId: post.id,
        targetType: 'post',
        read: false,
        createdAt: new Date().toISOString(),
      };
      if (!db.notifications.has(post.author.id)) {
        db.notifications.set(post.author.id, []);
      }
      db.notifications.get(post.author.id)!.unshift(notif);
      broadcastEvent('notification', notif, post.author.id);
    }
  }

  res.json({ isLiked, likesCount: post.likesCount });
});

app.post('/api/posts/:id/bookmark', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const postId = req.params.id;
  const post = db.posts.get(postId);

  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (!db.bookmarks.has(currentUser.id)) {
    db.bookmarks.set(currentUser.id, new Set());
  }

  const userBookmarks = db.bookmarks.get(currentUser.id)!;
  let isBookmarked = false;

  if (userBookmarks.has(postId)) {
    userBookmarks.delete(postId);
    post.bookmarksCount = Math.max(0, post.bookmarksCount - 1);
    currentUser.savedCount = Math.max(0, currentUser.savedCount - 1);
    isBookmarked = false;
  } else {
    userBookmarks.add(postId);
    post.bookmarksCount += 1;
    currentUser.savedCount += 1;
    isBookmarked = true;
  }

  res.json({ isBookmarked, bookmarksCount: post.bookmarksCount });
});

app.post('/api/posts/:id/repost', authMiddleware, (req: Request, res: Response) => {
  const postId = req.params.id;
  const post = db.posts.get(postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  post.repostsCount += 1;
  res.json({ repostsCount: post.repostsCount });
});

app.get('/api/posts/:id/comments', (req: Request, res: Response) => {
  const postId = req.params.id;
  const comments = db.comments.get(postId) || [];
  res.json({ comments });
});

app.post('/api/posts/:id/comments', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const postId = req.params.id;
  const { content } = req.body;

  const post = db.posts.get(postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  const newComment = {
    id: `c_${Date.now()}`,
    postId,
    author: {
      id: currentUser.id,
      name: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role,
      verifiedEducator: currentUser.verifiedEducator,
    },
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likesCount: 0,
  };

  if (!db.comments.has(postId)) {
    db.comments.set(postId, []);
  }
  db.comments.get(postId)!.push(newComment);
  post.commentsCount += 1;

  if (post.author.id !== currentUser.id) {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: post.author.id,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      type: 'comment',
      title: 'New Comment',
      message: `${currentUser.name} commented on your ${post.category} post: "${content.slice(0, 50)}..."`,
      targetId: postId,
      targetType: 'post',
      read: false,
      createdAt: new Date().toISOString(),
    };
    if (!db.notifications.has(post.author.id)) {
      db.notifications.set(post.author.id, []);
    }
    db.notifications.get(post.author.id)!.unshift(notif);
    broadcastEvent('notification', notif, post.author.id);
  }

  broadcastEvent('new_comment', newComment);
  res.status(201).json({ comment: newComment, commentsCount: post.commentsCount });
});

app.delete('/api/posts/:id', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const postId = req.params.id;
  const post = db.posts.get(postId);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (post.author.id !== currentUser.id && currentUser.role !== 'institution') {
    return res.status(403).json({ error: 'Permission denied to delete this post.' });
  }

  db.posts.delete(postId);
  db.comments.delete(postId);
  res.json({ success: true });
});

// -------------------------------------------------------------
// Users & Follows
// -------------------------------------------------------------
app.get('/api/users/recommended-teachers', (req: Request, res: Response) => {
  const teachers = Array.from(db.users.values()).filter(
    (u) => u.role === 'teacher' || u.role === 'creator' || u.verifiedEducator
  );
  res.json({ teachers });
});

app.get('/api/users/search', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase();
  const results = Array.from(db.users.values()).filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.subjects.some((s) => s.toLowerCase().includes(q)) ||
      u.institution?.toLowerCase().includes(q)
  );
  res.json({ users: results });
});

app.get('/api/users/:id', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const followingSet = currentUser ? db.follows.get(currentUser.id) || new Set() : new Set();
  const isFollowing = followingSet.has(user.id);

  res.json({ user, isFollowing });
});

app.post('/api/users/:id/follow', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const targetId = req.params.id;
  const targetUser = db.users.get(targetId);

  if (!targetUser) return res.status(404).json({ error: 'User not found.' });
  if (currentUser.id === targetId) return res.status(400).json({ error: 'Cannot follow yourself.' });

  if (!db.follows.has(currentUser.id)) {
    db.follows.set(currentUser.id, new Set());
  }

  const followingSet = db.follows.get(currentUser.id)!;
  let isFollowing = false;

  if (followingSet.has(targetId)) {
    followingSet.delete(targetId);
    currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
    targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    isFollowing = false;
  } else {
    followingSet.add(targetId);
    currentUser.followingCount += 1;
    targetUser.followersCount += 1;
    isFollowing = true;

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetId,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      type: 'follow',
      title: 'New Follower',
      message: `${currentUser.name} started following your educational updates.`,
      targetId: currentUser.id,
      targetType: 'post',
      read: false,
      createdAt: new Date().toISOString(),
    };
    if (!db.notifications.has(targetId)) {
      db.notifications.set(targetId, []);
    }
    db.notifications.get(targetId)!.unshift(notif);
    broadcastEvent('notification', notif, targetId);
  }

  res.json({ isFollowing, followersCount: targetUser.followersCount });
});

app.put('/api/users/profile', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const { name, bio, institution, department, gradeLevel, subjects, avatar } = req.body;

  if (name) currentUser.name = name;
  if (bio !== undefined) currentUser.bio = bio;
  if (institution !== undefined) currentUser.institution = institution;
  if (department !== undefined) currentUser.department = department;
  if (gradeLevel !== undefined) currentUser.gradeLevel = gradeLevel;
  if (Array.isArray(subjects)) currentUser.subjects = subjects;
  if (avatar) currentUser.avatar = avatar;

  db.users.set(currentUser.id, currentUser);
  res.json({ user: currentUser });
});

// -------------------------------------------------------------
// Communities & Discussions
// -------------------------------------------------------------
app.get('/api/communities', authMiddleware, (req: Request, res: Response) => {
  const category = req.query.category as string;
  let list = Array.from(db.communities.values());

  if (category && category !== 'All') {
    list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  res.json({ communities: list });
});

app.get('/api/communities/:id', (req: Request, res: Response) => {
  const comm = db.communities.get(req.params.id);
  if (!comm) return res.status(404).json({ error: 'Community not found.' });
  res.json({ community: comm });
});

app.post('/api/communities/:id/join', authMiddleware, (req: Request, res: Response) => {
  const comm = db.communities.get(req.params.id);
  if (!comm) return res.status(404).json({ error: 'Community not found.' });

  comm.isJoined = !comm.isJoined;
  comm.membersCount += comm.isJoined ? 1 : -1;

  res.json({ isJoined: comm.isJoined, membersCount: comm.membersCount });
});

app.post('/api/communities', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const { name, description, category, type, institution, rules } = req.body;

  if (!name || !description || !category) {
    return res.status(400).json({ error: 'Name, description and category required.' });
  }

  const newComm: Community = {
    id: `comm_${Date.now()}`,
    name,
    description,
    category,
    type: type || 'subject',
    institution: institution || undefined,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    membersCount: 1,
    postsCount: 0,
    isJoined: true,
    moderators: [currentUser.id],
    rules: Array.isArray(rules) && rules.length > 0 ? rules : ['Be supportive and share educational knowledge.'],
    createdAt: new Date().toISOString(),
  };

  db.communities.set(newComm.id, newComm);
  res.status(201).json({ community: newComm });
});

// -------------------------------------------------------------
// Direct Messaging & Study Rooms
// -------------------------------------------------------------
app.get('/api/messages/conversations', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const convs = Array.from(db.conversations.values()).filter((c) =>
    c.participants.some((p) => p.id === currentUser.id)
  );

  const enriched = convs.map((c) => {
    const msgs = db.messages.get(c.id) || [];
    return {
      ...c,
      lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : undefined,
    };
  });

  res.json({ conversations: enriched });
});

app.get('/api/messages/:conversationId', authMiddleware, (req: Request, res: Response) => {
  const convId = req.params.conversationId;
  const msgs = db.messages.get(convId) || [];
  res.json({ messages: msgs });
});

app.post('/api/messages/send', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const { conversationId, recipientId, content, attachmentType, attachmentTitle, attachmentUrl } = req.body;

  if (!content && !attachmentUrl) {
    return res.status(400).json({ error: 'Message content or attachment required.' });
  }

  let convId = conversationId;
  if (!convId && recipientId) {
    for (const c of db.conversations.values()) {
      if (
        c.type === 'direct' &&
        c.participants.some((p) => p.id === currentUser.id) &&
        c.participants.some((p) => p.id === recipientId)
      ) {
        convId = c.id;
        break;
      }
    }

    if (!convId) {
      const recipient = db.users.get(recipientId);
      if (!recipient) return res.status(404).json({ error: 'Recipient not found.' });

      convId = `conv_${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        type: 'direct',
        participants: [currentUser, recipient],
        unreadCount: 1,
        updatedAt: new Date().toISOString(),
      };
      db.conversations.set(convId, newConv);
    }
  }

  const newMsg: Message = {
    id: `m_${Date.now()}`,
    conversationId: convId,
    senderId: currentUser.id,
    senderName: currentUser.name,
    senderAvatar: currentUser.avatar,
    recipientId: recipientId || undefined,
    content: content || '',
    attachmentType: attachmentType || undefined,
    attachmentTitle: attachmentTitle || undefined,
    attachmentUrl: attachmentUrl || undefined,
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (!db.messages.has(convId)) {
    db.messages.set(convId, []);
  }
  db.messages.get(convId)!.push(newMsg);

  const conv = db.conversations.get(convId);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }

  if (recipientId) {
    broadcastEvent('new_message', newMsg, recipientId);
  }

  res.status(201).json({ message: newMsg, conversationId: convId });
});

// -------------------------------------------------------------
// Creator Tools: Upload Materials & Quizzes
// -------------------------------------------------------------
app.post('/api/materials/upload', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const { title, description, category, pageCount, fileSize, previewPages } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required.' });
  }

  const newMaterial: PDFMaterial = {
    id: `pdf_${Date.now()}`,
    title,
    description: description || 'Educational resource & notes guide.',
    category,
    pageCount: Number(pageCount) || 8,
    fileSize: fileSize || '2.4 MB',
    downloadUrl: `#download-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    previewPages: Array.isArray(previewPages) && previewPages.length > 0 ? previewPages : [
      'Page 1: Overview & Axiomatic Foundations',
      'Page 2: Core Derivations & Step-by-Step Proofs',
      'Page 3: Worked Examples & Problem Exercises',
    ],
    authorId: currentUser.id,
    authorName: currentUser.name,
    downloadsCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.materials.set(newMaterial.id, newMaterial);
  res.status(201).json({ material: newMaterial });
});

app.get('/api/materials', (req: Request, res: Response) => {
  const list = Array.from(db.materials.values());
  res.json({ materials: list });
});

app.post('/api/quizzes/create', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const { title, description, category, questions, timeLimitMinutes } = req.body;

  if (!title || !category || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Title, category, and questions are required.' });
  }

  const newQuiz: Quiz = {
    id: `quiz_${Date.now()}`,
    title,
    description: description || 'Mastery diagnostic quiz.',
    category,
    questions,
    timeLimitMinutes: timeLimitMinutes || 10,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorAvatar: currentUser.avatar,
    submissionsCount: 0,
    avgScore: 0,
    createdAt: new Date().toISOString(),
  };

  db.quizzes.set(newQuiz.id, newQuiz);
  res.status(201).json({ quiz: newQuiz });
});

app.post('/api/quizzes/:id/submit', authMiddleware, (req: Request, res: Response) => {
  const quizId = req.params.id;
  const { answers } = req.body;
  const quiz = db.quizzes.get(quizId);

  if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

  let correctCount = 0;
  const results = quiz.questions.map((q, idx) => {
    const selected = answers ? answers[idx] : -1;
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      selected,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
  quiz.submissionsCount += 1;
  quiz.avgScore = Math.round((quiz.avgScore * (quiz.submissionsCount - 1) + scorePercentage) / quiz.submissionsCount);

  res.json({
    score: scorePercentage,
    correctCount,
    totalQuestions: quiz.questions.length,
    results,
    passed: scorePercentage >= 70,
  });
});

// -------------------------------------------------------------
// Notifications
// -------------------------------------------------------------
app.get('/api/notifications', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const list = db.notifications.get(currentUser.id) || [];
  res.json({ notifications: list });
});

app.post('/api/notifications/read-all', authMiddleware, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const list = db.notifications.get(currentUser.id) || [];
  list.forEach((n) => (n.read = true));
  res.json({ success: true });
});

// -------------------------------------------------------------
// NETFLOW AI Assistant Endpoints (Google Gemini API)
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, contextSubject } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required.' });
    const response = await generateAIChatResponse(message, history || [], contextSubject);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'AI request failed' });
  }
});

app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { topic, level, category } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required.' });
    const explanation = await explainSubjectConcept(topic, level || 'Undergraduate', category || 'General Science');
    res.json({ explanation });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Explanation failed' });
  }
});

app.post('/api/ai/homework-guide', async (req: Request, res: Response) => {
  try {
    const { problemStatement, subject, studentAttempt } = req.body;
    if (!problemStatement) return res.status(400).json({ error: 'Problem statement required.' });
    const guidance = await guideHomeworkProblem(problemStatement, subject || 'General', studentAttempt);
    res.json(guidance);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Guidance failed' });
  }
});

app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { content, subject } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required.' });
    const summary = await summarizeLearningMaterial(content, subject || 'General');
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Summarization failed' });
  }
});

app.post('/api/ai/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { topic, category, difficulty } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required.' });
    const quiz = await generateQuizFromTopic(topic, category || 'General', difficulty || 'intermediate');
    res.json({ quiz });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Quiz generation failed' });
  }
});

app.post('/api/ai/study-plan', async (req: Request, res: Response) => {
  try {
    const { targetGoal, subject, hoursPerDay } = req.body;
    if (!targetGoal) return res.status(400).json({ error: 'Target goal is required.' });
    const plan = await generateStudyPlan(targetGoal, subject || 'General', Number(hoursPerDay) || 2);
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Study plan failed' });
  }
});

export default app;
