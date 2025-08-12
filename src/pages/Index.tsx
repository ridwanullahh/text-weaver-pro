
import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { monetizationService } from '@/services/monetizationService';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Globe, 
  Zap, 
  Wallet, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Crown,
  Plus
} from 'lucide-react';

const Index = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [recentActivity, setRecentActivity] = useState([]);
  const [planLimits, setPlanLimits] = useState(null);

  useEffect(() => {
    if (user?.plan) {
      const limits = monetizationService.getPlanLimits(user.plan);
      setPlanLimits(limits);
    }
  }, [user?.plan]);

  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Available",
      description: "Check out our pricing plans to unlock more features!",
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-amber-100 text-amber-800'
  };

  const stats = [
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      label: 'Documents Processed',
      value: user?.totalDocuments || 0,
      change: '+12%'
    },
    {
      icon: <Globe className="w-5 h-5 text-primary" />,
      label: 'Languages Used',
      value: user?.languagesUsed || 0,
      change: '+5%'
    },
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      label: 'Pages This Month',
      value: user?.monthlyPagesUsed || 0,
      change: planLimits?.pages === -1 ? 'Unlimited' : `/${planLimits?.pages || 0}`
    },
    {
      icon: <Wallet className="w-5 h-5 text-primary" />,
      label: 'Wallet Balance',
      value: `$${(user?.walletBalance || 0).toFixed(2)}`,
      change: ''
    }
  ];

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <section className="px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground mb-4">
              Ready to translate some documents today?
            </p>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Badge className={`${planColors[user?.plan as keyof typeof planColors] || planColors.free} flex items-center space-x-1`}>
                {user?.plan === 'enterprise' && <Crown className="w-3 h-3" />}
                <span className="capitalize">{user?.plan || 'Free'} Plan</span>
              </Badge>
              
              {user?.plan !== 'enterprise' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpgradePlan}
                  className="text-primary border-primary"
                >
                  Upgrade
                </Button>
              )}
            </div>

            <Link to="/app">
              <Button size="lg" className="gradient-primary text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Start Translating
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Stats Overview */}
        <section className="px-4">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      {stat.icon}
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    {stat.change && (
                      <div className="text-xs text-muted-foreground">{stat.change}</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Usage Progress */}
        {planLimits && (
          <section className="px-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Monthly Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pages</span>
                    <span>
                      {user?.monthlyPagesUsed || 0}
                      {planLimits.pages === -1 ? ' (Unlimited)' : ` / ${planLimits.pages}`}
                    </span>
                  </div>
                  {planLimits.pages !== -1 && (
                    <Progress 
                      value={getUsagePercentage(user?.monthlyPagesUsed || 0, planLimits.pages)} 
                      className="h-2"
                    />
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Translations</span>
                    <span>
                      {user?.monthlyTranslationsUsed || 0}
                      {planLimits.translations === -1 ? ' (Unlimited)' : ` / ${planLimits.translations}`}
                    </span>
                  </div>
                  {planLimits.translations !== -1 && (
                    <Progress 
                      value={getUsagePercentage(user?.monthlyTranslationsUsed || 0, planLimits.translations)} 
                      className="h-2"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section className="px-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/app" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="w-4 h-4 mr-3" />
                  Upload & Translate Document
                </Button>
              </Link>
              
              <Link to="/pricing" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Crown className="w-4 h-4 mr-3" />
                  View Pricing Plans
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Wallet className="w-4 h-4 mr-3" />
                Add Wallet Credit
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section className="px-4 pb-8">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Document translated</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground">Start translating to see your history here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </MobileLayout>
  );
};

export default Index;
