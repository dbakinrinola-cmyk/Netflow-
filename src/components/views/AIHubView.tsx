import React, { useState } from 'react';
import { User, LearningCategory, Quiz } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Calendar,
  Send,
  Play,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AIHubViewProps {
  currentUser: User;
  onOpenQuiz: (quiz: any) => void;
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

export const AIHubView: React.FC<AIHubViewProps> = ({ currentUser, onOpenQuiz }) => {
  const [activeTool, setActiveTool] = useState<
    'chat' | 'explain' | 'homework' | 'summarize' | 'quiz' | 'study_plan'
  >('chat');

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string; suggestions?: string[] }[]
  >([
    {
      role: 'assistant',
      content: `Hello ${currentUser.name}! I am NETFLOW AI, your academic companion powered by Google Gemini 3.8 Flash.\n\nWhether you need intuitive explanations of quantum wavepackets, homework step-by-step guidance, lecture note summarization, or interactive quizzes, I am ready to help you master any subject. What are we exploring today?`,
      suggestions: [
        'Explain Schrödinger wavepackets with an analogy',
        'Break down Dijkstra vs A* pathfinding algorithm',
        'Generate a diagnostic quiz on CRISPR gene editing',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Concept Explainer State
  const [explainTopic, setExplainTopic] = useState('');
  const [explainCategory, setExplainCategory] = useState<LearningCategory>('Physics');
  const [explainLevel, setExplainLevel] = useState<'Elementary' | 'High School' | 'Undergraduate' | 'Graduate/Expert'>('Undergraduate');
  const [explainResult, setExplainResult] = useState('');
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  // Homework Solver State
  const [hwProblem, setHwProblem] = useState('');
  const [hwSubject, setHwSubject] = useState<LearningCategory>('Mathematics');
  const [hwAttempt, setHwAttempt] = useState('');
  const [hwResult, setHwResult] = useState<{ explanation: string; hints: string[]; nextStepPrompt: string } | null>(null);
  const [isHwLoading, setIsHwLoading] = useState(false);

  // Summarizer State
  const [sumContent, setSumContent] = useState('');
  const [sumSubject, setSumSubject] = useState<LearningCategory>('Biology');
  const [sumResult, setSumResult] = useState<{
    summary: string;
    keyTakeaways: string[];
    flashcards: { term: string; definition: string }[];
  } | null>(null);
  const [isSumLoading, setIsSumLoading] = useState(false);

  // Quiz Generator State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizCategory, setQuizCategory] = useState<LearningCategory>('Artificial Intelligence');
  const [quizDifficulty, setQuizDifficulty] = useState('intermediate');
  const [generatedQuiz, setGeneratedQuiz] = useState<Partial<Quiz> | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Study Plan State
  const [planGoal, setPlanGoal] = useState('');
  const [planSubject, setPlanSubject] = useState<LearningCategory>('Computer Science');
  const [planHours, setPlanHours] = useState(2);
  const [planResult, setPlanResult] = useState<{
    schedule: { day: string; title: string; tasks: string[]; timeMinutes: number }[];
    proTip: string;
  } | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Handlers
  const handleSendChat = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg = { role: 'user' as const, content: textToSend.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await api.aiChat(
        textToSend.trim(),
        chatMessages.map((m) => ({ role: m.role, content: m.content })),
        'General Science'
      );
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.text, suggestions: res.actionSuggestions },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to complete request: ${err.message}. Please verify your API key in Settings > Secrets.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRunExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explainTopic.trim()) return;
    setIsExplainLoading(true);
    setExplainResult('');
    try {
      const res = await api.aiExplain(explainTopic.trim(), explainLevel, explainCategory);
      setExplainResult(res.explanation);
    } catch (err: any) {
      setExplainResult(`Error: ${err.message}`);
    } finally {
      setIsExplainLoading(false);
    }
  };

  const handleRunHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwProblem.trim()) return;
    setIsHwLoading(true);
    setHwResult(null);
    try {
      const res = await api.aiHomeworkGuide(hwProblem.trim(), hwSubject, hwAttempt.trim());
      setHwResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsHwLoading(false);
    }
  };

  const handleRunSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumContent.trim()) return;
    setIsSumLoading(true);
    setSumResult(null);
    try {
      const res = await api.aiSummarize(sumContent.trim(), sumSubject);
      setSumResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSumLoading(false);
    }
  };

  const handleRunQuizGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;
    setIsQuizLoading(true);
    setGeneratedQuiz(null);
    try {
      const res = await api.aiGenerateQuiz(quizTopic.trim(), quizCategory, quizDifficulty);
      setGeneratedQuiz(res.quiz);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleRunStudyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planGoal.trim()) return;
    setIsPlanLoading(true);
    setPlanResult(null);
    try {
      const res = await api.aiStudyPlan(planGoal.trim(), planSubject, planHours);
      setPlanResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPlanLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Google Gemini 3.8 Flash Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">NETFLOW AI Academic Studio</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Socratic tutoring, concept deep-dives, homework guidance, note summarization, and diagnostic quiz synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/70 px-3.5 py-2 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Model: gemini-3.8-flash</span>
        </div>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTool('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
            activeTool === 'chat'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Tutor Chat</span>
        </button>

        <button
          onClick={() => setActiveTool('explain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
            activeTool === 'explain'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Concept Explainer</span>
        </button>

        <button
          onClick={() => setActiveTool('homework')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
            activeTool === 'homework'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Homework Guidance</span>
        </button>

        <button
          onClick={() => setActiveTool('summarize')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
            activeTool === 'summarize'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes Summarizer</span>
        </button>

        <button
          onClick={() => setActiveTool('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
            activeTool === 'quiz'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz Generator</span>
        </button>

        <button
          onClick={() => setActiveTool('study_plan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
            activeTool === 'study_plan'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>7-Day Study Plan</span>
        </button>
      </div>

      {/* TOOL 1: Academic Chat Tutor */}
      {activeTool === 'chat' && (
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl overflow-hidden flex flex-col h-[600px]">
          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-2xl p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Action Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendChat(sug)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200" />
                <span>NETFLOW AI reasoning...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask any academic question, derivation, or problem statement..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 transition-all shadow-md active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOOL 2: Concept Explainer */}
      {activeTool === 'explain' && (
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleRunExplain} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Topic or Phenomenon to Master
                </label>
                <input
                  type="text"
                  required
                  value={explainTopic}
                  onChange={(e) => setExplainTopic(e.target.value)}
                  placeholder="e.g. Wave-Particle Duality, Supply & Demand Elasticity, CRISPR Cas9"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={explainCategory}
                  onChange={(e) => setExplainCategory(e.target.value as LearningCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comprehension Level */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Comprehension Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Elementary', 'High School', 'Undergraduate', 'Graduate/Expert'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExplainLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      explainLevel === lvl
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isExplainLoading || !explainTopic.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExplainLoading ? 'Generating Pedagogical Breakdown...' : 'Explain Topic'}</span>
            </button>
          </form>

          {/* Result Output */}
          {explainResult && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
              {explainResult}
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: Homework Guidance */}
      {activeTool === 'homework' && (
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleRunHomework} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
              <select
                value={hwSubject}
                onChange={(e) => setHwSubject(e.target.value as LearningCategory)}
                className="w-full md:w-64 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Problem Statement / Exercise
              </label>
              <textarea
                rows={3}
                required
                value={hwProblem}
                onChange={(e) => setHwProblem(e.target.value)}
                placeholder="Paste the problem statement (e.g. Find the volume of solid obtained by rotating the region bounded by y = x² and y = 4 around x = 2...)"
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Your Initial Thought or Attempt (Optional)
              </label>
              <input
                type="text"
                value={hwAttempt}
                onChange={(e) => setHwAttempt(e.target.value)}
                placeholder="e.g. I used the washer method but got a negative radius term"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isHwLoading || !hwProblem.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isHwLoading ? 'Analyzing Principles...' : 'Get Socratic Guidance'}</span>
            </button>
          </form>

          {hwResult && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Problem Milestones & Theoretical Breakdown</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {hwResult.explanation}
              </p>

              {hwResult.hints && hwResult.hints.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Progressive Hints</span>
                  {hwResult.hints.map((hint, hIdx) => (
                    <div key={hIdx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                      <span className="font-bold text-amber-400 font-mono">Hint {hIdx + 1}:</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: Notes Summarizer & Flashcards */}
      {activeTool === 'summarize' && (
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleRunSummarize} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Paste Lecture Notes / Article</label>
              <textarea
                rows={5}
                required
                value={sumContent}
                onChange={(e) => setSumContent(e.target.value)}
                placeholder="Paste course notes, chapter excerpts, or textbook reading to extract key takeaways and active recall flashcards..."
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSumLoading || !sumContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isSumLoading ? 'Summarizing & Extracting Concepts...' : 'Summarize Notes'}</span>
            </button>
          </form>

          {sumResult && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Executive Summary</h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {sumResult.summary}
                </p>
              </div>

              {sumResult.keyTakeaways?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Key Takeaways</h3>
                  <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-300">
                    {sumResult.keyTakeaways.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {sumResult.flashcards?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Active Recall Flashcards</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sumResult.flashcards.map((fc, fIdx) => (
                      <div key={fIdx} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                        <span className="text-xs font-bold text-white block">{fc.term}</span>
                        <p className="text-xs text-slate-400 leading-relaxed">{fc.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 5: Quiz Generator */}
      {activeTool === 'quiz' && (
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleRunQuizGen} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Topic for Diagnostic Quiz
                </label>
                <input
                  type="text"
                  required
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g. Backpropagation, Photosynthesis Light Reactions, Macroeconomics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value as LearningCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isQuizLoading || !quizTopic.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isQuizLoading ? 'Synthesizing Diagnostic Questions...' : 'Generate 4-Question Quiz'}</span>
            </button>
          </form>

          {generatedQuiz && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{generatedQuiz.title}</h3>
                  <p className="text-xs text-slate-400">{generatedQuiz.description}</p>
                </div>
                <button
                  onClick={() =>
                    onOpenQuiz({
                      ...generatedQuiz,
                      id: `quiz_ai_${Date.now()}`,
                      authorName: 'NETFLOW AI',
                      questions: generatedQuiz.questions || [],
                    })
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Take Quiz Now</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {generatedQuiz.questions?.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <span className="font-bold text-blue-400 block mb-1">Question {idx + 1}: {q.question}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-300 mt-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="p-2 rounded bg-slate-900/60 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">{String.fromCharCode(65 + oIdx)}</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 6: 7-Day Study Plan */}
      {activeTool === 'study_plan' && (
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleRunStudyPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Exam or Learning Goal
                </label>
                <input
                  type="text"
                  required
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  placeholder="e.g. Master Linear Algebra Midterm, Learn React from scratch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hours Available / Day</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={planHours}
                  onChange={(e) => setPlanHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlanLoading || !planGoal.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isPlanLoading ? 'Structuring 7-Day Curriculum...' : 'Generate 7-Day Schedule'}</span>
            </button>
          </form>

          {planResult && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-xs text-blue-200">
                <strong>Pedagogical Neuroscience Tip:</strong> {planResult.proTip}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {planResult.schedule.map((dayItem, dIdx) => (
                  <div key={dIdx} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 font-mono">{dayItem.day}</span>
                      <span className="text-slate-400 font-mono tabular-nums">{dayItem.timeMinutes} mins</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{dayItem.title}</h4>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                      {dayItem.tasks.map((task, tIdx) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
