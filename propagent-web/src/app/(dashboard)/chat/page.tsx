'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Building2, MessageSquare, Phone } from 'lucide-react';
import { Card, CardHeader, Button, Avatar, Input } from '@/components/ui';
import { mockConversations } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';

export default function ChatPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState(conversations[0]?.id);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'agent',
      senderType: 'agent' as const,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString()
          }
        : conv
    ));
    setNewMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'ai',
        senderType: 'ai' as const,
        content: generateAIResponse(newMessage),
        timestamp: new Date().toISOString(),
        read: true,
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, aiResponse],
              lastMessage: aiResponse.content,
              lastMessageTime: aiResponse.timestamp
            }
          : conv
      ));
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('rent') || lowerMessage.includes('payment')) {
      return "I can help with rent inquiries. Your tenant's rent payment status is available in the Financials section. Would you like me to generate a payment reminder or send a receipt?";
    }
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
      return "For maintenance requests, I can create a new ticket or check the status of existing requests. Our average response time for maintenance is within 24 hours.";
    }
    if (lowerMessage.includes('lease') || lowerMessage.includes('contract')) {
      return "I can help you manage lease agreements. Would you like to renew a lease, create a new one, or review the current terms?";
    }
    if (lowerMessage.includes('property') || lowerMessage.includes('unit')) {
      return "I can provide information about your properties, including occupancy status, rental rates, and tenant details. Which property would you like to know more about?";
    }
    
    return "Thank you for your message. I'm here to help you manage your properties efficiently. You can ask me about:\n\n- Rent payments and financial reports\n- Maintenance requests and status\n- Lease agreements and renewals\n- Property details and occupancy\n\nHow can I assist you today?";
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-6 h-[calc(100vh-180px)]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Communication</h1>
        <p className="text-slate-500 mt-1">AI-powered tenant communication hub</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader 
            title="Conversations" 
            subtitle={`${totalUnread} unread`}
          />
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors duration-200 cursor-pointer ${
                  activeConversationId === conv.id ? 'bg-amber-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar 
                    initials={`${conv.tenantName.split(' ').map(n => n[0]).join('')}`}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 truncate">{conv.tenantName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-amber-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(conv.lastMessageTime)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar 
                    initials={`${activeConversation.tenantName.split(' ').map(n => n[0]).join('')}`}
                    className="w-12 h-12"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{activeConversation.tenantName}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-3 h-3" />
                      {activeConversation.propertyAddress}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderType === 'agent' || message.senderType === 'landlord' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.senderType === 'ai' ? 'order-2' : ''}`}>
                      {message.senderType === 'ai' && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-amber-600" />
                          </div>
                          <span className="text-xs font-medium text-amber-600">PropAgent AI</span>
                        </div>
                      )}
                      {message.senderType === 'tenant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{activeConversation.tenantName}</span>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.senderType === 'agent' || message.senderType === 'landlord'
                          ? 'bg-amber-500 text-white rounded-br-md'
                          : message.senderType === 'ai'
                          ? 'bg-slate-100 text-slate-800 rounded-bl-md'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${message.senderType === 'agent' || message.senderType === 'landlord' ? 'text-right' : ''}`}>
                        {formatDateTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-amber-600" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Select a conversation to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
