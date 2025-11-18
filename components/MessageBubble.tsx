import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`relative max-w-[85%] md:max-w-[70%] p-5 rounded-2xl shadow-sm text-base leading-relaxed overflow-hidden
          ${isUser 
            ? 'bg-tutor-600 text-white rounded-tr-none' 
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}
      >
        {/* Image Attachment */}
        {message.image && (
          <div className="mb-4 rounded-lg overflow-hidden border border-white/20">
            <img 
              src={message.image} 
              alt="User attachment" 
              className="max-h-64 w-auto object-contain bg-black/10"
            />
          </div>
        )}

        {/* Text Content */}
        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Customize styling for code blocks if needed
              code({ node, className, children, ...props }) {
                return (
                  <code className={`${className} bg-black/10 rounded px-1 py-0.5`} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        
        {/* Timestamp / Metadata */}
        <div className={`text-[10px] mt-2 opacity-70 text-right uppercase tracking-wider font-semibold`}>
          {isUser ? 'You' : 'Tutor'}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;