
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UploadSection from '../components/UploadSection';
import TranslationProgress from '../components/TranslationProgress';
import LanguageSelector from '../components/LanguageSelector';
import ProjectManager from '../components/ProjectManager';
import ExportPanel from '../components/ExportPanel';
import TranslationAnalytics from '../components/TranslationAnalytics';
import TranslationQuality from '../components/TranslationQuality';
import LiveTranslationViewer from '../components/LiveTranslationViewer';
import AIProviderSettings from '../components/settings/AIProviderSettings';
import SmartTranslationSuggestions from '../components/SmartTranslationSuggestions';
import BatchOperations from '../components/BatchOperations';
import { translationDB } from '../utils/database';
import { TranslationProject } from '../types/translation';
import { 
  Upload, 
  FolderOpen, 
  Languages, 
  Brain, 
  Package, 
  Eye, 
  BarChart3, 
  Star, 
  Settings,
  ArrowLeft,
  Zap,
  Sparkles
} from 'lucide-react';

const TranslationApp = () => {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<TranslationProject | null>(null);
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<'traditional' | 'ai'>('ai');

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

  const handleFilesProcessed = async (files: Array<{ name: string; content: string; size: number }>) => {
    try {
      const combinedContent = files.map(file => file.content).join('\n\n');
      
      const newProject: TranslationProject = {
        id: Date.now().toString(),
        name: files.length === 1 ? files[0].name.split('.')[0] : `Multi-File Project_${Date.now()}`,
        status: 'ready',
        sourceLanguage: 'auto',
        targetLanguages: [],
        totalChunks: Math.ceil(combinedContent.split(' ').length / 1000),
        translatedChunks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        originalContent: combinedContent,
        fileType: files[0].name.split('.').pop() as any || 'txt',
        completedChunks: 0,
        progress: 0,
        files: files.map((file, index) => ({
          id: `file_${index}`,
          name: file.name,
          size: file.size,
          content: file.content,
          type: file.name.split('.').pop() || 'txt',
          uploadedAt: new Date()
        }))
      };

      await translationDB.projects.add(newProject);
      setCurrentProject(newProject);
      setProjects(prev => [...prev, newProject]);
      setActiveTab('translate');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload, color: 'text-blue-500' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, color: 'text-green-500' },
    { id: 'translate', label: 'Translate', icon: Languages, color: 'text-purple-500' },
    { id: 'suggestions', label: 'AI Assist', icon: Brain, color: 'text-pink-500' },
    { id: 'batch', label: 'Batch', icon: Package, color: 'text-orange-500' },
    { id: 'live', label: 'Live', icon: Eye, color: 'text-indigo-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-500' },
    { id: 'quality', label: 'Quality', icon: Star, color: 'text-yellow-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-500' }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center p-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                loadProjects();
              }} 
              className="gradient-primary text-primary-foreground"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <h2 className="text-xl font-bold mb-4">Loading Translation Studio</h2>
          <p className="text-muted-foreground">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Extraction Method Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Extraction Mode</h3>
              <p className="text-sm text-muted-foreground">Choose your processing method</p>
            </div>
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setExtractionMethod('traditional')}
                className={`px-3 py-2 rounded text-sm font-medium transition-all flex items-center space-x-1 ${
                  extractionMethod === 'traditional'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </button>
              <button
                onClick={() => setExtractionMethod('ai')}
                className={`px-3 py-2 rounded text-sm font-medium transition-all flex items-center space-x-1 ${
                  extractionMethod === 'ai'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap min-w-max ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-md border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
              <span>{tab.label}</span>
            </motion.button>
          ))}
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
          <UploadSection 
            onFilesProcessed={handleFilesProcessed}
            extractionMethod={extractionMethod}
            onExtractionMethodChange={setExtractionMethod}
          />
        )}
        
        {activeTab === 'projects' && (
          <ProjectManager 
            projects={projects} 
            onProjectSelect={handleProjectSelect}
            onProjectsUpdate={loadProjects}
          />
        )}
        
        {activeTab === 'translate' && currentProject && (
          <div className="space-y-6">
            <LanguageSelector 
              project={currentProject}
              onUpdate={setCurrentProject}
            />
            <TranslationProgress project={currentProject} />
            <ExportPanel project={currentProject} />
          </div>
        )}

        {activeTab === 'translate' && !currentProject && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-4">No Project Selected</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select a project from the Projects tab or create a new one
              </p>
              <Button
                onClick={() => setActiveTab('projects')}
                className="gradient-primary text-primary-foreground"
              >
                View Projects
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'suggestions' && currentProject && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-pink-500" />
                  <span>AI Translation Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart suggestions to improve your translation workflow for {currentProject.name}
                </p>
              </CardContent>
            </Card>
            <SmartTranslationSuggestions 
              project={currentProject}
              onApplySuggestion={(suggestionId) => {
                console.log('Applied suggestion:', suggestionId);
              }}
            />
          </div>
        )}

        {activeTab === 'suggestions' && !currentProject && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-4">No Project Selected</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select a project to get AI-powered translation suggestions
              </p>
              <Button
                onClick={() => setActiveTab('projects')}
                className="gradient-primary text-primary-foreground"
              >
                Select Project
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'batch' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <span>Batch Operations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage multiple translation projects efficiently
                </p>
              </CardContent>
            </Card>
            <BatchOperations 
              projects={projects}
              onBatchAction={async (action, projectIds) => {
                console.log(`Executing batch operation: ${action} on projects:`, projectIds);
                await loadProjects();
              }}
            />
          </div>
        )}

        {activeTab === 'live' && currentProject && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  <span>Live Translation View</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Watch your translation progress in real-time for {currentProject.name}
                </p>
              </CardContent>
            </Card>
            <LiveTranslationViewer 
              project={currentProject} 
              isActive={activeTab === 'live'}
            />
          </div>
        )}

        {activeTab === 'live' && !currentProject && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold mb-4">No Project Selected</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select a project to view live translation progress
              </p>
              <Button
                onClick={() => setActiveTab('projects')}
                className="gradient-primary text-primary-foreground"
              >
                Select Project
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  <span>Translation Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive insights into your translation projects
                </p>
              </CardContent>
            </Card>
            <TranslationAnalytics projects={projects} />
          </div>
        )}

        {activeTab === 'quality' && currentProject && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Quality Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed quality analysis for {currentProject.name}
                </p>
              </CardContent>
            </Card>
            <TranslationQuality project={currentProject} />
          </div>
        )}

        {activeTab === 'quality' && !currentProject && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-4">No Project Selected</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select a project to view quality assessment
              </p>
              <Button
                onClick={() => setActiveTab('projects')}
                className="gradient-primary text-primary-foreground"
              >
                Select Project
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>AI Provider Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure your AI provider for translation services
                </p>
              </CardContent>
            </Card>
            <AIProviderSettings />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TranslationApp;
