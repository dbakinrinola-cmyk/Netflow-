import React, { useState, useEffect } from 'react';
import { User, Conversation, Message } from '../../types/index.js';
import { api } from '../../services/api.js';
import { Send, FileText, HelpCircle, CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';

interface MessagesViewProps {
  currentUser: User;
  onOpenPDF?: (material: any) => void;
  onOpenQuiz?: (quiz: any) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ currentUser, onOpenPDF, onOpenQuiz }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !activeConv) {
        setActiveConv(res.conversations[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.getMessages(convId);
      setMessages(res.messages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeConv || isSending) return;

    const partner = activeConv.participants.find((p) => p.id !== currentUser.id);
    setIsSending(true);
    try {
      const res = await api.sendMessage({
        conversationId: activeConv.id,
        recipientId: partner?.id,
        content: msgInput.trim(),
      });
      setMessages((prev) => [...prev, res.message]);
      setMsgInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const partner = activeConv?.participants.find((p) => p.id !== currentUser.id);

  return (
    <div className="max-w-5xl mx-auto rounded-3xl bg-[#0f172a]/95 border border-slate-800/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-140px)] min-h-[580px]">
      {/* Left Conversations List */}
      <div className="md:col-span-5 border-r border-slate-800 flex flex-col bg-slate-900/40">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Direct Study Lounge</h2>
          <span className="text-xs text-blue-400 font-mono">{conversations.length} chats</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No active conversations. Connect with teachers or students in Discover!</div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== currentUser.id) || conv.participants[0];
              const isSelected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    isSelected ? 'bg-slate-800/90' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <img
                    src={other.avatar}
                    alt={other.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-white truncate">{other.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {conv.lastMessage
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content || other.institution || other.role}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Messages Area */}
      <div className="md:col-span-7 flex flex-col bg-[#0f172a]">
        {partner ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{partner.name}</span>
                    {partner.verifiedEducator && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <span className="text-xs text-slate-400">{partner.institution || partner.role}</span>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p>{m.content}</p>

                      {/* Attachment if present */}
                      {m.attachmentType && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-black/20 border border-white/10 flex items-center gap-2">
                          {m.attachmentType === 'pdf' ? (
                            <FileText className="w-4 h-4 text-rose-300 shrink-0" />
                          ) : (
                            <HelpCircle className="w-4 h-4 text-cyan-300 shrink-0" />
                          )}
                          <span className="text-xs font-semibold truncate flex-1">{m.attachmentTitle || 'Attachment'}</span>
                        </div>
                      )}

                      <span
                        className={`text-[10px] block mt-1 text-right font-mono ${
                          isMe ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder={`Message ${partner.name}...`}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSending || !msgInput.trim()}
                className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
            <p className="text-sm">Select a conversation to start direct peer learning.</p>
          </div>
        )}
      </div>
    </div>
  );
};
