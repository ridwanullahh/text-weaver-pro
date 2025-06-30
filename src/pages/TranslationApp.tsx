
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import UploadSection from '../components/UploadSection';
import TranslationProgress from '../components/TranslationProgress';
import LanguageSelector from '../components/LanguageSelector';
import ProjectManager from '../components/ProjectManager';
import ExportPanel from '../components/ExportPanel';
import TranslationAnalytics from '../components/TranslationAnalytics';
import TranslationQuality from '../components/TranslationQuality';
import LiveTranslationViewer from '../components/LiveTranslationViewer';
import { translationDB } from '../utils/database';
import { TranslationProject } from '../types/translation';
import { LogOut, Settings, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const TranslationApp = () => {
  const { user, logout } = useAuth();
  const [currentProject, setCurrentProject] = useState<TranslationProject | null>(null);
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allProjects = await translationDB.projects.toArray();
      setProjects(allProjects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Database may not be initialized.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreate = (project: TranslationProject) => {
    setCurrentProject(project);
    setProjects(prev => [...prev, project]);
    setActiveTab('translate');
  };

  const handleProjectSelect = (project: TranslationProject) => {
    setCurrentProject(project);
    setActiveTab('translate');
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'translate', label: 'Translate', icon: '🔄' },
    { id: 'live', label: 'Live View', icon: '👁️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'quality', label: 'Quality', icon: '⭐' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadProjects();
            }} 
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-medium mr-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading TextWeaver Pro</h2>
          <p className="text-white/60">Initializing your translation workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">TextWeaver Pro</h1>
              <p className="text-white/60 text-sm">Professional Document Translation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm">Wallet Balance</p>
                <p className="text-white font-bold">${user?.walletBalance.toFixed(2) || '0.00'}</p>
              </div>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              {user?.roles?.includes('admin') && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 min-w-max">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'upload' && (
              <UploadSection onProjectCreate={handleProjectCreate} />
            )}
            
            {activeTab === 'projects' && (
              <ProjectManager 
                projects={projects} 
                onProjectSelect={handleProjectSelect}
                onProjectsUpdate={loadProjects}
              />
            )}
            
            {activeTab === 'translate' && currentProject && (
              <div className="space-y-8">
                <LanguageSelector 
                  project={currentProject}
                  onUpdate={setCurrentProject}
                />
                <TranslationProgress project={currentProject} />
                <ExportPanel project={currentProject} />
              </div>
            )}

            {activeTab === 'translate' && !currentProject && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-lg mb-8">
                  Select a project from the Projects tab or create a new one
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Projects
                </motion.button>
              </div>
            )}

            {activeTab === 'live' && currentProject && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">👁️ Live Translation View</h2>
                  <p className="text-white/60 text-lg">
                    Watch your translation progress in real-time
                  </p>
                </div>
                <LiveTranslationViewer 
                  project={currentProject} 
                  isActive={activeTab === 'live'}
                />
              </div>
            )}

            {activeTab === 'live' && !currentProject && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👁️</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-lg mb-8">
                  Select a project to view live translation progress
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select Project
                </motion.button>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">📊 Translation Analytics</h2>
                  <p className="text-white/60 text-lg">
                    Comprehensive insights into your translation projects
                  </p>
                </div>
                <TranslationAnalytics projects={projects} />
              </div>
            )}

            {activeTab === 'quality' && currentProject && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">⭐ Quality Assessment</h2>
                  <p className="text-white/60 text-lg">
                    Detailed quality analysis for {currentProject.name}
                  </p>
                </div>
                <TranslationQuality project={currentProject} />
              </div>
            )}

            {activeTab === 'quality' && !currentProject && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Project Selected</h3>
                <p className="text-white/60 text-lg mb-8">
                  Select a project to view quality assessment
                </p>
                <motion.button
                  onClick={() => setActiveTab('projects')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select Project
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TranslationApp;
