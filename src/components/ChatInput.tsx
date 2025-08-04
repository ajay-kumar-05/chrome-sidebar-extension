import React, { useState, useRef } from 'react';
import { useChatStore } from '../store';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedText } = useChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      {/* Selected text indicator */}
      {selectedText && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Selected text:
            </div>
            <button
              onClick={() => useChatStore.getState().setSelectedText('')}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
            &quot;{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}&quot;
          </div>
        </div>
      )}

      {/* Chat input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={selectedText ? "Ask about the selected text..." : "Ask me anything..."}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            rows={1}
          />
          
          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="absolute right-2 bottom-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          'Explain this page',
          'What is this about?',
          'Summarize key points',
          'Translate to English'
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setMessage(suggestion)}
            disabled={disabled}
            className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
