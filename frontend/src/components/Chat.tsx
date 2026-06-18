import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Message } from '../types';
import { format } from 'date-fns';
import { Send } from 'lucide-react';

interface ChatProps {
  bookingId: string;
  receiverId: string;
  receiverName: string;
}

export const Chat: React.FC<ChatProps> = ({ bookingId, receiverId, receiverName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to socket
    const socket = io();
    socketRef.current = socket;

    socket.emit('join_booking', bookingId);

    socket.on('receive_message', (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}/messages`);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages', err);
      }
    };
    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !user) return;

    const messageData = {
      bookingId,
      senderId: user.id,
      receiverId,
      content: newMessage
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-medium">Chat with {receiverName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-3">
          {Array.isArray(messages) && messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.senderId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {format(new Date(msg.createdAt), 'p')}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
