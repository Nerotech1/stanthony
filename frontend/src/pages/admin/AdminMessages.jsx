import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, User, Trash2, Check, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.getMessages();
      setMessages(res.data);
    } catch (e) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (message) => {
    try {
      await api.markMessageRead(message.id);
      toast.success('Message marked as read');
      fetchMessages();
    } catch (e) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    try {
      await api.deleteMessage(selectedMessage.id);
      toast.success('Message deleted');
      setDeleteDialogOpen(false);
      setSelectedMessage(null);
      fetchMessages();
    } catch (e) {
      toast.error('Failed to delete message');
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-messages">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Messages</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">
            Contact form submissions {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No messages yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${!message.is_read ? 'border-l-4 border-church-red bg-church-red/5' : ''}`}
              onClick={() => setExpandedMessage(expandedMessage === message.id ? null : message.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{message.name}</h3>
                      {!message.is_read && (
                        <Badge className="bg-church-red text-white">New</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {message.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    {message.subject && (
                      <p className="text-sm font-medium text-stone-warm-700 mb-2">Subject: {message.subject}</p>
                    )}
                    <p className={`text-sm text-muted-foreground font-dm-sans ${expandedMessage === message.id ? '' : 'line-clamp-2'}`}>
                      {message.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {!message.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(message)}
                        title="Mark as read"
                        data-testid={`message-read-${message.id}`}
                      >
                        <Check size={18} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { setSelectedMessage(message); setDeleteDialogOpen(true); }}
                      data-testid={`message-delete-${message.id}`}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message from {selectedMessage?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" data-testid="confirm-delete-message">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMessages;
