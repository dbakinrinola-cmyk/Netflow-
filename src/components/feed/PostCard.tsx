import React, { useState } from 'react';
import { Post, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  Share2,
  FileText,
  HelpCircle,
  Play,
  CheckCircle2,
  MoreHorizontal,
  Send,
  Eye,
  Download,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onOpenPDF?: (material: any) => void;
  onOpenQuiz?: (quiz: any) => void;
  onUserClick?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onOpenPDF,
  onOpenQuiz,
  onUserClick,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarksCount || 0);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const handleLike = async () => {
    // Optimistic
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await api.likePost(post.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.likesCount);
    } catch {
      // Rollback on fail
      setIsLiked(!nextState);
      setLikesCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    setBookmarksCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await api.bookmarkPost(post.id);
      setIsBookmarked(res.isBookmarked);
      setBookmarksCount(res.bookmarksCount);
    } catch {
      setIsBookmarked(!nextState);
    }
  };

  const handleRepost = async () => {
    if (isReposted) return;
    setIsReposted(true);
    setRepostsCount((p) => p + 1);
    try {
      const res = await api.repost(post.id);
      setRepostsCount(res.repostsCount);
    } catch {}
  };

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.getComments(post.id);
        setComments(res.comments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.addComment(post.id, commentInput.trim());
      setComments((prev) => [...prev, res.comment]);
      setCommentsCount(res.commentsCount);
      setCommentInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    setIsCopied(true);
    navigator.clipboard?.writeText(window.location.href);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <article className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-lg hover:border-slate-700/80 transition-all overflow-hidden">
      {/* Post Header */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUserClick && onUserClick(post.author.id)}
            className="relative shrink-0 group"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-2xl object-cover border border-slate-700 group-hover:border-blue-500 transition-colors"
            />
            {post.author.verifiedEducator && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-[#0f172a]"
                title="Verified Educator"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
              </span>
            )}
          </button>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onUserClick && onUserClick(post.author.id)}
                className="text-sm font-bold text-white hover:text-blue-400 transition-colors"
              >
                {post.author.name}
              </button>
              <span className="text-xs text-slate-400">@{post.author.username}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span className="text-blue-400 font-medium">{post.category}</span>
              <span aria-hidden="true">·</span>
              {post.author.institution && (
                <>
                  <span className="line-clamp-1 max-w-[140px] md:max-w-xs">{post.author.institution}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              {post.readTime && (
                <>
                  <span>{post.readTime}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Share post"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      {post.title && (
        <div className="px-5 pt-1 pb-2">
          <h2 className="text-base md:text-lg font-bold text-slate-100 hover:text-blue-300 transition-colors leading-snug">
            {post.title}
          </h2>
        </div>
      )}

      {/* Main Content Body */}
      <div className="px-5 pb-3">
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-blue-400">
            {post.hashtags.map((tag, idx) => (
              <span key={idx} className="hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Attachment (Image or Video) */}
      {post.mediaUrl && !mediaError && (
        <div className="mx-5 mb-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 relative">
          {post.type === 'video' || post.type === 'flow' ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              className="w-full max-h-[460px] object-cover bg-black"
              onError={() => setMediaError(true)}
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.title || 'Educational post media'}
              referrerPolicy="no-referrer"
              className="w-full max-h-[500px] object-cover"
              onError={() => setMediaError(true)}
            />
          )}
        </div>
      )}

      {/* Fallback container if image failed */}
      {post.mediaUrl && mediaError && (
        <div className="mx-5 mb-4 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 text-center flex flex-col items-center justify-center">
          <FileText className="w-8 h-8 text-blue-400 mb-2" />
          <span className="text-sm font-semibold text-slate-200">{post.title || post.category} Visual Model</span>
          <span className="text-xs text-slate-400 mt-1">Interactive graphic reference</span>
        </div>
      )}

      {/* PDF Learning Notes Attachment Card */}
      {post.pdfMaterial && (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900/60 border border-blue-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-white line-clamp-1">
                {post.pdfMaterial.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{post.pdfMaterial.pageCount} Pages</span>
                <span>·</span>
                <span>{post.pdfMaterial.fileSize}</span>
                <span>·</span>
                <span>PDF Resource</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenPDF && onOpenPDF(post.pdfMaterial)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Read PDF</span>
          </button>
        </div>
      )}

      {/* Interactive Quiz Attachment Card */}
      {post.quiz && (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-white line-clamp-1">
                {post.quiz.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{post.quiz.questions.length} Diagnostic Questions</span>
                <span>·</span>
                <span className="text-indigo-400 font-medium">Instant Feedback</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenQuiz && onOpenQuiz(post.quiz)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shrink-0 transition-all shadow-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Take Quiz</span>
          </button>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 ${
            isLiked ? 'text-rose-500 font-bold' : 'hover:text-slate-200'
          }`}
          title="Approve / Like"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="font-mono tabular-nums">{likesCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 hover:text-blue-400"
          title="Discussion"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-mono tabular-nums">{commentsCount}</span>
        </button>

        {/* Repost */}
        <button
          onClick={handleRepost}
          className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 ${
            isReposted ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
          }`}
          title="Repost to network"
        >
          <Repeat className="w-4 h-4" />
          <span className="font-mono tabular-nums">{repostsCount}</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 ${
            isBookmarked ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
          }`}
          title="Save to study collection"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span className="font-mono tabular-nums">{bookmarksCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-slate-800/60 hover:text-slate-200"
          title="Copy link"
        >
          <Share2 className="w-4 h-4" />
          <span>{isCopied ? 'Copied' : ''}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/40 space-y-3 animate-in fade-in duration-150">
          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
            />
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add your thoughts or question..."
              className="flex-1 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentInput.trim()}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comment list */}
          {loadingComments ? (
            <div className="py-2 text-center text-xs text-slate-500">Loading discussion...</div>
          ) : comments.length === 0 ? (
            <div className="py-2 text-center text-xs text-slate-500">No comments yet. Start the academic discussion!</div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.author.avatar}
                    alt={c.author.name}
                    className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0 border border-slate-700"
                  />
                  <div className="flex-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{c.author.name}</span>
                        {c.author.verifiedEducator && (
                          <span className="text-[10px] text-blue-400 font-semibold">Educator</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
