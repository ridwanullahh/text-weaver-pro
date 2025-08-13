
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Clock, Zap, Award, Globe } from 'lucide-react';
import { TranslationProject } from '../types/translation';

interface TranslationAnalyticsProps {
  projects: TranslationProject[];
}

const TranslationAnalytics: React.FC<TranslationAnalyticsProps> = ({ projects }) => {
  // Generate analytics data
  const languageData = projects.reduce((acc, project) => {
    project.targetLanguages.forEach(lang => {
      acc[lang] = (acc[lang] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(languageData).map(([lang, count]) => ({
    language: lang.toUpperCase(),
    count,
    percentage: Math.round((count / projects.length) * 100)
  }));

  const statusData = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusData).map(([status, count], index) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]
  }));

  const progressData = projects.map((project, index) => ({
    name: `Project ${index + 1}`,
    progress: project.progress,
    chunks: project.totalChunks
  }));

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalLanguages = new Set(projects.flatMap(p => p.targetLanguages)).size;
  const averageProgress = projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects || 0;

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-blue-400" />
            <span className="text-white/80 font-medium">Total Projects</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalProjects}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-green-400" />
            <span className="text-white/80 font-medium">Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">{completedProjects}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-6 h-6 text-blue-400" />
            <span className="text-white/80 font-medium">Languages</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalLanguages}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            <span className="text-white/80 font-medium">Avg Progress</span>
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(averageProgress)}%</p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Language Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h4 className="text-xl font-bold text-white mb-6">Language Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="language" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #374151', 
                  borderRadius: '12px',
                  color: '#ffffff'
                }} 
              />
              <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h4 className="text-xl font-bold text-white mb-6">Project Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #374151', 
                  borderRadius: '12px',
                  color: '#ffffff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white/80 text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
      >
        <h4 className="text-xl font-bold text-white mb-6">Project Progress</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #374151', 
                borderRadius: '12px',
                color: '#ffffff'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="progress" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#06b6d4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default TranslationAnalytics;
