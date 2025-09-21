import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MessageSquare, Send, Search, Plus, Clock } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MyConversationsPage = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      title: 'Housing Assistance Request',
      organization: 'Marine Housing Solutions',
      lastMessage:
        'Thank you for your application. We will review it and get back to you within 48 hours.',
      timestamp: '2 hours ago',
      status: 'active',
      unread: 0,
    },
    {
      id: 2,
      title: 'Employment Opportunities',
      organization: 'Veterans Career Services',
      lastMessage:
        'We have several positions that match your background. Would you like to schedule an interview?',
      timestamp: '1 day ago',
      status: 'active',
      unread: 2,
    },
    {
      id: 3,
      title: 'Benefits Information',
      organization: 'VA Benefits Office',
      lastMessage: 'Your disability claim has been processed. Check your portal for updates.',
      timestamp: '3 days ago',
      status: 'closed',
      unread: 0,
    },
  ];

  const messages = selectedConversation
    ? [
        {
          id: 1,
          sender: 'organization',
          message:
            'Hello! Thank you for reaching out regarding housing assistance. How can we help you today?',
          timestamp: '3 days ago',
        },
        {
          id: 2,
          sender: 'user',
          message:
            "Hi, I'm looking for temporary housing assistance while I transition to civilian life. I'm based in San Diego.",
          timestamp: '3 days ago',
        },
        {
          id: 3,
          sender: 'organization',
          message:
            'We have several programs available in the San Diego area. Can you provide more details about your timeline and specific needs?',
          timestamp: '2 days ago',
        },
        {
          id: 4,
          sender: 'user',
          message:
            'I need housing for about 3 months starting next month. I have a budget of around $1500/month.',
          timestamp: '2 days ago',
        },
        {
          id: 5,
          sender: 'organization',
          message: 'Thank you for your application. We will review it and get back to you within 48 hours.',
          timestamp: '2 hours ago',
        },
      ]
    : [];

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.organization.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <Shield className="mr-3 h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">shieldmate</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <Button variant="ghost" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Conversations</h1>
          <p className="text-muted-foreground">
            Connect with support organizations and track your communications
          </p>
        </header>

        <div className="grid h-[600px] grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 space-y-0 overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={cn(
                        'w-full border-b p-4 text-left transition-colors hover:bg-muted/50',
                        selectedConversation === conversation.id ? 'bg-muted' : 'bg-transparent',
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="truncate text-sm font-medium">{conversation.title}</h3>
                        {conversation.unread > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">{conversation.organization}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{conversation.lastMessage}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {conversation.timestamp}
                        </span>
                        <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                          {conversation.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-2">
            <Card className="flex h-full flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader>
                    <CardTitle>
                      {conversations.find((conversation) => conversation.id === selectedConversation)?.title}
                    </CardTitle>
                    <CardDescription>
                      with {conversations.find((conversation) => conversation.id === selectedConversation)?.organization}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="mb-4 max-h-96 flex-1 space-y-4 overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            'flex',
                            message.sender === 'user' ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-xs rounded-lg px-4 py-2 text-sm lg:max-w-md',
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground',
                            )}
                          >
                            <p>{message.message}</p>
                            <p className="mt-1 text-xs opacity-75">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} variant="hero">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-medium text-foreground">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </main>
        </div>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Not sure how to get started or need immediate assistance?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-medium">Start New Request</div>
                    <div className="text-sm text-muted-foreground">Submit a new support request</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-medium">Browse Resources</div>
                    <div className="text-sm text-muted-foreground">Find self-service resources</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-medium">Emergency Support</div>
                    <div className="text-sm text-muted-foreground">24/7 crisis assistance</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default MyConversationsPage;
