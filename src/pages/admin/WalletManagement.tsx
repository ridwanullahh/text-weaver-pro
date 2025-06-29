
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { wrappedSDK } from '@/services/sdkService';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Search, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';

const WalletManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletOperation = async (operation: 'credit' | 'debit') => {
    if (!selectedUser || !amount || !reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const newBalance = operation === 'credit' 
        ? selectedUser.walletBalance + amountValue
        : selectedUser.walletBalance - amountValue;

      if (newBalance < 0) {
        toast({
          title: "Insufficient Balance",
          description: "User doesn't have enough balance for this debit",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Update user balance
      await wrappedSDK.update('users', selectedUser.id, {
        walletBalance: newBalance
      });

      // Record transaction
      await wrappedSDK.insert('transactions', {
        userId: selectedUser.id,
        amount: operation === 'credit' ? amountValue : -amountValue,
        type: operation === 'credit' ? 'admin_credit' : 'admin_debit',
        description: `Admin ${operation}: ${reason}`,
        adminAction: true,
        createdAt: new Date().toISOString()
      });

      // Update UI
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, walletBalance: newBalance }
          : user
      ));

      setSelectedUser({ ...selectedUser, walletBalance: newBalance });
      setAmount('');
      setReason('');

      toast({
        title: `Wallet ${operation === 'credit' ? 'Credited' : 'Debited'} Successfully! ✅`,
        description: `${operation === 'credit' ? 'Added' : 'Removed'} $${amountValue.toFixed(2)} ${operation === 'credit' ? 'to' : 'from'} ${selectedUser.fullName || selectedUser.email}'s wallet`,
      });

    } catch (error) {
      console.error('Failed to update wallet:', error);
      toast({
        title: "Operation Failed",
        description: "Failed to update wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalWalletBalance = users.reduce((sum, user) => sum + (user.walletBalance || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">💰</div>
          <p className="text-white/60">Loading wallet management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Wallet Management</h2>
          <p className="text-white/60">Manage user wallet balances and transactions</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <DollarSign className="w-4 h-4 mr-1" />
            Total: ${totalWalletBalance.toFixed(2)}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Users className="w-4 h-4 mr-1" />
            {users.length} Users
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedUser?.id === user.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {user.fullName || 'No Name'}
                        </p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          ${(user.walletBalance || 0).toFixed(2)}
                        </p>
                        <Badge className={`text-xs ${
                          user.roles?.includes('admin')
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {user.roles?.includes('admin') ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Operations */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Selected User</h3>
                  <p className="text-white/80">{selectedUser.fullName || 'No Name'}</p>
                  <p className="text-white/60 text-sm">{selectedUser.email}</p>
                  <p className="text-white font-bold text-lg mt-2">
                    Current Balance: ${selectedUser.walletBalance.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="text-white text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/40"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium">Reason</label>
                  <Input
                    placeholder="Enter reason for transaction"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/40"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleWalletOperation('credit')}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Credit Wallet
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleWalletOperation('debit')}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        <Minus className="w-4 h-4 mr-2" />
                        Debit Wallet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Wallet className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a User</h3>
                <p className="text-white/60">
                  Choose a user from the list to manage their wallet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletManagement;
