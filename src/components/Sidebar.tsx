import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, useUIStore } from '../store';
import { aiService } from '../services/ai';
import SidebarHeader from './SidebarHeader';
import SettingsPanel from './SettingsPanel';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function Sidebar() {
  const {
    messages,
    isLoading,
    currentPageUrl,
    selectedText,
    apiKey,
    model,
    addMessage,
    setLoading,
  } = useChatStore();

  const { theme } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pageContext, setPageContext] = useState<{
    url: string;
    title: string;
    content?: string;
  } | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get page context when URL changes
  useEffect(() => {
    if (currentPageUrl) {
      // In a real extension, this would get the actual page content
      setPageContext({
        url: currentPageUrl,
        title: document.title || 'Unknown Page',
        content: document.body?.innerText?.substring(0, 5000) || '',
      });
    }
  }, [currentPageUrl]);

  // Set up AI service with API key
  useEffect(() => {
    if (apiKey) {
      aiService.setApiKey(apiKey);
    }
  }, [apiKey]);

  const handleSendMessage = async (content: string, type: 'chat' | 'analyze' | 'summarize' = 'chat') => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: type === 'analyze' && selectedText 
        ? `Analyze this selected text: "${selectedText}"\n\nQuestion: ${content}`
        : content,
      pageUrl: currentPageUrl,
      selectedText: type === 'analyze' ? selectedText : undefined,
    };

    addMessage(userMessage);
    setLoading(true);

    try {
      let response: string;

      if (type === 'summarize' && pageContext?.content) {
        response = await aiService.generateSummary(pageContext.content);
      } else if (type === 'analyze' && selectedText) {
        response = await aiService.analyzePageContent(selectedText, content);
      } else {
        // Create a temporary message with id and timestamp for the AI service
        const tempUserMessage = {
          ...userMessage,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };
        
        response = await aiService.sendMessage(
          [...messages, tempUserMessage],
          model,
          pageContext || undefined
        );
      }

      addMessage({
        role: 'assistant',
        content: response,
        pageUrl: currentPageUrl,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please check your API key and try again.',
        pageUrl: currentPageUrl,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'summarize':
        if (pageContext?.content) {
          handleSendMessage('Please summarize this page', 'summarize');
        } else {
          addMessage({
            role: 'assistant',
            content: 'No page content available to summarize.',
          });
        }
        break;
      case 'explain':
        if (selectedText) {
          handleSendMessage('Please explain this text', 'analyze');
        } else {
          addMessage({
            role: 'assistant',
            content: 'Please select some text on the page first.',
          });
        }
        break;
      case 'translate':
        if (selectedText) {
          handleSendMessage(`Translate this text to English: "${selectedText}"`, 'analyze');
        } else {
          addMessage({
            role: 'assistant',
            content: 'Please select some text to translate.',
          });
        }
        break;
    }
  };

  if (!apiKey) {
    return (
      <div className="h-full flex flex-col">
        <SidebarHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.243a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API Key Required</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Please configure your OpenAI API key to start using the AI assistant.
            </p>
            <button
              onClick={() => useUIStore.getState().setSettingsOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Open Settings
            </button>
          </div>
        </div>
        <SettingsPanel />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <SidebarHeader />
      
      {/* Quick Actions */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickAction('summarize')}
            className="flex-1 text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            disabled={!pageContext?.content}
          >
            Summarize Page
          </button>
          <button
            onClick={() => handleQuickAction('explain')}
            className="flex-1 text-xs px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
            disabled={!selectedText}
          >
            Explain Selected
          </button>
          <button
            onClick={() => handleQuickAction('translate')}
            className="flex-1 text-xs px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
            disabled={!selectedText}
          >
            Translate
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to AI Sidebar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Start a conversation or use quick actions to analyze the current page.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      
      {/* Settings Panel */}
      <SettingsPanel />
    </div>
  );
}
