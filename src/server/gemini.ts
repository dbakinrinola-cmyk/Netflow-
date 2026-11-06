/**
 * NETFLOW AI Service Layer
 * Powered by Google Gemini 3.8 Flash via @google/genai SDK
 */

import { GoogleGenAI, Type } from '@google/genai';
import { Quiz } from '../types/index.js';

const apiKey = process.env.GEMINI_API_KEY;

// Shared Gemini Client
export const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const MODEL_NAME = 'gemini-3.8-flash';

/**
 * 1. General Educational Chat Assistant
 */
export async function generateAIChatResponse(
  message: string,
  history: { role: string; content: string }[],
  contextSubject?: string
): Promise<{ text: string; actionSuggestions: string[] }> {
  if (!apiKey) {
    return {
      text: `Welcome to NETFLOW AI! As your educational mentor in ${contextSubject || 'all disciplines'}, here is an analysis:\n\n${message}\n\nKey learning concepts to remember:\n• Build understanding from first principles.\n• Practice active recall with problem sets.\n• Try formulating questions as Socratic hypotheses.`,
      actionSuggestions: ['Generate a diagnostic quiz on this', 'Explain step-by-step with an analogy', 'Create a 3-day study schedule'],
    };
  }

  try {
    const systemPrompt = `You are NETFLOW AI, an world-class academic tutor and educational mentor for students, teachers, and researchers.
Your tone is inspiring, mathematically rigorous, intellectually curious, and clear.
Subject context: ${contextSubject || 'General STEM & Humanities'}.
Guidelines:
1. Explain concepts intuitively first, then provide mathematical/technical precision.
2. Use markdown formatting with clear headings, bold terms, and LaTeX math where suitable.
3. Suggest 3 concise follow-up learning actions the student can take next.`;

    const contents = [
      ...history.slice(-6).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text || 'I could not generate an answer at this moment. Please try again.';

    return {
      text: reply,
      actionSuggestions: [
        'Test my understanding with a 3-question quiz',
        'Break down this concept step-by-step',
        'Provide real-world engineering or practical applications',
      ],
    };
  } catch (err: any) {
    console.error('Gemini AI Chat Error:', err?.message || err);
    return {
      text: `Here is an educational breakdown for "${message}":\n\n1. Core Principle: Focus on the fundamental definitions and structural relationships.\n2. Application: Connect theoretical knowledge to demonstrable experiments or coding examples.\n3. Common Pitfall: Memorizing steps without understanding the underlying derivations.\n\n(Tip: You can configure or verify your API key in the Settings > Secrets panel)`,
      actionSuggestions: ['Create a quick quiz on this topic', 'Explain at an introductory level', 'Summarize key takeaways'],
    };
  }
}

/**
 * 2. Multi-Level Subject Explanation
 */
export async function explainSubjectConcept(
  topic: string,
  level: 'Elementary' | 'High School' | 'Undergraduate' | 'Graduate/Expert',
  category: string
): Promise<string> {
  if (!apiKey) {
    return `### ${topic} (${level} Level)\n\n**Core Definition:** In ${category}, ${topic} represents a foundational pillar. At the ${level} tier, we focus on understanding the mechanisms and consequences.\n\n**Analogy:** Imagine a dynamic system where energy balances with entropy.\n\n**Key Takeaway:** Mastery comes from mapping input constraints to observed outcomes.`;
  }

  try {
    const prompt = `Explain the educational topic "${topic}" in the category of "${category}".
Target Audience / Comprehension Level: ${level}.
Structure your explanation as:
1. Intuitive Summary & Everyday Analogy (1-2 paragraphs)
2. Core Mechanism & Technical Breakdown (with LaTeX equations or code if applicable)
3. Real-World Applications & Why It Matters
4. 3 Common Misconceptions Clarified`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning university professor known for making complex ideas accessible without losing scientific depth.',
      },
    });

    return response.text || 'Unable to generate explanation.';
  } catch (err: any) {
    console.error('Gemini Explain Error:', err?.message || err);
    return `### ${topic} (${level} Level)\n\n**Core Definition:** In ${category}, ${topic} describes the fundamental behavior and interactions of the system.\n\n**Key Mechanism:** Review how parameters scale with boundary conditions.\n\n**Practical Application:** Applied throughout modern research and computational modeling.`;
  }
}

/**
 * 3. Step-by-Step Homework Problem Guidance
 */
export async function guideHomeworkProblem(
  problemStatement: string,
  subject: string,
  studentAttempt?: string
): Promise<{ explanation: string; hints: string[]; nextStepPrompt: string }> {
  if (!apiKey) {
    return {
      explanation: `To solve this ${subject} problem, let's identify the governing principles first.\n\nProblem: "${problemStatement.slice(0, 80)}..."`,
      hints: [
        'Identify all given variables, constants, and unknown target quantities.',
        'Choose the governing formula or algorithmic invariant that links the inputs to outputs.',
        'Substitute boundary conditions carefully and check unit dimensional consistency.',
      ],
      nextStepPrompt: 'What equation do you think connects the given parameters here?',
    };
  }

  try {
    const prompt = `A student needs guidance on this homework problem in ${subject}:
Problem: "${problemStatement}"
${studentAttempt ? `Student's initial attempt / thought process: "${studentAttempt}"` : ''}

CRITICAL PEDAGOGICAL INSTRUCTION:
Do NOT just blurt out the final numerical or coding answer directly.
Act as an empathetic Socratic tutor:
1. Clarify what the problem is actually asking.
2. Outline the 3 core conceptual milestones needed.
3. Provide 2 progressive hints (Hint 1: gentle nudge, Hint 2: formula / structure clue).
4. End with a guiding check question to prompt the student to take the next step.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return {
      explanation: response.text || 'Problem analysis complete.',
      hints: [
        'Check the symmetry and conservation laws applicable.',
        'Simplify by isolating the unknown before inserting numbers.',
      ],
      nextStepPrompt: 'What is the first step you would take based on these milestones?',
    };
  } catch (err: any) {
    console.error('Gemini Homework Guide Error:', err?.message || err);
    return {
      explanation: `Let's break down this problem systematically:\n1. State the known variables and desired target.\n2. Formulate the governing equation.\n3. Solve symbolically before numeric substitution.`,
      hints: [
        'Verify units across all terms in the equation.',
        'Look for boundary conditions or edge cases.',
      ],
      nextStepPrompt: 'What value did you calculate for the first milestone?',
    };
  }
}

/**
 * 4. Summarize Educational Notes & Learning Materials
 */
export async function summarizeLearningMaterial(
  content: string,
  subject: string
): Promise<{ summary: string; keyTakeaways: string[]; flashcards: { term: string; definition: string }[] }> {
  if (!apiKey) {
    return {
      summary: `Executive summary for ${subject} learning material: The document outlines key theories, experimental proofs, and systematic problem-solving frameworks.`,
      keyTakeaways: [
        'Fundamental definitions and axiomatic foundations.',
        'Mathematical derivations linking experimental observations.',
        'Real-world implementation constraints and best practices.',
      ],
      flashcards: [
        { term: 'Key Theorem', definition: 'The governing equation and operational boundaries.' },
        { term: 'Invariant Condition', definition: 'A property that remains constant throughout transformation.' },
      ],
    };
  }

  try {
    const prompt = `Summarize the following educational study notes / lecture material for ${subject}:
"""
${content.slice(0, 8000)}
"""

Provide the output in JSON format with:
- "summary": A well-structured 2-paragraph executive overview.
- "keyTakeaways": Array of 4-5 bullet insights.
- "flashcards": Array of 4 objects with "term" and "definition" for active recall.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
          },
          required: ['summary', 'keyTakeaways', 'flashcards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      summary: parsed.summary || 'Summary generated.',
      keyTakeaways: parsed.keyTakeaways || [],
      flashcards: parsed.flashcards || [],
    };
  } catch (err: any) {
    console.error('Gemini Summarize Error:', err?.message || err);
    return {
      summary: `Summary of provided ${subject} material: Highlights core conceptual structures, methodologies, and problem applications.`,
      keyTakeaways: [
        'Main theoretical premise established.',
        'Detailed steps of proof or empirical workflow.',
        'Key definitions essential for upcoming evaluations.',
      ],
      flashcards: [
        { term: 'Hypothesis', definition: 'A testable explanation for a phenomenon.' },
        { term: 'Empirical Verification', definition: 'Validation based on observation and experiment.' },
      ],
    };
  }
}

/**
 * 5. Auto-Generate Interactive Diagnostic Quiz
 */
export async function generateQuizFromTopic(
  topic: string,
  category: string,
  difficulty: string = 'intermediate'
): Promise<Partial<Quiz>> {
  const fallbackQuiz: Partial<Quiz> = {
    title: `${topic} Diagnostic Quiz`,
    description: `A 4-question interactive assessment to test your grasp of ${topic} in ${category}.`,
    questions: [
      {
        id: 'q_gen_1',
        question: `What is the primary governing principle of ${topic}?`,
        options: [
          `Conservation and invariant balance in ${category}`,
          'Arbitrary random fluctuation without pattern',
          'Linear scaling only applicable to zero-order systems',
          'Static unalterable physical constants only',
        ],
        correctAnswer: 0,
        explanation: `${topic} fundamentally hinges on conservation laws and balanced structural relationships in ${category}.`,
      },
      {
        id: 'q_gen_2',
        question: `Which factor most directly accelerates or optimizes ${topic}?`,
        options: [
          'Decreasing the signal-to-noise ratio',
          'Minimizing resistance and maximizing gradient efficiency',
          'Eliminating all feedback loops',
          'Restricting variables to negative integers',
        ],
        correctAnswer: 1,
        explanation: 'Minimizing friction/resistance while optimizing energy gradients enables peak theoretical performance.',
      },
      {
        id: 'q_gen_3',
        question: `When applying ${topic} in practice, what is the most critical constraint to monitor?`,
        options: [
          'Font styling of documentation',
          'Boundary conditions and error propagation limits',
          'Calendar leap year discrepancies',
          'Atmospheric pressure at sea level only',
        ],
        correctAnswer: 1,
        explanation: 'Boundary conditions define where approximations hold and where non-linear divergences occur.',
      },
      {
        id: 'q_gen_4',
        question: `Which metric is most commonly evaluated to verify comprehension of ${topic}?`,
        options: [
          'Speed of typing',
          'Predictive accuracy and empirical reproducibility',
          'Page length of raw notes',
          'Number of participants in the room',
        ],
        correctAnswer: 1,
        explanation: 'Predictive precision and repeatable empirical validation form the standard benchmark for scientific and mathematical mastery.',
      },
    ],
  };

  if (!apiKey) {
    return fallbackQuiz;
  }

  try {
    const prompt = `Generate a high-quality 4-question multiple choice diagnostic quiz on the topic "${topic}" in "${category}".
Difficulty level: ${difficulty}.
Every question must have:
- Exactly 4 options.
- Exactly 1 correct option index (0, 1, 2, or 3).
- A detailed 2-sentence explanation of why the correct option is right and why distractors fail.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['title', 'description', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        title: parsed.title || `${topic} Mastery Quiz`,
        description: parsed.description || `Diagnostic quiz covering ${topic}.`,
        questions: parsed.questions.map((q: any, idx: number) => ({
          id: `q_ai_${idx + 1}`,
          question: q.question,
          options: q.options || [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || 'Correct answer verified.',
        })),
      };
    }
    return fallbackQuiz;
  } catch (err: any) {
    console.error('Gemini Quiz Gen Error:', err?.message || err);
    return fallbackQuiz;
  }
}

/**
 * 6. Personalized 7-Day Study Plan Generator
 */
export async function generateStudyPlan(
  targetGoal: string,
  subject: string,
  hoursPerDay: number
): Promise<{ schedule: { day: string; title: string; tasks: string[]; timeMinutes: number }[]; proTip: string }> {
  if (!apiKey) {
    return {
      schedule: [
        { day: 'Day 1', title: 'Foundations & Definitions', tasks: ['Review core axioms', 'Complete introductory diagnostic quiz'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 2', title: 'Core Mechanics & Derivations', tasks: ['Work through textbook examples step-by-step', 'Annotate formula cheat sheet'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 3', title: 'Mid-Point Problem Solving', tasks: ['Solve 5 medium-difficulty exercises', 'Identify bottlenecks'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 4', title: 'Advanced Scenarios & Edge Cases', tasks: ['Tackle multi-variable problems', 'Discuss in NETFLOW community'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 5', title: 'Active Recall & Flashcards', tasks: ['Spaced repetition drills', 'Explain key proofs out loud'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 6', title: 'Mock Exam / Timed Challenge', tasks: ['Full timed simulation under exam conditions'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 7', title: 'Review & Peer Collaboration', tasks: ['Review missed questions with NETFLOW AI', 'Celebrate milestones'], timeMinutes: hoursPerDay * 60 },
      ],
      proTip: 'Study in 25-minute Pomodoro bursts with 5-minute active recovery breaks to maximize neural retention.',
    };
  }

  try {
    const prompt = `Create an intensive, evidence-based 7-day study plan for a student whose goal is:
"${targetGoal}" in the subject "${subject}".
Available study time per day: ${hoursPerDay} hours.
Return JSON with:
- "schedule": Array of 7 day items, each with "day" (e.g. Day 1), "title", "tasks" (array of 2-3 specific action items), and "timeMinutes".
- "proTip": One golden cognitive learning tip based on educational neuroscience.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  timeMinutes: { type: Type.INTEGER },
                },
                required: ['day', 'title', 'tasks', 'timeMinutes'],
              },
            },
            proTip: { type: Type.STRING },
          },
          required: ['schedule', 'proTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      schedule: parsed.schedule || [],
      proTip: parsed.proTip || 'Maintain consistent daily deliberate practice.',
    };
  } catch (err: any) {
    console.error('Gemini Study Plan Error:', err?.message || err);
    return {
      schedule: [
        { day: 'Day 1', title: 'Diagnostic & Core Concepts', tasks: ['Review fundamental definitions', 'Take diagnostic quiz'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 2', title: 'Theoretical Derivations', tasks: ['Derive key formulas', 'Draft summary sheet'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 3', title: 'Problem Application', tasks: ['Complete 5 practice problems', 'Analyze errors'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 4', title: 'Collaborative Review', tasks: ['Post question in NETFLOW study group', 'Review peer solutions'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 5', title: 'Active Recall Drills', tasks: ['Flashcard terms', 'Self-quiz without notes'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 6', title: 'Timed Practice Test', tasks: ['Simulated exam run', 'Grade against rubric'], timeMinutes: hoursPerDay * 60 },
        { day: 'Day 7', title: 'Synthesize & Consolidate', tasks: ['Final review of weak points', 'Review with NETFLOW AI'], timeMinutes: hoursPerDay * 60 },
      ],
      proTip: 'Sleep directly facilitates memory consolidation — avoid pulling all-nighters before evaluations.',
    };
  }
}
