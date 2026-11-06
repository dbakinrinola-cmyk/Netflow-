import React, { useState, useEffect } from 'react';
import { Post, User, LearningCategory } from '../../types/index.js';
import { api } from '../../services/api.js';
import { PostCard } from '../feed/PostCard.js';
import {
  Sparkles,
  FileText,
  HelpCircle,
  Video,
  Image as ImageIcon,
  Compass,
  Users,
  TrendingUp,
  GraduationCap,
  Plus,
} from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
  onOpenCreate: () => void;
  onOpenPDF: (material: any) => void;
  onOpenQuiz: (quiz: any) => void;
  onNavigateTab: (tab: string) => void;
  onUserClick: (userId: string) => void;
}

const CATEGORIES: ('All' | LearningCategory)[] = [
  'All',
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Artificial Intelligence',
  'Programming',
  'History',
  'Geography',
  'Economics',
  'Languages',
  'Music and Creative Arts',
  'Professional Development',
];

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onOpenCreate,
  onOpenPDF,
  onOpenQuiz,
  onNavigateTab,
  onUserClick,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedType, setFeedType] = useState<'for_you' | 'following' | 'bookmarks'>('for_you');
  const [selectedCategory, setSelectedCategory] = useState<'All' | LearningCategory>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedTeachers, setRecommendedTeachers] = useState<User[]>([]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPosts({
        feedType,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      });
      setPosts(res.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.getRecommendedTeachers();
      setRecommendedTeachers(res.teachers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [feedType, selectedCategory]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleTeacherFollow = async (tId: string) => {
    try {
      await api.followUser(tId);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Central Social Learning Feed */}
      <div className="lg:col-span-8 space-y-6">
        {/* Top Stories / Educational Sparks Carousel */}
        <div className="p-4 rounded-3xl bg-[#0f172a]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Featured Educators & Sparks
            </span>
            <button
              onClick={() => onNavigateTab('discover')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Explore all</span>
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {/* Quick add spark */}
            <button
              onClick={onOpenCreate}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-slate-300 font-medium truncate w-16 text-center">Post</span>
            </button>

            {/* Recommended Educators Sparks */}
            {recommendedTeachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => onUserClick(teacher.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-2xl object-cover bg-slate-900"
                  />
                  {teacher.verifiedEducator && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold border-2 border-[#0f172a]">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-200 font-medium truncate w-16 text-center group-hover:text-blue-400 transition-colors">
                  {teacher.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Post Prompt Bar */}
        <div className="p-4 rounded-3xl bg-[#0f172a]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shrink-0"
            />
            <button
              onClick={onOpenCreate}
              className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-400 text-xs md:text-sm transition-colors"
            >
              What are you learning or teaching today?
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Media</span>
            </button>
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>PDF Notes</span>
            </button>
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Quiz</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center gap-1.5 hover:text-purple-400 transition-colors px-2 py-1 rounded-lg text-purple-300"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* Feed Sub-Header: Feed Tabs & Category Filter */}
        <div className="space-y-3">
          {/* Feed Type Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setFeedType('for_you')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  feedType === 'for_you'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setFeedType('following')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  feedType === 'following'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Following
              </button>
              <button
                onClick={() => setFeedType('bookmarks')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  feedType === 'bookmarks'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Saved Notes
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono tabular-nums hidden sm:inline">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {/* 14 Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-100 text-slate-950 font-bold'
                    : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Posts List */}
        {isLoading ? (
          <div className="space-y-4 py-8 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Loading educational feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0f172a]/80 border border-slate-800 text-center">
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No posts found in this feed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Be the first to share an educational discovery or adjust your category filters!
            </p>
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              Publish a Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onOpenPDF={onOpenPDF}
                onOpenQuiz={onOpenQuiz}
                onUserClick={onUserClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Desktop Sidebar: Recommended Teachers, AI Spark, Communities */}
      <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20">
        {/* AI Quick Spark Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-950/40 to-slate-900/80 border border-blue-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>NETFLOW AI Tutor</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Stuck on a problem or theorem?</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Get instant Socratic step-by-step guidance, lecture note summaries, and custom quizzes powered by Google Gemini 3.8 Flash.
          </p>
          <button
            onClick={() => onNavigateTab('ai')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Launch AI Assistant
          </button>
        </div>

        {/* Recommended Teachers & Professors */}
        <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Recommended Teachers</span>
            </h3>
            <button
              onClick={() => onNavigateTab('discover')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              See all
            </button>
          </div>

          <div className="space-y-4">
            {recommendedTeachers.slice(0, 4).map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between gap-3">
                <button
                  onClick={() => onUserClick(teacher.id)}
                  className="flex items-center gap-3 text-left min-w-0"
                >
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate hover:text-blue-400 transition-colors">
                      {teacher.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {teacher.institution || teacher.subjects[0]}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleTeacherFollow(teacher.id)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-all shrink-0"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Educational Subjects */}
        <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Trending Topics</h3>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => setSelectedCategory('Physics')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-left transition-colors"
            >
              <div>
                <div className="font-semibold text-slate-200">#QuantumPhysics</div>
                <div className="text-[10px] text-slate-400">14.2k students discussing</div>
              </div>
              <span className="text-blue-400 font-mono text-[11px]">Physics</span>
            </button>

            <button
              onClick={() => setSelectedCategory('Artificial Intelligence')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-left transition-colors"
            >
              <div>
                <div className="font-semibold text-slate-200">#MachineLearning</div>
                <div className="text-[10px] text-slate-400">28.9k students discussing</div>
              </div>
              <span className="text-cyan-400 font-mono text-[11px]">AI</span>
            </button>

            <button
              onClick={() => setSelectedCategory('Biology')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-left transition-colors"
            >
              <div>
                <div className="font-semibold text-slate-200">#CRISPR</div>
                <div className="text-[10px] text-slate-400">9.4k students discussing</div>
              </div>
              <span className="text-emerald-400 font-mono text-[11px]">Biology</span>
            </button>

            <button
              onClick={() => setSelectedCategory('Mathematics')}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-left transition-colors"
            >
              <div>
                <div className="font-semibold text-slate-200">#GoldenRatio</div>
                <div className="text-[10px] text-slate-400">6.1k students discussing</div>
              </div>
              <span className="text-amber-400 font-mono text-[11px]">Math</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
