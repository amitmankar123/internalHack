
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Send, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
}

export function CommunityChat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/community/groups');
      setGroups(response.data);
      
      // Set the first group as selected by default
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Could not load community groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (groupId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/community/messages/${groupId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Could not load community messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedGroup) return;

    setSendingMessage(true);

    try {
      const response = await api.post('/community/messages', {
        groupId: selectedGroup,
        content: message,
      });
      
      // Add the new message to the list
      setMessages([...messages, response.data]);
      
      // Clear the input
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send your message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle key press to submit message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date for better readability
  const groupMessagesByDate = () => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    
    return grouped;
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="flex flex-col min-h-[600px] shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Community Support
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0">
        <Tabs defaultValue="chat" className="flex flex-col flex-1">
          <div className="px-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col">
            {loading && !messages.length ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
              </div>
            ) : selectedGroup ? (
              <>
                <div className="border-b p-2 bg-muted/30">
                  {groups.find(g => g.id === selectedGroup)?.name || "Loading..."}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {Object.entries(groupMessagesByDate()).map(([date, msgs]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex justify-center">
                        <Badge variant="outline" className="bg-background">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Badge>
                      </div>
                      
                      {msgs.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.user.id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex ${msg.user.id === user?.id ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                            <Avatar className={`h-8 w-8 ${msg.user.id === user?.id ? 'ml-2' : 'mr-2'}`}>
                              <AvatarImage src="" />
                              <AvatarFallback className={
                                msg.user.id === user?.id 
                                  ? "bg-wellness-green-light text-wellness-green-dark" 
                                  : "bg-wellness-purple-light text-wellness-purple-dark"
                              }>
                                {getInitials(msg.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className={`rounded-lg p-3 text-sm ${
                                msg.user.id === user?.id 
                                  ? 'bg-wellness-green text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {msg.content}
                              </div>
                              <div className={`text-xs text-gray-500 mt-1 ${
                                msg.user.id === user?.id ? 'text-right' : 'text-left'
                              }`}>
                                {msg.user.name} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || sendingMessage}
                      className="bg-wellness-green hover:bg-wellness-green-dark text-white"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a group to start chatting
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="groups" className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div 
                    key={group.id} 
                    className={`p-4 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedGroup === group.id ? 'border-wellness-green bg-wellness-green-light/10' : ''
                    }`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <Badge variant="outline">
                        {group.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
