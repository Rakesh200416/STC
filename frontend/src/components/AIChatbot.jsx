import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { chatWithAI } from '../services/aiService';
import './AIChatbot.css';

const AIChatbot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState('welcome'); // welcome, collectInfo, chat
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // If user is already logged in, skip the info collection step
    if (user) {
      setUserName(user.name || 'User');
      setUserEmail(user.email || '');
      setStep('chat');
      
      // Add welcome message with time-based greeting
      const getCurrentGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
      };
      
      const welcomeMessage = {
        id: 1,
        text: `${getCurrentGreeting()} ${user.name || 'User'}! I'm STC Assistant, your Smart Test Center AI helper. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleStartChat = () => {
    setStep('collectInfo');
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (userName && userEmail) {
      setStep('chat');
      // Add welcome message with time-based greeting
      const getCurrentGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
      };
      
      const welcomeMessage = {
        id: 1,
        text: `${getCurrentGreeting()} ${userName}! I'm STC Assistant, your Smart Test Center AI helper. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Determine user role for personalized responses
      const userRole = user ? user.role : 'guest';
      
      // Call the AI service with user context
      const botResponse = await chatWithAI(inputValue, userName || (user?.name || 'User'), userEmail || (user?.email || ''), userRole);
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later or visit our help section for more information.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className="ai-chatbot-toggle"
        onClick={toggleChat}
        aria-label="Open STC Assistant"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chatbot Popup */}
      {isOpen && (
        <div className="ai-chatbot-popup">
          <div className="ai-chatbot-header">
            <div className="ai-chatbot-header-info">
              <MessageCircle size={20} />
              <h3>STC Assistant</h3>
            </div>
            <button 
              className="ai-chatbot-close" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="ai-chatbot-messages">
            {step === 'welcome' && (
              <div className="ai-chatbot-welcome">
                <div className="ai-chatbot-bot-icon">
                  <Bot size={32} />
                </div>
                <h2>Welcome to STC Assistant!</h2>
                <p>I'm your AI helper for Smart Test Center. I can guide you through registration, tests, assignments, and more!</p>
                <button 
                  className="ai-chatbot-start-btn"
                  onClick={handleStartChat}
                >
                  Start Chat
                </button>
              </div>
            )}

            {step === 'collectInfo' && (
              <div className="ai-chatbot-info-form">
                <div className="ai-chatbot-bot-icon">
                  <Bot size={32} />
                </div>
                <h2>Let's get started!</h2>
                <p>Please provide your name and email to continue:</p>
                <form onSubmit={handleInfoSubmit}>
                  <div className="ai-chatbot-form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="ai-chatbot-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button type="submit" className="ai-chatbot-submit-btn">
                    Continue
                  </button>
                </form>
              </div>
            )}

            {step === 'chat' && (
              <>
                <div className="ai-chatbot-messages-container">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`ai-chatbot-message ${message.sender}`}
                    >
                      <div className="ai-chatbot-message-sender">
                        {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className="ai-chatbot-message-content">
                        <div className="ai-chatbot-message-text">
                          {message.text.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        <div className="ai-chatbot-message-time">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="ai-chatbot-message bot">
                      <div className="ai-chatbot-message-sender">
                        <Bot size={16} />
                      </div>
                      <div className="ai-chatbot-message-content">
                        <div className="ai-chatbot-typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="ai-chatbot-input-form" onSubmit={handleSendMessage}>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about registration, tests, assignments, notifications, or anything else..."
                    rows="1"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;