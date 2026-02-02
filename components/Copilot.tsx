import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: string; // e.g. current page info, active node
}

export const Copilot: React.FC<CopilotProps> = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello. I am the EnvSim Copilot. I can assist with model configuration, scenario reasoning, and data interpretation.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, input, contextData);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-0 w-96 h-[calc(100vh-64px)] bg-sci-panel border-l border-slate-800 shadow-2xl z-30 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-sci-panel">
        <div className="flex items-center gap-2 text-sci-accent">
          <Sparkles size={16} />
          <span className="font-semibold text-sm">Copilot</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-slate-700' : 'bg-sci-accent/20 text-sci-accent'
            }`}>
              {msg.role === 'user' ? <span className="text-xs font-bold">U</span> : <Bot size={16} />}
            </div>
            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                 {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-sci-accent/20 text-sci-accent flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-sci-accent" />
                <span className="text-xs text-slate-400">Reasoning...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-sci-panel">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about scenarios or data..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-sci-accent resize-none h-20 scrollbar-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute bottom-2 right-2 p-1.5 bg-sci-accent text-white rounded-md hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-center text-slate-500">
           AI generated responses may be inaccurate. Verify with simulation data.
        </div>
      </div>
    </div>
  );
};
