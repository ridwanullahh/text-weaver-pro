
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { wrappedSDK } from '@/services/sdkService';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Crown,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userData = await wrappedSDK.get('users');
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await wrappedSDK.update('users', userId, {
        isActive: !currentStatus
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const toggleAdminStatus = async (userId: string, currentRoles: string[]) => {
    try {
      const newRoles = currentRoles.includes('admin') 
        ? currentRoles.filter(role => role !== 'admin')
        : [...currentRoles, 'admin'];
      
      await wrappedSDK.update('users', userId, {
        roles: newRoles
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to update admin status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await wrappedSDK.delete('users', userId);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">👥</div>
          <p className="text-white/60">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-white/60">Manage platform users and permissions</p>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          {users.length} Total Users
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {user.fullName || 'No Name'}
                      </h3>
                      <p className="text-white/60">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${
                          user.isActive !== false 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.roles?.includes('admin') && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Balance: ${user.walletBalance || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.isActive !== false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {user.isActive !== false ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.roles || [])}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Crown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
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

      {filteredUsers.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="text-center py-16">
            <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
            <p className="text-white/60">
              {searchTerm ? 'No users match your search criteria.' : 'No users have been registered yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
