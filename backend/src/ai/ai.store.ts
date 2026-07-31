import fs from 'fs';
import path from 'path';
import {
  AIConversation, AIMessage, AIStudyPlan, AIQuizSession,
  AINote, AIWeaknessAnalysis, AIVivaSession, AIRevisionPlan, AIRecommendation
} from './ai.types';

const DATA_DIR = path.join(__dirname, '../../data');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
};

const loadFile = <T>(filename: string, fallback: T): T => {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {}
  return fallback;
};

const saveFile = (filename: string, data: any) => {
  try {
    ensureDataDir();
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`[AIStore] Failed to save ${filename}:`, e);
  }
};

class AIStore {
  private conversations: AIConversation[] = loadFile('ai_conversations.json', []);
  private messages: AIMessage[] = loadFile('ai_messages.json', []);
  private studyPlans: AIStudyPlan[] = loadFile('ai_study_plans.json', []);
  private quizSessions: AIQuizSession[] = loadFile('ai_quiz_sessions.json', []);
  private notes: AINote[] = loadFile('ai_notes.json', []);
  private vivaSessions: AIVivaSession[] = loadFile('ai_viva_sessions.json', []);
  private usage: Record<string, { count: number; date: string }> = loadFile('ai_usage.json', {});

  // Conversations & Messages
  getConversations(userId: string): AIConversation[] {
    return this.conversations
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getConversationById(id: string): AIConversation | undefined {
    return this.conversations.find(c => c.id === id);
  }

  createConversation(userId: string, title: string): AIConversation {
    const newConv: AIConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      title: title || 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.conversations.unshift(newConv);
    saveFile('ai_conversations.json', this.conversations);
    return newConv;
  }

  renameConversation(id: string, title: string): AIConversation | null {
    const conv = this.conversations.find(c => c.id === id);
    if (!conv) return null;
    conv.title = title;
    conv.updated_at = new Date().toISOString();
    saveFile('ai_conversations.json', this.conversations);
    return conv;
  }

  deleteConversation(id: string): boolean {
    const lenBefore = this.conversations.length;
    this.conversations = this.conversations.filter(c => c.id !== id);
    this.messages = this.messages.filter(m => m.conversation_id !== id);
    saveFile('ai_conversations.json', this.conversations);
    saveFile('ai_messages.json', this.messages);
    return this.conversations.length < lenBefore;
  }

  getMessages(conversationId: string): AIMessage[] {
    return this.messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addMessage(msg: Partial<AIMessage>): AIMessage {
    const newMsg: AIMessage = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversation_id: msg.conversation_id || '',
      role: msg.role || 'user',
      content: msg.content || '',
      sources: msg.sources || [],
      created_at: msg.created_at || new Date().toISOString(),
    };
    this.messages.push(newMsg);
    saveFile('ai_messages.json', this.messages);

    // Update conversation timestamp
    const conv = this.conversations.find(c => c.id === newMsg.conversation_id);
    if (conv) {
      conv.updated_at = new Date().toISOString();
      saveFile('ai_conversations.json', this.conversations);
    }
    return newMsg;
  }

  // Study Plans
  getStudyPlan(userId: string): AIStudyPlan | undefined {
    return this.studyPlans.find(p => p.user_id === userId && p.status === 'active');
  }

  saveStudyPlan(plan: Partial<AIStudyPlan>): AIStudyPlan {
    const existingIdx = this.studyPlans.findIndex(p => p.user_id === plan.user_id && p.status === 'active');
    const newPlan: AIStudyPlan = {
      id: plan.id || `plan_${Date.now()}`,
      user_id: plan.user_id!,
      exam: plan.exam || 'JEE Main',
      target_date: plan.target_date || new Date(Date.now() + 90 * 86400000).toISOString(),
      daily_minutes: plan.daily_minutes || 120,
      subjects: plan.subjects || ['Physics', 'Chemistry', 'Mathematics'],
      current_level: plan.current_level || 'intermediate',
      target_score: plan.target_score || '250+',
      tasks: plan.tasks || [],
      status: 'active',
      created_at: plan.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      this.studyPlans[existingIdx] = newPlan;
    } else {
      this.studyPlans.unshift(newPlan);
    }
    saveFile('ai_study_plans.json', this.studyPlans);
    return newPlan;
  }

  updateStudyTaskStatus(userId: string, taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped'): AIStudyPlan | null {
    const plan = this.getStudyPlan(userId);
    if (!plan) return null;
    const task = plan.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      plan.updated_at = new Date().toISOString();
      saveFile('ai_study_plans.json', this.studyPlans);
    }
    return plan;
  }

  // Quiz Sessions
  saveQuizSession(session: Partial<AIQuizSession>): AIQuizSession {
    const newSession: AIQuizSession = {
      id: session.id || `quiz_${Date.now()}`,
      user_id: session.user_id!,
      subject: session.subject || 'Physics',
      topic: session.topic || 'General',
      difficulty: session.difficulty || 'medium',
      questions: session.questions || [],
      userAnswers: session.userAnswers || {},
      score: session.score || 0,
      completed: session.completed || false,
      created_at: session.created_at || new Date().toISOString(),
    };
    this.quizSessions.unshift(newSession);
    saveFile('ai_quiz_sessions.json', this.quizSessions);
    return newSession;
  }

  getQuizSessions(userId: string): AIQuizSession[] {
    return this.quizSessions.filter(q => q.user_id === userId);
  }

  // AI Notes
  saveNote(note: Partial<AINote>): AINote {
    const newNote: AINote = {
      id: note.id || `ainote_${Date.now()}`,
      user_id: note.user_id!,
      title: note.title || 'AI Generated Note',
      source_type: note.source_type || 'custom',
      source_id: note.source_id,
      summary: note.summary || '',
      important_concepts: note.important_concepts || [],
      key_points: note.key_points || [],
      formulas: note.formulas || [],
      examples: note.examples || [],
      common_mistakes: note.common_mistakes || [],
      created_at: note.created_at || new Date().toISOString(),
    };
    this.notes.unshift(newNote);
    saveFile('ai_notes.json', this.notes);
    return newNote;
  }

  getNotes(userId: string): AINote[] {
    return this.notes.filter(n => n.user_id === userId);
  }

  deleteNote(id: string): boolean {
    const lenBefore = this.notes.length;
    this.notes = this.notes.filter(n => n.id !== id);
    saveFile('ai_notes.json', this.notes);
    return this.notes.length < lenBefore;
  }

  // Viva Sessions
  saveVivaSession(session: Partial<AIVivaSession>): AIVivaSession {
    const newSession: AIVivaSession = {
      id: session.id || `viva_${Date.now()}`,
      user_id: session.user_id!,
      subject: session.subject || 'Physics',
      topic: session.topic || 'General',
      difficulty: session.difficulty || 'medium',
      history: session.history || [],
      completed: session.completed || false,
      final_score: session.final_score || 0,
      created_at: session.created_at || new Date().toISOString(),
    };
    const idx = this.vivaSessions.findIndex(v => v.id === newSession.id);
    if (idx !== -1) {
      this.vivaSessions[idx] = newSession;
    } else {
      this.vivaSessions.unshift(newSession);
    }
    saveFile('ai_viva_sessions.json', this.vivaSessions);
    return newSession;
  }

  getVivaSession(id: string): AIVivaSession | undefined {
    return this.vivaSessions.find(v => v.id === id);
  }

  // Usage Rate Limits
  checkAndIncrementUsage(userId: string, limitPerDay: number = 50): { allowed: boolean; current: number } {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    const current = this.usage[key]?.count || 0;
    if (current >= limitPerDay) {
      return { allowed: false, current };
    }
    this.usage[key] = { count: current + 1, date: today };
    saveFile('ai_usage.json', this.usage);
    return { allowed: true, current: current + 1 };
  }
}

export const aiStore = new AIStore();
