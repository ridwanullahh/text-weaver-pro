
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { wrappedSDK } from '@/services/sdkService';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  User,
  Search,
  Reply,
  Trash2,
  Star,
  Archive
} from 'lucide-react';

const ContactManagement = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const contactData = await wrappedSDK.get('contact_messages');
      setContacts(contactData.sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (contactId: string) => {
    try {
      await wrappedSDK.update('contact_messages', contactId, {
        isRead: true,
        readAt: new Date().toISOString()
      });
      loadContacts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const toggleImportant = async (contactId: string, isImportant: boolean) => {
    try {
      await wrappedSDK.update('contact_messages', contactId, {
        isImportant: !isImportant
      });
      loadContacts();
    } catch (error) {
      console.error('Failed to toggle importance:', error);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await wrappedSDK.delete('contact_messages', contactId);
        loadContacts();
        setSelectedContact(null);
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const sendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    try {
      // In a real app, you'd send an email here
      console.log('Sending reply to:', selectedContact.email, replyMessage);
      
      // Mark as replied
      await wrappedSDK.update('contact_messages', selectedContact.id, {
        isReplied: true,
        repliedAt: new Date().toISOString(),
        replyMessage: replyMessage
      });

      setReplyMessage('');
      loadContacts();
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (contact: any) => {
    if (contact.isReplied) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Replied</Badge>;
    }
    if (contact.isRead) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Read</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">New</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">💬</div>
          <p className="text-white/60">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Management</h2>
          <p className="text-white/60">Manage customer inquiries and support requests</p>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          {contacts.length} Total Messages
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search messages by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-4">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`bg-white/10 backdrop-blur-md border-white/20 cursor-pointer transition-all hover:bg-white/15 ${
                  selectedContact?.id === contact.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                          {contact.isImportant && (
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <p className="text-white/60 text-sm truncate">{contact.email}</p>
                        <p className="text-white font-medium text-sm mt-1 truncate">{contact.subject}</p>
                        <p className="text-white/70 text-xs mt-2 line-clamp-2">{contact.message}</p>
                        <div className="flex items-center gap-2 mt-3">
                          {getStatusBadge(contact)}
                          <span className="text-white/50 text-xs">
                            {new Date(contact.submittedAt || contact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredContacts.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Messages Found</h3>
                <p className="text-white/60">
                  {searchTerm ? 'No messages match your search criteria.' : 'No contact messages have been received yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:sticky lg:top-6">
          {selectedContact ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Message Details</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleImportant(selectedContact.id, selectedContact.isImportant)}
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Star className={`w-4 h-4 ${selectedContact.isImportant ? 'fill-current' : ''}`} />
                    </Button>
                    {!selectedContact.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(selectedContact.id)}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContact(selectedContact.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-white font-medium">{selectedContact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">{selectedContact.email}</span>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/60" />
                      <span className="text-white/80">{selectedContact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">
                      {new Date(selectedContact.submittedAt || selectedContact.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <h4 className="text-white font-semibold mb-2">Subject</h4>
                  <p className="text-white/80">{selectedContact.subject}</p>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <h4 className="text-white font-semibold mb-2">Message</h4>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                {/* Reply Section */}
                <div className="border-t border-white/20 pt-4">
                  <h4 className="text-white font-semibold mb-2">Reply</h4>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/40 mb-3"
                    rows={4}
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Message</h3>
                <p className="text-white/60">
                  Choose a message from the list to view details and respond.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;
