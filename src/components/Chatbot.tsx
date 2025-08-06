import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    XavChatWidget?: {
      BotPlugin?: {
        init: (id: string, config: any) => void;
        toggleChat: (show: boolean) => void;
        endChat: () => void;
      };
    };
  }
}

export default function Chatbot() {
    const [show, setShow] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load the XavChatWidget script
    useEffect(() => {
        const loadScript = () => {
            // Check if script is already loaded
            if (window?.XavChatWidget?.BotPlugin) {
                console.log('XavChatWidget already available');
                setScriptLoaded(true);
                return;
            }

            // Create script element to load the bot plugin
            const script = document.createElement('script');
            script.src = '/botPlugin.js';
            script.async = true;
            script.onload = () => {
                console.log('botPlugin.js script loaded');
                
                // Wait for XavChatWidget to be available after script load
                const checkAvailability = () => {
                    if (window?.XavChatWidget?.BotPlugin) {
                        console.log('XavChatWidget.BotPlugin is now available');
                        setScriptLoaded(true);
                    } else {
                        console.log('Waiting for XavChatWidget to initialize...');
                        setTimeout(checkAvailability, 100);
                    }
                };
                
                // Start checking after a small delay
                setTimeout(checkAvailability, 100);
            };
            script.onerror = () => {
                console.error('Failed to load XavChatWidget plugin');
            };
            
            document.head.appendChild(script);

            // Cleanup function
            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            };
        };

        loadScript();
    }, []);

    // Initialize chatbot when script is loaded
    useEffect(() => {
        // Remove auto-initialization - only load script, don't initialize chatbot
        // Chatbot will be initialized when user clicks the chat icon
    }, [scriptLoaded, isInitialized]);

    function initChatbot() {
        // Don't initialize if already initialized
        if (isInitialized) {
            console.log('Chatbot already initialized, just showing it');
            setShow(true);
            if (window?.XavChatWidget?.BotPlugin) {
                window.XavChatWidget.BotPlugin.toggleChat(true);
            }
            return;
        }

        // Wait for XavChatWidget to be available
        const checkAndInit = () => {
            if (!window?.XavChatWidget?.BotPlugin) {
                console.log('XavChatWidget.BotPlugin not available yet, retrying...');
                setTimeout(checkAndInit, 200);
                return;
            }

            try {
                console.log('Initializing XavChatWidget...');
                window.XavChatWidget.BotPlugin.init("2FkwUtiHl1VzTRhwWmsC3CpiutY", {
                    language: 'en',
                    parentElementId: "chatbot-container",
                    extraData: {
                        toggler: false,
                        isCustomizedWidth: true,
                        persistChat: false,
                        isMoreText: true,
                        additionalData: {
                            isInAppWebView: true
                        }
                    }
                });
                
                // Add a small delay before toggling chat
                setTimeout(() => {
                    if (window?.XavChatWidget?.BotPlugin) {
                        window.XavChatWidget.BotPlugin.toggleChat(true);
                        setShow(true);
                        setIsInitialized(true);
                        console.log('Chatbot initialized and opened successfully');
                    }
                }, 300);
            } catch (error) {
                console.error('Error initializing chatbot:', error);
            }
        };

        if (!scriptLoaded) {
            console.log('Script not loaded yet, cannot initialize chatbot');
            return;
        }

        checkAndInit();
    }

    function closePopup() {
        if (!window?.XavChatWidget?.BotPlugin) {
            console.error('XavChatWidget.BotPlugin not available for closing');
            setShow(false);
            return;
        }
        
        try {
            // Hide the chatbot widget
            window.XavChatWidget.BotPlugin.toggleChat(false);
            setShow(false);
            console.log('Chatbot closed');
        } catch (error) {
            console.error('Error closing chatbot:', error);
            setShow(false);
        }
    }

    // Show loading state while script is loading
    if (!scriptLoaded) {
        return (
            <div style={{ 
                width: '400px', 
                height: '90vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 10px'
                    }}></div>
                    <p>Loading chatbot...</p>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div className="container-chat-icon" style={{ display: show ? 'none' : 'block', cursor: 'pointer' }}>
                <div className="chat-icon">
                    <img onClick={initChatbot} src="chat_button.png" alt="Chat" style={{ width: '60px', height: '60px' }} />
                </div>
            </div>
            <div style={{ width: '400px', height: '90vh', position: 'absolute', display: show ? 'block' : 'none' }}>
                <>
                    <div
                        className="bot-header"
                        style={{
                            background: '#E6E6E6',
                            textAlign: 'left',
                            padding: '4px 22px',
                            color: '#FF5B49',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        FueliX Bot
                    </div>

                    <span
                        onClick={closePopup}
                        className="close"
                        title="Close Modal"
                        style={{
                            position: 'absolute',
                            top: '13px',
                            right: '14px',
                            borderRadius: '20px',
                            background: '#4b286d',
                            padding: '5px 10px',
                            float: 'right',
                            fontSize: '21px',
                            lineHeight: '1',
                            color: '#fff',
                            opacity: '1',
                            cursor: 'pointer'
                        }}
                    >
                        &times;
                    </span>

                    <div id="chatbot-container" style={{ width: '100%', height: '100%', position: 'static' }}></div>
                </>
            </div>
        </>
    );
}
