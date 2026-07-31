import { AIQuestion, AIStudyPlanTask } from './ai.types';

export const parseAndValidateJson = <T>(text: string, fallback: T): T => {
  if (!text) return fallback;
  try {
    // Clean potential markdown codeblock backticks ```json ... ```
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn('[AI Validator] Failed to parse JSON, returning fallback:', e);
    return fallback;
  }
};

export const validateAIQuestions = (questions: any[]): AIQuestion[] => {
  if (!Array.isArray(questions)) return [];
  return questions.map((q, idx) => ({
    id: q.id || `q_${Date.now()}_${idx}`,
    question: q.question || 'Sample Question',
    options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
    explanation: q.explanation || 'Step-by-step solution.',
    difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    topic: q.topic || 'General Practice',
    questionType: q.questionType || 'MCQ',
  }));
};

export const validateStudyPlanTasks = (tasks: any[]): AIStudyPlanTask[] => {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((t, idx) => ({
    id: t.id || `task_${Date.now()}_${idx}`,
    day: t.day || 'Monday',
    subject: t.subject || 'Physics',
    topic: t.topic || 'Revision',
    duration_minutes: Number(t.duration_minutes) || 45,
    status: ['pending', 'in_progress', 'completed', 'skipped'].includes(t.status) ? t.status : 'pending',
  }));
};
