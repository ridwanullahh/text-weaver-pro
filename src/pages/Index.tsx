
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { 
  FileText, 
  Globe, 
  TrendingUp, 
  Zap,
  Crown,
  ArrowRight,
  Wallet,
  Calendar,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  const quickStats = [
    {
      title: 'Documents',
      value: user?.totalDocuments || 0,
      icon: FileText,
    },
    {
      title: 'Languages',
      value: user?.languagesUsed || 0,
      icon: Globe,
    },
    {
      title: 'Pages Used',
      value: user?.monthlyPagesUsed || 0,
      icon: TrendingUp,
    },
  ];

  const planLimits = {
    free: { pages: 10, translations: 5 },
    basic: { pages: 100, translations: 50 },
    pro: { pages: 1000, translations: 500 },
    enterprise: { pages: -1, translations: -1 }
  };

  const currentLimits = planLimits[user?.plan || 'free'];
  const pagesUsed = user?.monthlyPagesUsed || 0;
  const translationsUsed = user?.monthlyTranslationsUsed || 0;

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-6 text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Ready to translate some documents today?
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Plan Status */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <span>Current Plan</span>
            </div>
            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary">
              {user?.plan || 'free'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pages Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">Monthly Pages</span>
              <span className="text-muted-foreground">
                {pagesUsed}
                {currentLimits.pages !== -1 && `/${currentLimits.pages}`}
              </span>
            </div>
            {currentLimits.pages !== -1 && (
              <Progress 
                value={(pagesUsed / currentLimits.pages) * 100} 
                className="h-2"
              />
            )}
          </div>

          {/* Translations Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">Monthly Translations</span>
              <span className="text-muted-foreground">
                {translationsUsed}
                {currentLimits.translations !== -1 && `/${currentLimits.translations}`}
              </span>
            </div>
            {currentLimits.translations !== -1 && (
              <Progress 
                value={(translationsUsed / currentLimits.translations) * 100} 
                className="h-2"
              />
            )}
          </div>

          {user?.plan === 'free' && (
            <div className="pt-2">
              <Link to="/pricing">
                <Button className="w-full gradient-primary text-primary-foreground">
                  Upgrade Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/app" className="block">
            <Button className="w-full justify-start border-border text-foreground hover:bg-muted" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Start New Translation
            </Button>
          </Link>
          
          <Link to="/app?tab=projects" className="block">
            <Button className="w-full justify-start border-border text-foreground hover:bg-muted" variant="outline">
              <Award className="w-4 h-4 mr-2" />
              View Projects
            </Button>
          </Link>
          
          <Link to="/app?tab=analytics" className="block">
            <Button className="w-full justify-start border-border text-foreground hover:bg-muted" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Wallet Info */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span>Wallet Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-2">
              ${(user?.walletBalance || 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Available for premium features and translations
            </p>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              Add Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Dashboard Component */}
      <UserDashboard />
    </div>
  );
};

export default Index;
