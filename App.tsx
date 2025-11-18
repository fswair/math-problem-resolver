
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Image as ImageIcon, X, Camera, Loader2 } from 'lucide-react';
import { Message, ChatState } from './types';
import { sendMessageToGemini } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import ThinkingIndicator from './components/ThinkingIndicator';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        text: "Hello! I'm your AI Math Solver. \n\nUpload a photo of any math problem or type it in, and I'll provide a complete, step-by-step solution instantly.",
        timestamp: Date.now(),
      }
    ],
    isLoading: false,
    error: null,
  });

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isLoading, scrollToBottom]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || state.isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    // 1. Optimistic update
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isLoading: true,
      error: null,
    }));

    setInputText('');
    setSelectedImage(null);

    try {
      // 2. API Call
      const responseText = await sendMessageToGemini(
        state.messages,
        inputText,
        selectedImage || undefined
      );

      const newModelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newModelMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "I'm having trouble connecting to my reasoning center. Please try again.",
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-paper">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-100 px-6 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tutor-100 flex items-center justify-center text-tutor-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif font-bold text-slate-800 text-lg">AI Math Solver</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Powered by Gemini 3 Pro</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        <div className="max-w-3xl mx-auto w-full pb-4">
          {state.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {state.isLoading && (
            <div className="flex justify-start mb-6">
              <ThinkingIndicator />
            </div>
          )}
          
          {state.error && (
            <div className="flex justify-center my-4">
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100">
                {state.error}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white/80 backdrop-blur-md border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto w-full">
          
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-3 relative inline-block animate-in fade-in slide-in-from-bottom-2">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md group">
                <img src={selectedImage} alt="Preview" className="h-32 w-auto object-cover bg-slate-100" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button 
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white text-slate-600 rounded-full p-1 transition-all shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-tutor-300 focus-within:ring-4 focus-within:ring-tutor-100 transition-all shadow-sm">
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-tutor-600 hover:bg-tutor-50 rounded-full transition-colors"
              title="Upload image"
            >
              {selectedImage ? <ImageIcon className="text-tutor-600" /> : <Camera />}
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Snap a photo of a math problem..."
              className="flex-1 bg-transparent border-0 focus:ring-0 p-3 max-h-32 resize-none text-slate-800 placeholder:text-slate-400"
              rows={1}
              style={{ minHeight: '48px' }}
            />

            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && !selectedImage) || state.isLoading}
              className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center
                ${(!inputText.trim() && !selectedImage) || state.isLoading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-tutor-600 text-white shadow-md hover:bg-tutor-700 hover:scale-105 active:scale-95'
                }`}
            >
              {state.isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">Gemini 3.0 Pro uses extensive thinking to provide accurate solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
