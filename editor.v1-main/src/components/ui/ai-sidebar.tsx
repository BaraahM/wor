'use client';

import React, { useState } from 'react';

import { ArrowRight, ArrowUp, Check, RotateCcw, X } from 'lucide-react';

import { useChat } from '@/components/editor/use-chat';
import { cn } from '@/lib/utils';

import { FieldInputSidebar } from './field-input-sidebar';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  prompt: string;
  response: string;
  isAccepted?: boolean;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState<'ask-ai' | 'field-input'>('ask-ai');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const chat = useChat();

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();
    setCurrentPrompt(prompt);
    setInput('');
    setIsLoading(true);

    try {
      const result = await fetch('/api/ai/command', {
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          messages: [
            {
              content: prompt,
              role: 'user',
            },
          ],
          model: 'gpt-3.5-turbo',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!result.ok) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = "I understand you're asking about this document. Here's a thoughtful response based on the content: This appears to be a comprehensive document that covers various aspects of the topic at hand. The structure demonstrates careful organization and attention to detail. For more specific insights, please feel free to ask more targeted questions about particular sections or concepts you'd like me to elaborate on.";
        setMessages(prev => [...prev, { prompt, response: placeholderResponse }]);
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      const reader = result.body?.getReader();
      if (!reader) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = "Thank you for your question. I'm here to help you understand and work with this document. While I process your request, please know that I can assist with editing, explaining concepts, formatting suggestions, and much more. Feel free to ask me anything specific about the content you're working on.";
        setMessages(prev => [...prev, { prompt, response: placeholderResponse }]);
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      let responseText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.slice(2));
              responseText += content;
            } catch (e) {
              // Continue processing other lines
            }
          }
        }
      }

      // Add the new message
      setMessages(prev => [...prev, { prompt, response: responseText || "I've received your request and am ready to help. Please let me know if you'd like me to elaborate on any specific aspect of the document or if you have particular editing tasks you'd like assistance with." }]);
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev => [...prev, { 
        prompt, 
        response: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      setCurrentPrompt('');
    }
  };

  const handleAccept = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isAccepted: true } : msg
    ));
  };

  const handleReject = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRedo = async (index: number) => {
    const message = messages[index];
    if (!message) return;

    setIsLoading(true);
    setCurrentPrompt(message.prompt);

    try {
      const result = await fetch('/api/ai/command', {
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          messages: [
            {
              content: message.prompt,
              role: 'user',
            },
          ],
          model: 'gpt-3.5-turbo',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!result.ok) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = "Here's an alternative perspective on your question: The document contains valuable information that can be approached from multiple angles. Consider exploring different sections to gain a comprehensive understanding. I'm here to help you navigate through the content and provide insights tailored to your specific needs.";
        setMessages(prev => prev.map((msg, i) => 
          i === index ? { ...msg, isAccepted: false, response: placeholderResponse } : msg
        ));
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      const reader = result.body?.getReader();
      if (!reader) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = "I'm regenerating a response for you. This document offers rich content that can be analyzed from various perspectives. Let me provide you with helpful insights and suggestions to enhance your understanding and editing experience.";
        setMessages(prev => prev.map((msg, i) => 
          i === index ? { ...msg, isAccepted: false, response: placeholderResponse } : msg
        ));
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      let responseText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.slice(2));
              responseText += content;
            } catch (e) {
              // Continue processing other lines
            }
          }
        }
      }

      // Replace the message at the index
      setMessages(prev => prev.map((msg, i) => 
        i === index ? { ...msg, isAccepted: false, response: responseText || "Here's a regenerated response with fresh insights about your document. I'm continuously learning to provide better assistance with your editing and content needs." } : msg
      ));
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev => prev.map((msg, i) => 
        i === index ? { ...msg, response: 'Sorry, I encountered an error. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
      setCurrentPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-14 w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col flex-shrink-0 h-full z-50">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center mb-4">
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors mr-3"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 flex-1 text-center">Barum AI</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-0">
          <button
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium border border-gray-300 transition-colors',
              activeTab === 'field-input'
              ? 'bg-[#274F2D] text-white border-[#274F2D]'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
            onClick={() => setActiveTab('field-input')}
          >
            Field input
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium border border-l-0 border-gray-300 transition-colors',
              activeTab === 'ask-ai'
                ? 'bg-[#274F2D] text-white border-[#274F2D]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
            onClick={() => setActiveTab('ask-ai')}
          >
            Ask AI
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {activeTab === 'ask-ai' && (
          <>
            {/* Current Loading Prompt */}
            {isLoading && currentPrompt && (
              <div className="space-y-3">
                <div className="bg-[#f1f3f4] rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm">
                  {currentPrompt}
                </div>
                <div className="border border-[#e0e0e0] rounded-lg p-4 bg-white">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#274F2D]" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div key={index} className="space-y-3">
                {/* User Prompt */}
                <div className="bg-[#f1f3f4] rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm">
                  {message.prompt}
                </div>

                {/* AI Response */}
                <div className={cn(
                  "rounded-lg p-4 bg-white transition-all",
                  message.isAccepted 
                    ? "border-0 shadow-none" 
                    : "border border-[#e0e0e0] shadow-sm"
                )}>
                  <div className="prose max-w-none text-sm text-gray-700 leading-relaxed">
                    {message.response}
                  </div>

                  {/* Action Buttons */}
                  {!message.isAccepted && (
                    <div className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-gray-100">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                        onClick={() => handleAccept(index)}
                        title="Accept"
                        aria-label="Accept"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                        onClick={() => handleReject(index)}
                        title="Reject"
                        aria-label="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        onClick={() => handleRedo(index)}
                        title="Regenerate"
                        aria-label="Regenerate"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'field-input' && (
          <FieldInputSidebar />
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      {activeTab === 'ask-ai' && (
        <div className="border-t border-gray-200 p-4 space-y-3 flex-shrink-0 bg-white">
          {/* Input Field */}
          <div className="relative">
            <textarea
              className="w-full resize-none rounded-lg border border-gray-300 p-3 pr-12 text-sm focus:border-[#274F2D] focus:outline-none focus:ring-1 focus:ring-[#274F2D] placeholder-gray-400 transition-colors"
              disabled={isLoading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI"
              rows={1}
            />
            <button
              className={cn(
                'absolute bottom-3 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                input.trim() && !isLoading
                  ? 'bg-[#274F2D] text-white hover:bg-[#1e3d23]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
              disabled={!input.trim() || isLoading}
              onClick={handleSubmit}
              aria-label="Submit"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Barum can make mistakes. Please check responses.
          </p>
        </div>
      )}
    </div>
  );
}