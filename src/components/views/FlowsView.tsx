import React, { useState, useEffect, useRef } from 'react';
import { Post, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface FlowsViewProps {
  currentUser: User;
  onOpenQuiz?: (quiz: any) => void;
  onUserClick?: (userId: string) => void;
}

export const FlowsView: React.FC<FlowsViewProps> = ({ currentUser, onOpenQuiz, onUserClick }) => {
  const [flows, setFlows] = useState<Post[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [showAnswer, setShowAnswer] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function loadFlows() {
      try {
        const res = await api.getPosts({ feedType: 'flows' });
        // If no explicit flows, fall back to all posts that have media
        if (res.posts.length > 0) {
          setFlows(res.posts);
        } else {
          const allRes = await api.getPosts({});
          setFlows(allRes.posts);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadFlows();
  }, []);

  const currentFlow = flows[currentIdx];

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIdx < flows.length - 1) {
      setCurrentIdx((i) => i + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    setShowAnswer(false);
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setIsPlaying(true);
    }
  };

  const handleLike = async (postId: string) => {
    const isLiked = likedMap[postId] || false;
    const currentCount = likesCountMap[postId] || currentFlow?.likesCount || 0;
    setLikedMap((prev) => ({ ...prev, [postId]: !isLiked }));
    setLikesCountMap((prev) => ({ ...prev, [postId]: isLiked ? currentCount - 1 : currentCount + 1 }));
    try {
      await api.likePost(postId);
    } catch {}
  };

  const handleBookmark = async (postId: string) => {
    const isBookmarked = bookmarkedMap[postId] || false;
    setBookmarkedMap((prev) => ({ ...prev, [postId]: !isBookmarked }));
    try {
      await api.bookmarkPost(postId);
    } catch {}
  };

  if (!currentFlow) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading educational flows...</p>
      </div>
    );
  }

  const isLiked = likedMap[currentFlow.id] ?? currentFlow.isLiked;
  const likesCount = likesCountMap[currentFlow.id] ?? currentFlow.likesCount;
  const isBookmarked = bookmarkedMap[currentFlow.id] ?? currentFlow.isBookmarked;

  return (
    <div className="max-w-md mx-auto relative h-[calc(100vh-140px)] min-h-[580px] flex items-center justify-center">
      {/* Main Flow Container */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Background Video / Image Graphic */}
        <div className="absolute inset-0 z-0">
          {currentFlow.mediaUrl?.endsWith('.mp4') || currentFlow.type === 'video' || currentFlow.type === 'flow' ? (
            <video
              ref={videoRef}
              src={currentFlow.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              loop
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              onClick={handleTogglePlay}
            />
          ) : (
            <img
              src={currentFlow.mediaUrl || '/src/assets/images/hero_quantum_physics_1793940252300.jpg'}
              alt={currentFlow.title || 'Flow lesson'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onClick={handleTogglePlay}
            />
          )}

          {/* Measured Dark Scrim for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/60 pointer-events-none" />
        </div>

        {/* Top Floating Controls */}
        <div className="relative z-10 px-5 pt-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-xs font-bold tracking-wide">
              {currentFlow.category}
            </span>
            <span className="text-xs text-slate-300 font-medium">Flow {currentIdx + 1}/{flows.length}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Play/Pause indicator on click */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-2xl">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Educational Content & Actions */}
        <div className="relative z-10 p-5 flex items-end justify-between gap-4">
          {/* Left: Author & Lesson Concept */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onUserClick && onUserClick(currentFlow.author.id)}
                className="relative group"
              >
                <img
                  src={currentFlow.author.avatar}
                  alt={currentFlow.author.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-500"
                />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate">{currentFlow.author.name}</span>
                  {currentFlow.author.verifiedEducator && (
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-300 truncate block">
                  {currentFlow.author.institution || currentFlow.author.role}
                </span>
              </div>
            </div>

            {/* Title / Question */}
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
              {currentFlow.title || 'Micro-Lesson'}
            </h3>

            {/* Lesson Snippet */}
            <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
              {currentFlow.content}
            </p>

            {/* Interactive Flash Question Trigger */}
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>{showAnswer ? 'Hide Key Takeaway' : 'Show Key Concept'}</span>
            </button>

            {showAnswer && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 animate-in fade-in duration-150">
                <strong>Core Invariant:</strong> {currentFlow.quiz?.questions[0]?.explanation || 'Mastery comes from understanding fundamental mechanisms rather than rote memorization.'}
              </div>
            )}
          </div>

          {/* Right Floating Actions (TikTok / Reels style) */}
          <div className="flex flex-col items-center gap-4 text-white">
            {/* Like */}
            <button
              onClick={() => handleLike(currentFlow.id)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isLiked
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                    : 'bg-black/50 backdrop-blur-md group-hover:bg-black/70'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
              </div>
              <span className="text-[11px] font-mono font-bold">{likesCount}</span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center group-hover:bg-black/70 transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold">{currentFlow.commentsCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => handleBookmark(currentFlow.id)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isBookmarked
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40'
                    : 'bg-black/50 backdrop-blur-md group-hover:bg-black/70'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-white' : ''}`} />
              </div>
              <span className="text-[11px] font-mono font-bold">{currentFlow.bookmarksCount}</span>
            </button>

            {/* Quiz if attached */}
            {currentFlow.quiz && (
              <button
                onClick={() => onOpenQuiz && onOpenQuiz(currentFlow.quiz)}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg active:scale-95"
                title="Take attached quiz"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Flow link copied to clipboard!');
              }}
              className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Vertical Navigation Arrows (for desktop / tablets) */}
      <div className="hidden md:flex flex-col gap-2 absolute -right-14 top-1/2 -translate-y-1/2">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="w-10 h-10 rounded-full bg-[#0f172a] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center disabled:opacity-30 transition-all shadow-md"
          title="Previous Flow"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIdx === flows.length - 1}
          className="w-10 h-10 rounded-full bg-[#0f172a] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center disabled:opacity-30 transition-all shadow-md"
          title="Next Flow"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
