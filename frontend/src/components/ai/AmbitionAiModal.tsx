import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Plus, Trash2, Edit2, MessageSquare, Mic, MicOff,
  Volume2, VolumeX, BookOpen, FileText, Check, Copy, RefreshCw, Zap
} from 'lucide-react';
import { aiService, AIMessage, AIConversation } from '../../services/aiService';
import toast from 'react-hot-toast';

interface AmbitionAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  contextInfo?: { type: string; title: string; content?: string };
}

const PRESET_PROMPTS = [
  'Explain Newton\'s 3rd law in simple language',
  'Give me 5 practice MCQs on Kinematics with solutions',
  'What are the most important formulas in Chemical Kinetics?',
  'Summarize today\'s lecture key points',
];

const AmbitionAiModal: React.FC<AmbitionAiModalProps> = ({
  isOpen, onClose, initialMessage, contextInfo
}) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Speech Recognition & TTS
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      handleSend(initialMessage);
    }
  }, [initialMessage, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const list = await aiService.getConversations();
      setConversations(list || []);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch {
      setConversations([]);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await aiService.getConversationMessages(convId);
      setMessages(msgs || []);
    } catch {
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setShowSidebar(false);
  };

  const handleDeleteConv = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || loading) return;

    const userMessageText = textToSend.trim();
    setInputMsg('');
    setLoading(true);

    // Optimistic UI insert for user
    const tempUserMsg: AIMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConvId || '',
      role: 'user',
      content: userMessageText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await aiService.sendMessage({
        message: userMessageText,
        conversation_id: activeConvId || undefined,
        lecture_context: contextInfo?.type === 'lecture' ? contextInfo : undefined,
        material_context: contextInfo?.type === 'material' ? contextInfo : undefined,
      });

      if (res.conversation_id && !activeConvId) {
        setActiveConvId(res.conversation_id);
        loadConversations();
      }

      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, res.message]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'AI temporarily unavailable. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  // Speech Recognition (Voice Input)
  const toggleSpeechInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening... Speak your question', { icon: '🎙️' });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMsg(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Could not hear voice input. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      toast.error('Voice recognition failed to start.');
    }
  };

  // Text-To-Speech (Voice Output)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_\\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            width: '100%', maxWidth: 1000, height: '85vh',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 24, boxShadow: 'var(--shadow-xl)',
            display: 'flex', overflow: 'hidden', position: 'relative',
          }}
        >
          {/* Conversation History Sidebar */}
          <div style={{
            width: 280, background: 'var(--card-raised)', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', padding: 16,
          }} className={showSidebar ? 'block' : 'hidden md:flex'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--primary-light)" />
                <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 15 }}>Chat History</span>
              </div>
              <button
                onClick={handleNewChat}
                style={{
                  background: 'var(--primary)', color: 'white', border: 'none',
                  borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Plus size={14} /> New
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {conversations.length === 0 ? (
                <p style={{ color: 'var(--text-faint)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>No saved chats yet</p>
              ) : (
                conversations.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setActiveConvId(c.id); setShowSidebar(false); }}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      background: activeConvId === c.id ? 'var(--primary-light)22' : 'transparent',
                      border: activeConvId === c.id ? '1px solid var(--primary-light)44' : '1px solid transparent',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                      <MessageSquare size={14} style={{ color: activeConvId === c.id ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: activeConvId === c.id ? 700 : 500 }}>
                        {c.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConv(e, c.id)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', opacity: 0.6, cursor: 'pointer', padding: 2 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }} className="md:hidden">
                  <MessageSquare size={20} />
                </button>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.1rem' }}>Ask Ambition AI</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Your Personal 24/7 Academic AI Mentor</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={onClose}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--card-raised)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Context Badge Banner */}
            {contextInfo && (
              <div style={{ padding: '8px 20px', background: 'rgba(124,58,237,0.12)', borderBottom: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} color="var(--primary-light)" />
                <span style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 700 }}>
                  Context Active: {contextInfo.title} ({contextInfo.type})
                </span>
              </div>
            )}

            {/* Messages Feed */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 500, padding: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Sparkles size={32} color="var(--primary-light)" />
                  </div>
                  <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>
                    How can I help your learning today?
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                    Ask about physics laws, chemistry reactions, math formulas, or request practice questions!
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {PRESET_PROMPTS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(preset)}
                        style={{
                          padding: '8px 14px', borderRadius: 20, background: 'var(--card-raised)',
                          border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12,
                          fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)',
                        }}
                      >
                        💡 {preset}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <motion.div
                    key={m.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.role === 'user' ? 'var(--primary-light)' : '#10B981' }}>
                        {m.role === 'user' ? 'You' : 'Ambition AI Mentor'}
                      </span>
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => speakText(m.content)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                          title="Read aloud"
                        >
                          {isSpeaking ? <VolumeX size={13} color="#EF4444" /> : <Volume2 size={13} />}
                        </button>
                      )}
                    </div>

                    <div style={{
                      maxWidth: '85%', padding: '14px 18px', borderRadius: 16,
                      background: m.role === 'user' ? 'var(--primary)' : 'var(--card-raised)',
                      color: m.role === 'user' ? 'white' : 'var(--text)',
                      border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                      fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      {m.content}

                      {/* Source attribution links */}
                      {m.sources && m.sources.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)', display: 'block', marginBottom: 4 }}>
                            📚 Based on Ambition Academy Content:
                          </span>
                          {m.sources.map((s, sIdx) => (
                            <div key={sIdx} style={{ opacity: 0.85 }}>
                              • {s.chunk || s.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-light)', fontSize: 13, fontWeight: 600 }}>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Ambition AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--card)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                onClick={toggleSpeechInput}
                style={{
                  width: 42, height: 42, borderRadius: 12, border: '1px solid var(--border)',
                  background: isListening ? '#EF4444' : 'var(--card-raised)',
                  color: isListening ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
                title={isListening ? 'Stop Listening' : 'Voice Input (Voice Tutor)'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                placeholder={isListening ? 'Listening...' : 'Ask your academic doubt or request study guidance...'}
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                style={{
                  flex: 1, background: 'var(--card-raised)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontSize: 14,
                }}
              />

              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                className="btn-primary"
                style={{ width: 44, height: 42, padding: 0, justifyContent: 'center', opacity: loading || !inputMsg.trim() ? 0.6 : 1 }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AmbitionAiModal;
