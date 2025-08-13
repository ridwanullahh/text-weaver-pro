
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { wrappedSDK } from '@/services/sdkService';
import { 
  UserPlus, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  Copy,
  Trash2,
  Send
} from 'lucide-react';

const InviteManagement = () => {
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    message: '',
    expiresIn: 7
  });

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setIsLoading(true);
      const inviteData = await wrappedSDK.get('invite_requests');
      setInvites(inviteData.sort((a, b) => new Date(b.createdAt || b.submittedAt).getTime() - new Date(a.createdAt || a.submittedAt).getTime()));
    } catch (error) {
      console.error('Failed to load invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInvite = async () => {
    try {
      const inviteCode = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + newInvite.expiresIn);

      await wrappedSDK.insert('invite_requests', {
        email: newInvite.email,
        message: newInvite.message,
        inviteCode,
        status: 'approved',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      });

      setNewInvite({ email: '', message: '', expiresIn: 7 });
      setShowCreateForm(false);
      loadInvites();
    } catch (error) {
      console.error('Failed to create invite:', error);
    }
  };

  const updateInviteStatus = async (inviteId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'approved') {
        updates.approvedAt = new Date().toISOString();
        updates.inviteCode = Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        updates.expiresAt = expiresAt.toISOString();
      }

      await wrappedSDK.update('invite_requests', inviteId, updates);
      loadInvites();
    } catch (error) {
      console.error('Failed to update invite status:', error);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (window.confirm('Are you sure you want to delete this invite?')) {
      try {
        await wrappedSDK.delete('invite_requests', inviteId);
        loadInvites();
      } catch (error) {
        console.error('Failed to delete invite:', error);
      }
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteLink = `${window.location.origin}/register?invite=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    // You could add a toast notification here
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      case 'used':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Used</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">✉️</div>
          <p className="text-white/60">Loading invites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Invite Management</h2>
          <p className="text-white/60">Manage platform invitations and access requests</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Invite
        </Button>
      </div>

      {/* Create Invite Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Create New Invite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Personal Message (Optional)
                </label>
                <Textarea
                  placeholder="Welcome to TextWeaver Pro!"
                  value={newInvite.message}
                  onChange={(e) => setNewInvite({ ...newInvite, message: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Expires In (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={newInvite.expiresIn}
                  onChange={(e) => setNewInvite({ ...newInvite, expiresIn: parseInt(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createInvite}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  disabled={!newInvite.email}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create Invite
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Invites List */}
      <div className="grid gap-4">
        {invites.map((invite, index) => (
          <motion.div
            key={invite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{invite.email}</h3>
                      <p className="text-white/60 text-sm">
                        Requested: {new Date(invite.createdAt || invite.submittedAt).toLocaleDateString()}
                      </p>
                      {invite.message && (
                        <p className="text-white/80 text-sm mt-1 italic">"{invite.message}"</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(invite.status)}
                        {invite.expiresAt && (
                          <Badge className={`text-xs ${
                            isExpired(invite.expiresAt)
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {isExpired(invite.expiresAt) ? 'Expired' : 'Expires ' + new Date(invite.expiresAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invite.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInviteStatus(invite.id, 'approved')}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInviteStatus(invite.id, 'rejected')}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {invite.inviteCode && invite.status === 'approved' && !isExpired(invite.expiresAt || '') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(invite.inviteCode)}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInvite(invite.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {invites.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="text-center py-16">
            <UserPlus className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Invites Yet</h3>
            <p className="text-white/60">
              Create your first invite to get users started on the platform.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InviteManagement;
