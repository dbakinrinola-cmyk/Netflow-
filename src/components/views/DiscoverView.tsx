import React, { useState, useEffect } from 'react';
import { User, Community, LearningCategory, Post } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  Search,
  TrendingUp,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  Atom,
  Binary,
  BrainCircuit,
  Calculator,
  Compass,
  Dna,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  LineChart,
  Palette,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

interface DiscoverViewProps {
  currentUser: User;
  onSelectCategory: (cat: LearningCategory) => void;
  onUserClick: (userId: string) => void;
  onOpenCommunity: (commId: string) => void;
}

const CATEGORY_METADATA: { name: LearningCategory; icon: any; color: string; count: string }[] = [
  { name: 'Mathematics', icon: Calculator, color: 'text-amber-400 bg-amber-400/10', count: '42k learners' },
  { name: 'English Language', icon: BookOpen, color: 'text-sky-400 bg-sky-400/10', count: '31k learners' },
  { name: 'Physics', icon: Atom, color: 'text-blue-400 bg-blue-400/10', count: '38k learners' },
  { name: 'Chemistry', icon: FlaskConical, color: 'text-teal-400 bg-teal-400/10', count: '24k learners' },
  { name: 'Biology', icon: Dna, color: 'text-emerald-400 bg-emerald-400/10', count: '29k learners' },
  { name: 'Computer Science', icon: Binary, color: 'text-indigo-400 bg-indigo-400/10', count: '56k learners' },
  { name: 'Artificial Intelligence', icon: BrainCircuit, color: 'text-purple-400 bg-purple-400/10', count: '64k learners' },
  { name: 'Programming', icon: Binary, color: 'text-cyan-400 bg-cyan-400/10', count: '49k learners' },
  { name: 'History', icon: Landmark, color: 'text-orange-400 bg-orange-400/10', count: '18k learners' },
  { name: 'Geography', icon: Compass, color: 'text-lime-400 bg-lime-400/10', count: '14k learners' },
  { name: 'Economics', icon: LineChart, color: 'text-green-400 bg-green-400/10', count: '22k learners' },
  { name: 'Languages', icon: Languages, color: 'text-rose-400 bg-rose-400/10', count: '35k learners' },
  { name: 'Music and Creative Arts', icon: Palette, color: 'text-pink-400 bg-pink-400/10', count: '19k learners' },
  { name: 'Professional Development', icon: Briefcase, color: 'text-violet-400 bg-violet-400/10', count: '27k learners' },
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentUser,
  onSelectCategory,
  onUserClick,
  onOpenCommunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [tRes, cRes] = await Promise.all([
          api.getRecommendedTeachers(),
          api.getCommunities(),
        ]);
        setTeachers(tRes.teachers);
        setCommunities(cRes.communities);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchUsers(val);
      setSearchResults(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.followUser(userId);
      const updated = await api.getRecommendedTeachers();
      setTeachers(updated.teachers);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Search Header */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search students, teachers, institutions, topics or papers..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
          />
        </div>

        {/* Search Results Dropdown/Box if searching */}
        {searchQuery.trim().length > 0 && (
          <div className="mt-3 p-4 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Search Results ({searchResults.length})
            </span>
            {isSearching ? (
              <div className="py-4 text-center text-xs text-slate-400">Searching NETFLOW network...</div>
            ) : searchResults.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">No students or teachers found matching "{searchQuery}".</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => onUserClick(user.id)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span className="truncate">{user.name}</span>
                          {user.verifiedEducator && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          @{user.username} · {user.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user.id);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shrink-0 ml-2"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 14 Learning Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Learning Categories</h2>
            <p className="text-xs text-slate-400">Discover curated topics, open lecture materials, and study groups</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {CATEGORY_METADATA.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="p-4 rounded-2xl bg-[#0f172a]/90 hover:bg-[#16213a] border border-slate-800/80 hover:border-blue-500/40 text-left transition-all group flex flex-col justify-between h-32 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">{cat.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Teachers & Professors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <span>Recommended Teachers & Mentors</span>
            </h2>
            <p className="text-xs text-slate-400">Follow professors, authors, and industry mentors for daily educational posts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="p-5 rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 hover:border-slate-700/80 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                  />
                  <button
                    onClick={() => handleFollow(teacher.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
                  >
                    Follow
                  </button>
                </div>
                <h3
                  onClick={() => onUserClick(teacher.id)}
                  className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {teacher.name}
                </h3>
                <span className="text-xs text-blue-400 block mt-0.5">{teacher.institution}</span>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {teacher.bio}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{(teacher.followersCount / 1000).toFixed(1)}k followers</span>
                <span className="text-amber-400">★ {teacher.rating || 4.9}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Learning Communities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Popular Student Communities</span>
            </h2>
            <p className="text-xs text-slate-400">Join collaborative study circles and discussion guilds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => onOpenCommunity(comm.id)}
              className="p-5 rounded-3xl bg-[#0f172a]/90 hover:bg-[#16213a]/90 border border-slate-800/80 hover:border-indigo-500/40 shadow-md cursor-pointer transition-all flex items-start gap-4"
            >
              <img
                src={comm.avatar}
                alt={comm.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400">{comm.category}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{(comm.membersCount / 1000).toFixed(1)}k members</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5 truncate">{comm.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {comm.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
