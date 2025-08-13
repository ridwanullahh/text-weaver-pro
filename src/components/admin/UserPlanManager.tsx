
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { monetizationService } from '@/services/monetizationService';
import { Crown, Users, Zap, Star } from 'lucide-react';

interface User {
  id: string;
  email: string;
  plan: string;
  walletBalance: number;
  monthlyPagesUsed: number;
  monthlyTranslationsUsed: number;
  planUpgradedAt?: string;
}

interface UserPlanManagerProps {
  users: User[];
  onUpdateUser: (userId: string, updates: any) => Promise<void>;
}

const UserPlanManager = ({ users, onUpdateUser }: UserPlanManagerProps) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkPlan, setBulkPlan] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const planIcons = {
    free: <Users className="w-4 h-4" />,
    basic: <Zap className="w-4 h-4" />,
    pro: <Star className="w-4 h-4" />,
    enterprise: <Crown className="w-4 h-4" />
  };

  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-cyan-100 text-cyan-800',
    enterprise: 'bg-amber-100 text-amber-800'
  };

  const handlePlanUpdate = async (userId: string, newPlan: string) => {
    try {
      setIsUpdating(true);
      
      const success = await monetizationService.upgradeUserPlan(
        { id: userId }, 
        newPlan, 
        async (updates) => {
          await onUpdateUser(userId, updates);
        }
      );

      if (success) {
        toast({
          title: "Plan Updated",
          description: `User plan updated to ${newPlan} successfully.`,
        });
      } else {
        throw new Error('Failed to update plan');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkPlan || selectedUsers.size === 0) return;

    try {
      setIsUpdating(true);
      
      const promises = Array.from(selectedUsers).map(userId =>
        handlePlanUpdate(userId, bulkPlan)
      );
      
      await Promise.all(promises);
      
      setSelectedUsers(new Set());
      setBulkPlan('');
      
      toast({
        title: "Bulk Update Complete",
        description: `Updated ${selectedUsers.size} users to ${bulkPlan} plan.`,
      });
    } catch (error) {
      toast({
        title: "Bulk Update Failed",
        description: "Some updates failed. Please check individual users.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const getPlanLimits = (planName: string) => {
    return monetizationService.getPlanLimits(planName);
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-primary" />
            <span>Bulk Plan Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={bulkPlan} onValueChange={setBulkPlan}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select plan for bulk update" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Plan</SelectItem>
                <SelectItem value="basic">Basic Plan</SelectItem>
                <SelectItem value="pro">Professional Plan</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleBulkUpdate}
              disabled={!bulkPlan || selectedUsers.size === 0 || isUpdating}
              className="gradient-primary text-white"
            >
              Update {selectedUsers.size} Users
            </Button>
          </div>
          {selectedUsers.size > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedUsers.size} user(s) selected for bulk update
            </p>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => {
          const planLimits = getPlanLimits(user.plan);
          const isSelected = selectedUsers.has(user.id);

          return (
            <Card key={user.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-border"
                    />
                    <div>
                      <h3 className="font-medium text-foreground">{user.email}</h3>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                    </div>
                  </div>
                  
                  <Badge className={`${planColors[user.plan as keyof typeof planColors]} flex items-center space-x-1`}>
                    {planIcons[user.plan as keyof typeof planIcons]}
                    <span className="capitalize">{user.plan}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">
                      ${user.walletBalance?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-muted-foreground">Wallet</div>
                  </div>
                  
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">
                      {user.monthlyPagesUsed || 0}
                      {planLimits && planLimits.pages !== -1 && `/${planLimits.pages}`}
                    </div>
                    <div className="text-xs text-muted-foreground">Pages Used</div>
                  </div>
                  
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">
                      {user.monthlyTranslationsUsed || 0}
                      {planLimits && planLimits.translations !== -1 && `/${planLimits.translations}`}
                    </div>
                    <div className="text-xs text-muted-foreground">Translations</div>
                  </div>
                  
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-foreground">
                      {planLimits?.languages || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Languages</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={user.plan}
                    onValueChange={(newPlan) => handlePlanUpdate(user.id, newPlan)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="basic">Basic Plan ($9.99/mo)</SelectItem>
                      <SelectItem value="pro">Professional Plan ($29.99/mo)</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan ($99.99/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateUser(user.id, { 
                      monthlyPagesUsed: 0, 
                      monthlyTranslationsUsed: 0 
                    })}
                    disabled={isUpdating}
                  >
                    Reset Usage
                  </Button>
                </div>

                {user.planUpgradedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Plan updated: {new Date(user.planUpgradedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserPlanManager;
