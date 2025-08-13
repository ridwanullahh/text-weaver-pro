
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { wrappedSDK } from '@/services/sdkService';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  BookOpen,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    blogPosts: 0,
    contactMessages: 0,
    documentation: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load various collections to calculate stats
      const [users, projects, blogPosts, contactMessages, documentation, transactions] = await Promise.all([
        wrappedSDK.get('users'),
        wrappedSDK.get('projects'),
        wrappedSDK.get('blog_posts'),
        wrappedSDK.get('contact_messages'),
        wrappedSDK.get('documentation'),
        wrappedSDK.get('transactions')
      ]);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const activeUsers = users.filter((user: any) => 
        user.lastResetDate && new Date(user.lastResetDate) > thirtyDaysAgo
      ).length;

      const completedProjects = projects.filter((project: any) => 
        project.status === 'completed'
      ).length;

      const totalRevenue = transactions
        .filter((t: any) => t.type === 'payment')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalProjects: projects.length,
        completedProjects,
        totalRevenue,
        blogPosts: blogPosts.length,
        contactMessages: contactMessages.length,
        documentation: documentation.length
      });

      // Create recent activity feed
      const activities = [
        ...users.slice(-5).map((user: any) => ({
          type: 'user',
          title: 'New user registered',
          description: user.email,
          timestamp: user.createdAt || new Date().toISOString(),
          icon: <Users className="w-4 h-4 text-blue-400" />
        })),
        ...blogPosts.slice(-3).map((post: any) => ({
          type: 'blog',
          title: 'New blog post published',
          description: post.title,
          timestamp: post.publishedAt,
          icon: <FileText className="w-4 h-4 text-green-400" />
        })),
        ...contactMessages.slice(-3).map((message: any) => ({
          type: 'contact',
          title: 'New contact message',
          description: `From ${message.name}`,
          timestamp: message.submittedAt,
          icon: <MessageSquare className="w-4 h-4 text-blue-400" />
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 8);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      icon: <Users className="w-6 h-6 text-blue-400" />,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+8%',
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      color: 'green'
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      change: '+15%',
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      color: 'blue'
    },
    {
      title: 'Completed Projects',
      value: stats.completedProjects,
      change: '+22%',
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
      color: 'emerald'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: '+18%',
      icon: <DollarSign className="w-6 h-6 text-yellow-400" />,
      color: 'yellow'
    },
    {
      title: 'Blog Posts',
      value: stats.blogPosts,
      change: '+5%',
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      color: 'indigo'
    },
    {
      title: 'Contact Messages',
      value: stats.contactMessages,
      change: '+10%',
      icon: <MessageSquare className="w-6 h-6 text-pink-400" />,
      color: 'pink'
    },
    {
      title: 'Documentation',
      value: stats.documentation,
      change: '+3%',
      icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
      color: 'cyan'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
        <p className="text-white/60">Overview of your TextWeaver Pro platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium">{stat.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <Badge className={`text-xs bg-${stat.color}-500/20 text-${stat.color}-400 border-${stat.color}-500/30`}>
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="p-2 bg-white/10 rounded-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-white/60 text-sm">{activity.description}</p>
                  </div>
                  <div className="text-white/50 text-xs">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
