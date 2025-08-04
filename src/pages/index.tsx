import React, { useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import { useChatStore } from '../store';

export default function Home() {
  const { setCurrentPageUrl } = useChatStore();

  useEffect(() => {
    // Set current page URL when component mounts
    setCurrentPageUrl(window.location.href);
    
    // Listen for text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || '';
      if (selectedText.length > 0) {
        useChatStore.getState().setSelectedText(selectedText);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [setCurrentPageUrl]);

  return (
    <>
      <Head>
        <title>AI Sidebar Assistant</title>
        <meta name="description" content="AI-powered sidebar extension for enhanced browsing experience" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
      </div>
    </>
  );
}
