import React from 'react';
import { Message } from '../store';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            isUser 
              ? 'bg-primary-600 text-white' 
              : isSystem
              ? 'bg-gray-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {isUser ? 'U' : isSystem ? 'S' : 'AI'}
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-600 text-white rounded-br-sm'
              : isSystem
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Selected text badge */}
          {message.selectedText && (
            <div className="mt-2 p-2 bg-black bg-opacity-10 rounded-lg">
              <div className="text-xs opacity-75 mb-1">Selected text:</div>
              <div className="text-xs italic">&quot;{message.selectedText}&quot;</div>
            </div>
          )}
        </div>

        {/* Timestamp and page info */}
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mt-1`}>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {message.pageUrl && (
              <span className="ml-2">
                • {new URL(message.pageUrl).hostname}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
