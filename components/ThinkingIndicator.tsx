
import React from 'react';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-tutor-50 rounded-2xl rounded-tl-none max-w-[80%] animate-pulse border border-tutor-100">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-tutor-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-tutor-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-tutor-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-tutor-700 text-sm font-medium">Solving complex problem...</span>
    </div>
  );
};

export default ThinkingIndicator;
