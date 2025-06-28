
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, Plus, CreditCard } from 'lucide-react';

const WalletManager = () => {
  const { user, updateWallet } = useAuth();
  const [fundAmount, setFundAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFundWallet = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) return;

    setIsLoading(true);
    try {
      // Initialize Paystack payment (would integrate with actual Paystack in production)
      const paystackAmount = amount * 100; // Convert to kobo for Paystack
      
      // For demo, we'll simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      await updateWallet(amount);
      setFundAmount('');
      alert('Wallet funded successfully!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white mb-2">
            ${user.walletBalance.toFixed(2)}
          </div>
          <p className="text-white/60 text-sm">Available balance</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount to add"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              step="0.01"
              min="1"
            />
            <Button
              onClick={handleFundWallet}
              disabled={isLoading || !fundAmount}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shrink-0"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Fund
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 25].map(amount => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setFundAmount(amount.toString())}
                className="border-white/20 text-white hover:bg-white/10"
              >
                ${amount}
              </Button>
            ))}
          </div>

          <div className="text-xs text-white/60 space-y-1">
            <p>• Book pages: $0.10 each (₦10 for Nigeria)</p>
            <p>• Text translations: $0.05 each (₦5 for Nigeria)</p>
            <p>• 3 free text translations daily</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletManager;
