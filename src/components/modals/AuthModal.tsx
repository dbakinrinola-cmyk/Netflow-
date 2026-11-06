import React, { useState } from 'react';
import { User, UserRole } from '../../types/index.js';
import { api } from '../../services/api.js';
import { X, GraduationCap, School, BookOpen, KeyRound, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Quick Demo Account Switcher
  const handleQuickDemo = async (userId: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.demoLogin(userId);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const res = await api.login(email);
        onSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        const res = await api.register({
          name,
          email,
          role,
          institution,
          password,
        });
        onSuccess(res.user);
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setSuccessMsg(res.message);
        if (res.resetToken) setResetToken(res.resetToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">NETFLOW Account</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Join the Educational Network'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Fast-Track Strip */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            1-Click Test Drive Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('u_alex')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                AC
              </div>
              <div className="truncate">
                <div className="font-semibold text-white truncate">Alex Chen</div>
                <div className="text-[10px] text-slate-400">Student (CS/Math)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('u_elena')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                EV
              </div>
              <div className="truncate">
                <div className="font-semibold text-white truncate">Dr. Vance</div>
                <div className="text-[10px] text-slate-400">Physics Professor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('u_marcus')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                MT
              </div>
              <div className="truncate">
                <div className="font-semibold text-white truncate">Marcus Thorne</div>
                <div className="text-[10px] text-slate-400">CS Creator / Mentor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('u_maya')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                MP
              </div>
              <div className="truncate">
                <div className="font-semibold text-white truncate">Maya Patel</div>
                <div className="text-[10px] text-slate-400">Biologist Educator</div>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              {successMsg}
              {resetToken && (
                <div className="mt-1 font-mono text-[11px] bg-slate-900 p-1.5 rounded">
                  Reset Token: {resetToken}
                </div>
              )}
            </div>
          )}

          {/* Role selector for register */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'student' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'teacher' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('institution')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'institution' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <School className="w-4 h-4" />
                  <span>Institution</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Isaac Newton"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">School / University / Lab</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University or MIT"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to NETFLOW'
              : mode === 'register'
              ? 'Create Learning Account'
              : 'Send Recovery Instructions'}
          </button>

          {/* Mode switch */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
