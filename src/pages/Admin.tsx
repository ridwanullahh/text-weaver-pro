
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sdk } from '@/services/sdkService';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Key,
  MessageSquare
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [inviteRequests, setInviteRequests] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [newInviteCode, setNewInviteCode] = useState('');

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [usersData, requestsData, codesData] = await Promise.all([
        sdk.get('users'),
        sdk.get('invite_requests'),
        sdk.get('invite_codes')
      ]);
      setUsers(usersData);
      setInviteRequests(requestsData);
      setInviteCodes(codesData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const generateInviteCode = async () => {
    if (!newInviteCode.trim()) return;
    
    try {
      await sdk.insert('invite_codes', {
        code: newInviteCode,
        used: false,
        createdBy: user?.email,
        createdAt: new Date().toISOString()
      });
      setNewInviteCode('');
      loadData();
    } catch (error) {
      console.error('Failed to create invite code:', error);
    }
  };

  const approveInviteRequest = async (requestId: string, email: string) => {
    try {
      const code = `INV-${Date.now()}`;
      await Promise.all([
        sdk.insert('invite_codes', {
          code,
          used: false,
          createdBy: user?.email,
          createdFor: email,
          createdAt: new Date().toISOString()
        }),
        sdk.update('invite_requests', requestId, {
          status: 'approved',
          inviteCode: code,
          approvedBy: user?.email,
          approvedAt: new Date().toISOString()
        })
      ]);
      loadData();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-white/70">You don't have admin privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Settings className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'invites', label: 'Invite Codes', icon: <Key className="w-4 h-4" /> },
    { id: 'requests', label: 'Invite Requests', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/70">Manage your TextWeaver Pro platform</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={`${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                  : 'border-white/20 text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Pending Requests</p>
                    <p className="text-2xl font-bold text-white">
                      {inviteRequests.filter((r: any) => r.status === 'pending').length}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Active Codes</p>
                    <p className="text-2xl font-bold text-white">
                      {inviteCodes.filter((c: any) => !c.used).length}
                    </p>
                  </div>
                  <Key className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ${users.reduce((sum: number, user: any) => sum + (user.walletBalance || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Wallet</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b border-white/10">
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.fullName || '-'}</td>
                        <td className="p-2">${(user.walletBalance || 0).toFixed(2)}</td>
                        <td className="p-2">{user.roles?.join(', ') || 'user'}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" className="border-white/20 text-white">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invite Codes Tab */}
        {activeTab === 'invites' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Generate New Invite Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom code or leave blank for auto-generation"
                    value={newInviteCode}
                    onChange={(e) => setNewInviteCode(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button 
                    onClick={generateInviteCode}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Invite Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-2">Code</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Created For</th>
                        <th className="text-left p-2">Used By</th>
                        <th className="text-left p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inviteCodes.map((code: any) => (
                        <tr key={code.id} className="border-b border-white/10">
                          <td className="p-2 font-mono">{code.code}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              code.used ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {code.used ? 'Used' : 'Active'}
                            </span>
                          </td>
                          <td className="p-2">{code.createdFor || '-'}</td>
                          <td className="p-2">{code.usedBy || '-'}</td>
                          <td className="p-2">{new Date(code.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invite Requests Tab */}
        {activeTab === 'requests' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Invite Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inviteRequests.map((request: any) => (
                  <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{request.fullName}</h4>
                        <p className="text-white/70 text-sm">{request.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'pending' 
                          ? 'bg-yellow-500/20 text-yellow-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm mb-2"><strong>Company:</strong> {request.company}</p>
                    <p className="text-white/80 text-sm mb-2"><strong>Use Case:</strong> {request.useCase}</p>
                    <p className="text-white/80 text-sm mb-4"><strong>Volume:</strong> {request.expectedVolume}</p>
                    {request.status === 'pending' && (
                      <Button
                        onClick={() => approveInviteRequest(request.id, request.email)}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        Approve & Send Code
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;
