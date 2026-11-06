import React, { useState, useEffect } from 'react';
import { Community, User, LearningCategory } from '../../types/index.js';
import { api } from '../../services/api.js';
import { Users, Plus, Shield, MessageSquare, Check, Compass, BookOpen } from 'lucide-react';

interface CommunitiesViewProps {
  currentUser: User;
  onOpenCommunityDetails?: (communityId: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({ currentUser }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'subject' | 'school'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeComm, setActiveComm] = useState<Community | null>(null);

  // New community form
  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [commCategory, setCommCategory] = useState<LearningCategory>('Physics');
  const [commType, setCommType] = useState<'subject' | 'school' | 'study_group'>('subject');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCommunities = async () => {
    try {
      const res = await api.getCommunities();
      setCommunities(res.communities);
      if (res.communities.length > 0 && !activeComm) {
        setActiveComm(res.communities[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleToggleJoin = async (commId: string) => {
    try {
      const res = await api.joinCommunity(commId);
      setCommunities((prev) =>
        prev.map((c) => (c.id === commId ? { ...c, isJoined: res.isJoined, membersCount: res.membersCount } : c))
      );
      if (activeComm && activeComm.id === commId) {
        setActiveComm({ ...activeComm, isJoined: res.isJoined, membersCount: res.membersCount });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim() || !commDesc.trim()) return;
    setIsCreating(true);
    try {
      const res = await api.createCommunity({
        name: commName.trim(),
        description: commDesc.trim(),
        category: commCategory,
        type: commType,
      });
      setCommunities((prev) => [res.community, ...prev]);
      setActiveComm(res.community);
      setShowCreateModal(false);
      setCommName('');
      setCommDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to create community');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCommunities = communities.filter((c) => {
    if (selectedType === 'all') return true;
    return c.type === selectedType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 shadow-md">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">Student & Academic Communities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Subject-based labs, university study lounges, and collaborative peer guilds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-xl border transition-all ${
            selectedType === 'all'
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Communities
        </button>
        <button
          onClick={() => setSelectedType('subject')}
          className={`px-4 py-2 rounded-xl border transition-all ${
            selectedType === 'subject'
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Subject Labs
        </button>
        <button
          onClick={() => setSelectedType('school')}
          className={`px-4 py-2 rounded-xl border transition-all ${
            selectedType === 'school'
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          School & University Hubs
        </button>
      </div>

      {/* 2-Column Split: Community List and Active Details Lounge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Community Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCommunities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => setActiveComm(comm)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                activeComm?.id === comm.id
                  ? 'bg-slate-800/90 border-blue-500 shadow-md'
                  : 'bg-[#0f172a]/80 hover:bg-slate-900 border-slate-800'
              }`}
            >
              <img
                src={comm.avatar}
                alt={comm.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-400">{comm.category}</span>
                  <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                    {(comm.membersCount / 1000).toFixed(1)}k
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5 truncate">{comm.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{comm.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Active Community Details Pane */}
        {activeComm && (
          <div className="lg:col-span-7 rounded-3xl bg-[#0f172a]/95 border border-slate-800/80 shadow-xl overflow-hidden">
            {/* Cover Banner */}
            <div className="h-44 relative bg-slate-900">
              <img
                src={activeComm.coverImage}
                alt={activeComm.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
            </div>

            {/* Profile Bar */}
            <div className="px-6 pb-6 relative -mt-10 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <img
                  src={activeComm.avatar}
                  alt={activeComm.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0f172a] shadow-xl shrink-0"
                />
                <button
                  onClick={() => handleToggleJoin(activeComm.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    activeComm.isJoined
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {activeComm.isJoined ? 'Joined ✓' : 'Join Community'}
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <span>{activeComm.category}</span>
                  <span>·</span>
                  <span>{activeComm.type === 'school' ? 'University / School' : 'Subject Lab'}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{activeComm.membersCount} active scholars</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{activeComm.name}</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeComm.description}
                </p>
              </div>

              {/* Announcement if any */}
              {activeComm.announcement && (
                <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-xs text-blue-200">
                  <div className="font-bold uppercase tracking-wider text-blue-400 text-[10px] mb-1">
                    Community Announcement
                  </div>
                  {activeComm.announcement}
                </div>
              )}

              {/* Rules */}
              {activeComm.rules?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>Academic Conduct Rules</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc pl-5">
                    {activeComm.rules.map((rule, rIdx) => (
                      <li key={rIdx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Community</h2>
            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Community Name</label>
                <input
                  type="text"
                  required
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  placeholder="e.g. Stanford AI Research Circle"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  placeholder="What is the mission, discussion topics, and problem sets focus?"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={commCategory}
                    onChange={(e) => setCommCategory(e.target.value as LearningCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    {['Physics', 'Mathematics', 'Computer Science', 'Artificial Intelligence', 'Biology', 'Chemistry'].map(
                      (c) => (
                        <option key={c} value={c}>{c}</option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Type</label>
                  <select
                    value={commType}
                    onChange={(e) => setCommType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="subject">Subject Lab</option>
                    <option value="school">School / University Hub</option>
                    <option value="study_group">Study Group</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  {isCreating ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
