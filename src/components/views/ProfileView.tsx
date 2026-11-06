import React, { useState, useEffect } from 'react';
import { User, Post, PDFMaterial, Quiz } from '../../types/index.js';
import { api } from '../../services/api.js';
import { PostCard } from '../feed/PostCard.js';
import {
  GraduationCap,
  School,
  BookOpen,
  CheckCircle2,
  Edit3,
  Bookmark,
  FileText,
  HelpCircle,
  Users,
  Grid,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  viewingUserId?: string;
  onOpenPDF: (material: any) => void;
  onOpenQuiz: (quiz: any) => void;
  onProfileUpdated: (user: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  viewingUserId,
  onOpenPDF,
  onOpenQuiz,
  onProfileUpdated,
}) => {
  const isMe = !viewingUserId || viewingUserId === currentUser.id;
  const [profileUser, setProfileUser] = useState<User>(currentUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'pdfs' | 'quizzes' | 'bookmarks'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editInstitution, setEditInstitution] = useState(currentUser.institution || '');

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        if (!isMe && viewingUserId) {
          const res = await api.getUser(viewingUserId);
          setProfileUser(res.user);
          setIsFollowing(res.isFollowing);
        } else {
          setProfileUser(currentUser);
        }

        const postRes = await api.getPosts({
          authorId: viewingUserId || currentUser.id,
        });
        setPosts(postRes.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [viewingUserId, currentUser, isMe]);

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    try {
      const res = await api.followUser(profileUser.id);
      setIsFollowing(res.isFollowing);
      setProfileUser((prev) => ({ ...prev, followersCount: res.followersCount }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({
        name: editName,
        bio: editBio,
        institution: editInstitution,
      });
      onProfileUpdated(res.user);
      setProfileUser(res.user);
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0f172a]/95 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover border-2 border-blue-500/50 shadow-xl"
              />
              {profileUser.verifiedEducator && (
                <span
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-[#0f172a]"
                  title="Verified Educator"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white">{profileUser.name}</h1>
                <span className="text-xs text-blue-400 font-mono">@{profileUser.username}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="capitalize font-semibold text-slate-300">{profileUser.role}</span>
                {profileUser.institution && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-blue-400" />
                      <span>{profileUser.institution}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            {isMe ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isFollowing ? 'Following ✓' : 'Follow Educator'}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
          {profileUser.bio}
        </p>

        {/* Subjects Studied / Taught */}
        {profileUser.subjects && profileUser.subjects.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">Fields of Study:</span>
            {profileUser.subjects.map((sub) => (
              <span
                key={sub}
                className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 text-center">
          <div>
            <div className="text-lg md:text-xl font-black text-white font-mono tabular-nums">
              {profileUser.followersCount}
            </div>
            <div className="text-[11px] text-slate-400">Followers</div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-black text-white font-mono tabular-nums">
              {profileUser.followingCount}
            </div>
            <div className="text-[11px] text-slate-400">Following</div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-black text-white font-mono tabular-nums">
              {posts.length}
            </div>
            <div className="text-[11px] text-slate-400">Posts & Notes</div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-black text-blue-400 font-mono tabular-nums">
              {profileUser.savedCount || 12}
            </div>
            <div className="text-[11px] text-slate-400">Saved</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pdfs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'pdfs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>PDF Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'quizzes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quizzes Created</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading learning archive...</div>
        ) : activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-3xl bg-[#0f172a]/90 border border-slate-800">
              No posts published yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onOpenPDF={onOpenPDF}
                onOpenQuiz={onOpenQuiz}
              />
            ))
          )
        ) : activeTab === 'pdfs' ? (
          <div className="space-y-3">
            {posts.filter((p) => p.pdfMaterial).length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 rounded-3xl bg-[#0f172a]/90 border border-slate-800">
                No PDF materials published yet.
              </div>
            ) : (
              posts
                .filter((p) => p.pdfMaterial)
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-red-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.pdfMaterial?.title}</h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {p.pdfMaterial?.pageCount} Pages · {p.pdfMaterial?.fileSize}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenPDF(p.pdfMaterial)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Preview PDF
                    </button>
                  </div>
                ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.filter((p) => p.quiz).length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 rounded-3xl bg-[#0f172a]/90 border border-slate-800">
                No interactive quizzes created yet.
              </div>
            ) : (
              posts
                .filter((p) => p.quiz)
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-indigo-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.quiz?.title}</h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {p.quiz?.questions.length} Diagnostic Questions
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenQuiz(p.quiz)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold"
                    >
                      Take Quiz
                    </button>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Edit Academic Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Academic Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Institution</label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  placeholder="e.g. Stanford University or MIT"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
