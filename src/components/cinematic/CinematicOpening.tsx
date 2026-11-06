/**
 * NETFLOW Cinematic Opening Sequence
 * "Connect. Discover. Learn. Grow."
 * - Center electric-blue particle
 * - Expanding digital network & student connection nodes
 * - NETFLOW logo reveal
 * - Slow cursive handwriting SVG animation of "NETFLOW"
 * - Tagline & subtitle presentation
 * - Anamorphic blue light sweep
 * - Smooth transition into application
 */

import React, { useState, useEffect, useRef } from 'react';

interface CinematicOpeningProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const CinematicOpening: React.FC<CinematicOpeningProps> = ({ onComplete, onSkip }) => {
  // Animation phases:
  // 0: Deep dark void
  // 1: Center glowing electric-blue particle appears (0.8s)
  // 2: Particle expands into flowing digital network (2.0s)
  // 3: NETFLOW emblem emerges (3.6s)
  // 4: Cursive handwriting animation starts (4.8s)
  // 5: Tagline reveal (7.4s)
  // 6: Subtitle reveal (8.6s)
  // 7: Blue light sweep passes across logo (9.4s)
  // 8: Smooth dissolve into the app (11.0s -> 11.8s)
  const [phase, setPhase] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase(1), 600));   // Particle emerges
    timers.push(setTimeout(() => setPhase(2), 1800));  // Network expands
    timers.push(setTimeout(() => setPhase(3), 3400));  // Logo emblem emerges
    timers.push(setTimeout(() => setPhase(4), 4600));  // Cursive handwriting starts
    timers.push(setTimeout(() => setPhase(5), 7200));  // Tagline appears
    timers.push(setTimeout(() => setPhase(6), 8400));  // Subtitle appears
    timers.push(setTimeout(() => setPhase(7), 9200));  // Light sweep passes
    timers.push(setTimeout(() => {
      setIsFadingOut(true);
    }, 11000));                                         // Start smooth fade
    timers.push(setTimeout(() => {
      onComplete();
    }, 12000));                                         // Complete sequence

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  // Ambient Network Particle Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Knowledge/student network nodes
    const nodeCount = 38;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulse: number;
      pulseSpeed: number;
    }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: width / 2 + (Math.random() - 0.5) * width * 0.7,
        y: height / 2 + (Math.random() - 0.5) * height * 0.7,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        alpha: Math.random() * 0.6 + 0.3,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const edgeAlpha = (1 - dist / 160) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${edgeAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        const currentAlpha = n.alpha + Math.sin(n.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${Math.max(0.1, currentAlpha)})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onSkip) onSkip();
      onComplete();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#050811] flex items-center justify-center transition-opacity duration-1000 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Interactive Starlight/Network Canvas (Phases >= 2) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
          phase >= 2 ? 'opacity-70' : 'opacity-0'
        }`}
      />

      {/* Deep Radial Vignette Overlay */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,17,0.7)_70%,#050811_100%)]" />

      {/* Skip Button (Elegant Glass Pill) */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white text-xs font-semibold tracking-wide transition-all backdrop-blur-md active:scale-95 flex items-center gap-1.5"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] text-blue-400 font-mono">→</span>
      </button>

      {/* Central Sequence Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full">
        {/* =============================================================== */}
        {/* STEP 2: The Glowing Electric-Blue Central Particle             */}
        {/* =============================================================== */}
        <div
          className={`relative transition-all duration-1000 ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          {/* Outer Breathing Halo */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-400/20 to-indigo-600/30 blur-2xl transition-all duration-1000 ${
              phase >= 2 ? 'scale-150 opacity-80' : 'scale-90 opacity-40'
            }`}
          />

          {/* Central Point of Light */}
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-700 shadow-[0_0_20px_#38bdf8,0_0_40px_#2563eb,0_0_60px_#60a5fa] ${
              phase === 1
                ? 'scale-125 animate-ping'
                : phase >= 2
                ? 'scale-100'
                : 'scale-0'
            }`}
          />
        </div>

        {/* =============================================================== */}
        {/* STEP 3 & 4: Expanding Digital Network (Nodes & Connection Lines)*/}
        {/* =============================================================== */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[480px] md:h-[480px] pointer-events-none transition-all duration-1000 ${
            phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            {/* Concentric Orbit Waves */}
            <circle
              cx="200"
              cy="200"
              r="75"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="animate-[spin_40s_linear_infinite]"
            />
            <circle
              cx="200"
              cy="200"
              r="130"
              stroke="rgba(37, 99, 235, 0.2)"
              strokeWidth="1.2"
              strokeDasharray="8 6"
              className="animate-[spin_55s_linear_infinite_reverse]"
            />
            <circle
              cx="200"
              cy="200"
              r="175"
              stroke="rgba(96, 165, 250, 0.12)"
              strokeWidth="0.8"
            />

            {/* Radiant Laser Connection Lines (Students Connecting through Knowledge) */}
            <g
              className={`transition-opacity duration-1000 ${
                phase >= 2 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Line 1 */}
              <line
                x1="200"
                y1="200"
                x2="110"
                y2="120"
                stroke="url(#lineGrad1)"
                strokeWidth="1.5"
                strokeDasharray="140"
                strokeDashoffset={phase >= 2 ? '0' : '140'}
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              {/* Line 2 */}
              <line
                x1="200"
                y1="200"
                x2="290"
                y2="110"
                stroke="url(#lineGrad2)"
                strokeWidth="1.5"
                strokeDasharray="150"
                strokeDashoffset={phase >= 2 ? '0' : '150'}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s' }}
              />
              {/* Line 3 */}
              <line
                x1="200"
                y1="200"
                x2="310"
                y2="280"
                stroke="url(#lineGrad1)"
                strokeWidth="1.5"
                strokeDasharray="160"
                strokeDashoffset={phase >= 2 ? '0' : '160'}
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s' }}
              />
              {/* Line 4 */}
              <line
                x1="200"
                y1="200"
                x2="90"
                y2="270"
                stroke="url(#lineGrad2)"
                strokeWidth="1.5"
                strokeDasharray="150"
                strokeDashoffset={phase >= 2 ? '0' : '150'}
                style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s' }}
              />
              {/* Line 5: Lateral connection representing student-to-student peer mesh */}
              <line
                x1="110"
                y1="120"
                x2="290"
                y2="110"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="1"
                strokeDasharray="180"
                strokeDashoffset={phase >= 2 ? '0' : '180'}
                style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s' }}
              />
              <line
                x1="310"
                y1="280"
                x2="90"
                y2="270"
                stroke="rgba(96, 165, 250, 0.3)"
                strokeWidth="1"
                strokeDasharray="220"
                strokeDashoffset={phase >= 2 ? '0' : '220'}
                style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' }}
              />

              {/* Student Connection Nodes */}
              <circle cx="110" cy="120" r="5" fill="#38bdf8" filter="url(#glowFilter)" />
              <circle cx="290" cy="110" r="4.5" fill="#60a5fa" filter="url(#glowFilter)" />
              <circle cx="310" cy="280" r="5" fill="#3b82f6" filter="url(#glowFilter)" />
              <circle cx="90" cy="270" r="4" fill="#38bdf8" filter="url(#glowFilter)" />
            </g>

            {/* Gradient and Filter Definitions */}
            <defs>
              <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* =============================================================== */}
        {/* STEP 5: NETFLOW Emblem Logo Appears Elegantly                   */}
        {/* =============================================================== */}
        <div
          className={`relative z-10 mb-6 transition-all duration-1000 transform ${
            phase >= 3
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-90'
          }`}
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 p-[1.5px] shadow-[0_0_50px_rgba(37,99,235,0.45)]">
            <div className="w-full h-full rounded-[22px] bg-[#070b18] flex items-center justify-center relative overflow-hidden">
              {/* Inner ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25)_0%,transparent_70%)]" />

              {/* Stylized 'N' Geometry with Interconnected Nodes */}
              <svg
                viewBox="0 0 100 100"
                className="w-12 h-12 md:w-14 md:h-14 overflow-visible"
              >
                <path
                  d="M28 72 L28 28 Q28 24 33 26 L67 74 Q72 76 72 72 L72 28"
                  fill="none"
                  stroke="url(#emblemGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="28" cy="28" r="4.5" fill="#38bdf8" />
                <circle cx="28" cy="72" r="4.5" fill="#2563eb" />
                <circle cx="72" cy="28" r="4.5" fill="#60a5fa" />
                <circle cx="72" cy="72" r="4.5" fill="#4f46e5" />
                <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
                <defs>
                  <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Subtle Blue Light Sweep Overlay (Phase 7) */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                  phase >= 7 ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background:
                    'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.7) 48%, rgba(56,189,248,0.9) 52%, transparent 80%)',
                  animation: phase >= 7 ? 'lightSweep 1.6s ease-in-out forwards' : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* STEP 6: Slow, Smooth Cursive Handwriting Animation of "NETFLOW"*/}
        {/* =============================================================== */}
        <div className="relative z-10 w-full max-w-lg md:max-w-2xl px-2 mb-3">
          <svg
            viewBox="0 0 680 150"
            className="w-full h-auto overflow-visible drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]"
          >
            <defs>
              <linearGradient id="cursiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="35%" stopColor="#38bdf8" />
                <stop offset="70%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>

              {/* Pen tip glow filter */}
              <filter id="penGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Handcrafted continuous cursive path for "NETFLOW" */}
            {/* Elegant calligraphic curves connecting N -> E -> T -> F -> L -> O -> W */}
            <path
              id="cursiveTextPath"
              d="
                M 45,120 
                C 50,70 65,30 85,25 
                C 105,20 95,85 110,120 
                C 115,100 145,35 170,25 
                C 190,18 190,80 195,120 
                C 195,120 205,80 230,70
                C 255,60 265,95 240,115
                C 225,128 215,115 225,95
                C 235,75 255,80 270,118
                C 275,100 285,45 295,30
                C 298,25 305,25 310,32
                M 280,55 Q 315,50 325,58
                M 310,118
                C 320,80 340,30 355,20
                C 365,15 355,80 348,135
                C 344,145 352,142 360,130
                C 368,118 362,85 375,82
                C 390,80 395,95 385,118
                C 392,100 415,25 430,22
                C 440,20 435,75 430,118
                C 430,118 445,125 465,115
                C 475,85 490,75 515,75
                C 535,75 545,95 530,118
                C 515,130 495,125 495,100
                C 495,80 520,75 540,82
                C 555,88 560,105 565,118
                C 570,100 585,82 595,85
                C 605,88 595,115 605,118
                C 615,100 630,82 640,85
                C 650,88 645,115 655,115
                C 665,115 675,100 680,95
              "
              fill="none"
              stroke="url(#cursiveGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1600"
              strokeDashoffset={phase >= 4 ? 0 : 1600}
              style={{
                transition: phase >= 4 ? 'stroke-dashoffset 3.2s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              }}
            />

            {/* Glowing Writing Pen Tip (Follows active stroke during writing) */}
            {phase === 4 && (
              <circle
                r="6"
                fill="#ffffff"
                filter="url(#penGlow)"
                className="animate-pulse"
                style={{
                  offsetPath: `path("M 45,120 C 50,70 65,30 85,25 C 105,20 95,85 110,120 C 115,100 145,35 170,25 C 190,18 190,80 195,120 C 195,120 205,80 230,70 C 255,60 265,95 240,115 C 225,128 215,115 225,95 C 235,75 255,80 270,118 C 275,100 285,45 295,30 C 298,25 305,25 310,32 M 280,55 Q 315,50 325,58 M 310,118 C 320,80 340,30 355,20 C 365,15 355,80 348,135 C 344,145 352,142 360,130 C 368,118 362,85 375,82 C 390,80 395,95 385,118 C 392,100 415,25 430,22 C 440,20 435,75 430,118 C 430,118 445,125 465,115 C 475,85 490,75 515,75 C 535,75 545,95 530,118 C 515,130 495,125 495,100 C 495,80 520,75 540,82 C 555,88 560,105 565,118 C 570,100 585,82 595,85 C 605,88 595,115 605,118 C 615,100 630,82 640,85 C 650,88 645,115 655,115 C 665,115 675,100 680,95")`,
                  animation: 'followPath 3.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                }}
              />
            )}

            {/* Letter Typography Overlay for perfect legibility after drawing settles */}
            <text
              x="50%"
              y="110"
              textAnchor="middle"
              className={`font-serif tracking-widest text-transparent fill-clip transition-opacity duration-1000 ${
                phase >= 5 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                fontFamily: "'Dancing Script', 'Alex Brush', cursive",
                fontSize: '82px',
                fontWeight: 700,
                fill: 'url(#cursiveGrad)',
              }}
            >
              Netflow
            </text>
          </svg>
        </div>

        {/* =============================================================== */}
        {/* STEP 7: Tagline ("Connect. Discover. Learn. Grow.")             */}
        {/* =============================================================== */}
        <div
          className={`relative z-10 transition-all duration-1000 transform ${
            phase >= 5
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <div className="flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base font-semibold tracking-wider text-slate-200">
            <span className="text-white hover:text-blue-300 transition-colors">Connect</span>
            <span className="text-blue-400 font-bold">·</span>
            <span className="text-cyan-300 hover:text-white transition-colors">Discover</span>
            <span className="text-blue-400 font-bold">·</span>
            <span className="text-blue-300 hover:text-white transition-colors">Learn</span>
            <span className="text-blue-400 font-bold">·</span>
            <span className="text-emerald-300 hover:text-white transition-colors">Grow</span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* STEP 8: Subtitle ("Your world of knowledge.")                   */}
        {/* =============================================================== */}
        <div
          className={`relative z-10 mt-3 transition-all duration-1000 transform ${
            phase >= 6
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <p className="text-xs md:text-sm font-medium tracking-widest text-slate-400 uppercase font-mono">
            Your world of knowledge.
          </p>
        </div>

        {/* =============================================================== */}
        {/* STEP 9: Subtle Anamorphic Blue Light Sweep Across Entire Brand  */}
        {/* =============================================================== */}
        {phase >= 7 && (
          <div
            className="absolute top-1/2 left-0 right-0 h-40 -translate-y-1/2 pointer-events-none z-20"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.02) 20%, rgba(56,189,248,0.3) 45%, rgba(255,255,255,0.7) 50%, rgba(56,189,248,0.3) 55%, transparent 100%)',
              animation: 'lightSweep 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            }}
          />
        )}
      </div>

      {/* Bottom Progress Pulse Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 opacity-60">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all duration-500 ${
              phase >= s ? 'w-5 bg-blue-500 shadow-[0_0_8px_#38bdf8]' : 'w-1.5 bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
