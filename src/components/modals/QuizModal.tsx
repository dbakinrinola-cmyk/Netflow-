import React, { useState } from 'react';
import { Quiz } from '../../types/index.js';
import { X, CheckCircle2, AlertCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onSubmitResult?: (score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose, onSubmitResult }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = quiz.questions[currentIdx];
  const selectedOption = selectedAnswers[currentIdx];

  const handleSelectOption = (optionIdx: number) => {
    if (showExplanation || isCompleted) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Complete quiz
      setIsCompleted(true);
      const correct = selectedAnswers.filter((ans, idx) => ans === quiz.questions[idx].correctAnswer).length;
      const score = Math.round((correct / quiz.questions.length) * 100);
      if (score >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
      if (onSubmitResult) onSubmitResult(score);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowExplanation(false);
    setIsCompleted(false);
  };

  const correctCount = selectedAnswers.filter((ans, idx) => ans === quiz.questions[idx].correctAnswer).length;
  const scorePct = Math.round((correctCount / quiz.questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              QZ
            </div>
            <div>
              <h2 className="text-base font-bold text-white line-clamp-1">{quiz.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{quiz.category}</span>
                <span>·</span>
                <span>By {quiz.authorName}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">{quiz.questions.length} Questions</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isCompleted ? (
            <div>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
                  <span className="font-mono tabular-nums">{Math.round(((currentIdx + 1) / quiz.questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question statement */}
              <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-6 leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === currentQ.correctAnswer;
                  let btnStyle = 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200';

                  if (showExplanation) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-slate-900/40 border-slate-800/80 text-slate-500';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-blue-600/30 border-blue-500 text-blue-200';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 text-sm md:text-base ${btnStyle}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0 font-mono">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 pt-0.5">{opt}</span>
                      {showExplanation && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {showExplanation && isSelected && !isCorrect && (
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation card */}
              {showExplanation && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                    <Award className="w-4 h-4" />
                    <span>Scientific Explanation</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-lg">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Quiz Completed!</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                {scorePct >= 70
                  ? 'Outstanding comprehension! You have demonstrated strong grasp of these concepts.'
                  : 'Good practice session. Review the explanations to reinforce your core knowledge.'}
              </p>

              <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-8">
                <div>
                  <div className="text-3xl font-black text-white font-mono tabular-nums">{scorePct}%</div>
                  <div className="text-xs text-slate-400">Total Score</div>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div>
                  <div className="text-3xl font-black text-blue-400 font-mono tabular-nums">
                    {correctCount}/{quiz.questions.length}
                  </div>
                  <div className="text-xs text-slate-400">Correct Answers</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {!isCompleted && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {showExplanation ? 'Review the explanation above' : 'Select an option to evaluate'}
            </span>
            <button
              onClick={handleNext}
              disabled={!showExplanation}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                showExplanation
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>{currentIdx === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
