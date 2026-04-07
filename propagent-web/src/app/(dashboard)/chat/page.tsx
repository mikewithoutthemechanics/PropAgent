'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Building2, MessageSquare, Phone, Plus, X } from 'lucide-react';
import { Card, CardHeader, Button, Avatar, Input } from '@/components/ui';
import { mockConversations, mockProperties } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';

export default function ChatPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState(conversations[0]?.id);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChat, setNewChat] = useState({ tenantName: '', propertyId: '', initialMessage: '' });
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

  const handleAddChat = () => {
    if (!newChat.tenantName.trim() || !newChat.propertyId) return;

    const selectedProperty = mockProperties.find(p => p.id === newChat.propertyId);
    
    const newConversation = {
      id: `conv-${Date.now()}`,
      tenantId: `tenant-${Date.now()}`,
      tenantName: newChat.tenantName,
      propertyId: newChat.propertyId,
      propertyAddress: selectedProperty ? `${selectedProperty.address}, ${selectedProperty.suburb}` : '',
      lastMessage: newChat.initialMessage || 'New conversation started',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      messages: newChat.initialMessage.trim() ? [{
        id: `msg-${Date.now()}`,
        senderId: 'agent',
        senderType: 'agent' as const,
        content: newChat.initialMessage,
        timestamp: new Date().toISOString(),
        read: true,
      }] : [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setNewChat({ tenantName: '', propertyId: '', initialMessage: '' });
    setShowNewChatModal(false);
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
            action={
              <Button onClick={() => setShowNewChatModal(true)} className="text-xs px-2 py-1">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            }
          />
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors duration-200 cursor-pointer ${
                  activeConversationId === conv.id ? 'bg-gold-50' : ''
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
                        <span className="bg-navy-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
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
                          <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-navy-600" />
                          </div>
                          <span className="text-xs font-medium text-navy-600">PropAgent AI</span>
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
                          ? 'bg-navy-500 text-white rounded-br-md'
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
                    <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-navy-600" />
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

      {/* Add New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">New Chat</h2>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tenant Name</label>
                <input 
                  type="text" 
                  value={newChat.tenantName}
                  onChange={(e) => setNewChat({...newChat, tenantName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="e.g., John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Property</label>
                <select 
                  value={newChat.propertyId}
                  onChange={(e) => setNewChat({...newChat, propertyId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 cursor-pointer"
                >
                  <option value="">Select a property...</option>
                  {mockProperties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.address}, {prop.suburb}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Initial Message (optional)</label>
                <textarea 
                  rows={3}
                  value={newChat.initialMessage}
                  onChange={(e) => setNewChat({...newChat, initialMessage: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Type an initial message to send..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2.5 bg-slate-700 rounded-lg text-white text-sm hover:bg-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddChat}
                disabled={!newChat.tenantName.trim() || !newChat.propertyId}
                className="px-6 py-2.5 bg-gradient-to-r from-navy-500 to-rose-500 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-navy-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
