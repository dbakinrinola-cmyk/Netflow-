import React, { useState } from 'react';
import { LearningCategory, PostType, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import { X, Image as ImageIcon, FileText, Sparkles, Send, Video, HelpCircle, Plus, Trash2 } from 'lucide-react';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

const CATEGORIES: LearningCategory[] = [
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

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ currentUser, onClose, onPostCreated }) => {
  const [activeTab, setActiveTab] = useState<'post' | 'pdf' | 'quiz'>('post');
  const [category, setCategory] = useState<LearningCategory>('Physics');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // PDF specific state
  const [pdfPageCount, setPdfPageCount] = useState(6);
  const [pdfFileSize, setPdfFileSize] = useState('3.5 MB');

  // Quiz specific state
  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 'q1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    },
  ]);

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q${quizQuestions.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      },
    ]);
  };

  const handleUpdateQuestion = (qIdx: number, field: string, value: any) => {
    const updated = [...quizQuestions];
    (updated[qIdx] as any)[field] = value;
    setQuizQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...quizQuestions];
    updated[qIdx].options[oIdx] = val;
    setQuizQuestions(updated);
  };

  // AI Assist feature
  const handleAIAssist = async () => {
    setIsAIGenerating(true);
    try {
      if (activeTab === 'quiz') {
        const res = await api.aiGenerateQuiz(title || category, category, 'intermediate');
        if (res.quiz) {
          if (res.quiz.title) setTitle(res.quiz.title);
          if (res.quiz.description) setContent(res.quiz.description);
          if (res.quiz.questions && res.quiz.questions.length > 0) {
            setQuizQuestions(res.quiz.questions as any);
          }
        }
      } else {
        const topic = title || `Key principles of ${category}`;
        const res = await api.aiExplain(topic, 'Undergraduate', category);
        setContent(res.explanation);
        if (!title) setTitle(`Mastering ${category}: ${topic}`);
      }
    } catch (err: any) {
      alert(err.message || 'AI Assist failed. Please try again.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && activeTab !== 'quiz' && !mediaUrl) {
      alert('Please provide some content for your post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const hashtags = hashtagInput
        .split(' ')
        .map((h) => h.replace(/^#/, '').trim())
        .filter(Boolean);

      let payload: any = {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        type: postType,
        hashtags,
        mediaUrl: mediaUrl.trim() || undefined,
      };

      if (activeTab === 'pdf') {
        payload.type = 'pdf';
        payload.pdfMaterial = {
          id: `pdf_${Date.now()}`,
          title: title || `${category} Lecture Notes`,
          description: content.slice(0, 150),
          category,
          pageCount: Number(pdfPageCount) || 6,
          fileSize: pdfFileSize,
          downloadUrl: '#download',
          previewPages: [
            'Page 1: Overview & Axiomatic Principles',
            'Page 2: Core Derivations & Formulas',
            'Page 3: Step-by-Step Problem Demonstrations',
          ],
          authorId: currentUser.id,
          authorName: currentUser.name,
          downloadsCount: 0,
          createdAt: new Date().toISOString(),
        };
      } else if (activeTab === 'quiz') {
        payload.type = 'quiz';
        payload.quiz = {
          id: `quiz_${Date.now()}`,
          title: title || `${category} Diagnostic Quiz`,
          description: content || `A test on ${category} concepts.`,
          category,
          questions: quizQuestions.filter((q) => q.question.trim().length > 0),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          submissionsCount: 0,
          avgScore: 0,
          createdAt: new Date().toISOString(),
        };
      }

      const res = await api.createPost(payload);
      onPostCreated(res.post);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
            <div>
              <h2 className="text-base font-bold text-white">Share Knowledge</h2>
              <p className="text-xs text-slate-400">Posting as {currentUser.name} ({currentUser.role})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAIAssist}
              disabled={isAIGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-600/50 text-xs font-semibold transition-all disabled:opacity-50"
              title="Draft or generate with Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAIGenerating ? 'Generating...' : 'AI Assist'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-900/30 text-xs">
          <button
            onClick={() => { setActiveTab('post'); setPostType('text'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'post' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Social Post
          </button>
          <button
            onClick={() => { setActiveTab('pdf'); setPostType('pdf'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'pdf' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            PDF Study Notes
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); setPostType('quiz'); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive Quiz
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Category selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Category / Field</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as LearningCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Headline / Topic Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visualizing Quantum Probability Fields or Calculus Cheat Sheet"
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Post Content */}
          <div>
            <label className="text-xs font-semibold text-slate-300">
              {activeTab === 'quiz' ? 'Quiz Instructions / Overview' : 'Educational Content & Insights'}
            </label>
            <textarea
              rows={activeTab === 'quiz' ? 2 : 5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain the intuition, state the problem, share scientific concepts, or provide code/math derivations..."
              className="mt-1 w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Media URL for standard post */}
          {activeTab === 'post' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Media Attachment (Image or Video URL)</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      if (e.target.value.endsWith('.mp4') || e.target.value.includes('video')) {
                        setPostType('video');
                      } else if (e.target.value) {
                        setPostType('image');
                      }
                    }}
                    placeholder="https://... (or choose quick preset below)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Media presets from generated assets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400">Quick Attach:</span>
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('/src/assets/images/hero_quantum_physics_1793940252300.jpg');
                    setPostType('image');
                    setCategory('Physics');
                  }}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-800 text-blue-300 hover:bg-slate-700"
                >
                  Quantum Physics Visual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('/src/assets/images/biology_dna_crispr_1793940256050.jpg');
                    setPostType('image');
                    setCategory('Biology');
                  }}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-800 text-emerald-300 hover:bg-slate-700"
                >
                  CRISPR DNA Graphic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('/src/assets/images/math_golden_spiral_1793940254541.jpg');
                    setPostType('image');
                    setCategory('Mathematics');
                  }}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-800 text-amber-300 hover:bg-slate-700"
                >
                  Golden Ratio Spiral
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                    setPostType('flow');
                    setCategory('Programming');
                  }}
                  className="px-2 py-1 text-[11px] rounded-md bg-slate-800 text-purple-300 hover:bg-slate-700"
                >
                  Educational Flow Video
                </button>
              </div>
            </div>
          )}

          {/* PDF Specific Config */}
          {activeTab === 'pdf' && (
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-300">Page Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={pdfPageCount}
                  onChange={(e) => setPdfPageCount(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">File Size</label>
                <input
                  type="text"
                  value={pdfFileSize}
                  onChange={(e) => setPdfFileSize(e.target.value)}
                  placeholder="e.g. 4.2 MB"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Interactive Quiz Builder */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Quiz Questions ({quizQuestions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">Question {qIdx + 1}</span>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                    placeholder="Enter question statement..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />

                  {/* Options */}
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctAnswer === oIdx}
                          onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', oIdx)}
                          className="accent-blue-600 cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-4">
                          {String.fromCharCode(65 + oIdx)}:
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                    placeholder="Explanation why this is correct..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Hashtags */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Topic Hashtags</label>
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#QuantumPhysics #MachineLearning #Calculus"
              className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
