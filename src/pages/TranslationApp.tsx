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
  Zap,
  Sparkles,
  FileText
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
    { id: 'upload', label: 'Upload', icon: Upload, description: 'Upload documents' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, description: 'Manage projects' },
    { id: 'translate', label: 'Translate', icon: Languages, description: 'Translation studio' },
    { id: 'suggestions', label: 'AI Assist', icon: Brain, description: 'Smart suggestions' },
    { id: 'batch', label: 'Batch', icon: Package, description: 'Bulk operations' },
    { id: 'live', label: 'Live', icon: Eye, description: 'Real-time view' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Usage insights' },
    { id: 'quality', label: 'Quality', icon: Star, description: 'Quality check' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configure AI' }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md mx-4 border-destructive/20">
          <CardContent className="text-center p-6">
            <div className="text-4xl mb-4 text-destructive">⚠️</div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                loadProjects();
              }} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
          <h2 className="text-xl font-bold mb-4 text-foreground">Loading Translation Studio</h2>
          <p className="text-muted-foreground">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-effect rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Translation Studio</h1>
            <p className="text-muted-foreground text-sm">Professional document translation powered by AI</p>
          </div>
          
          {/* Extraction Method Toggle */}
          <div className="bg-muted/50 rounded-lg p-1 flex w-full sm:w-auto">
            <button
              onClick={() => setExtractionMethod('traditional')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                extractionMethod === 'traditional'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Fast Mode</span>
            </button>
            <button
              onClick={() => setExtractionMethod('ai')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                extractionMethod === 'ai'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-effect rounded-xl p-2">
        <div className="overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-muted/50 border border-transparent hover:border-border'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'text-primary-foreground' : 'text-primary'} mb-1 sm:mb-0`} />
                <div className="text-center sm:text-left">
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className={`text-xs ${activeTab === tab.id ? 'text-primary-foreground/80' : 'text-muted-foreground'} hidden sm:block`}>
                    {tab.description}
                  </div>
                </div>
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
        className="glass-effect rounded-xl overflow-hidden"
      >
        {activeTab === 'upload' && (
          <div className="p-4 sm:p-6">
            <UploadSection 
              onFilesProcessed={handleFilesProcessed}
              extractionMethod={extractionMethod}
              onExtractionMethodChange={setExtractionMethod}
            />
          </div>
        )}
        
        {activeTab === 'projects' && (
          <div className="p-4 sm:p-6">
            <ProjectManager 
              projects={projects} 
              onProjectSelect={handleProjectSelect}
              onProjectsUpdate={loadProjects}
            />
          </div>
        )}
        
        {activeTab === 'translate' && currentProject && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <LanguageSelector 
              project={currentProject}
              onUpdate={setCurrentProject}
            />
            <TranslationProgress project={currentProject} />
            <ExportPanel project={currentProject} />
          </div>
        )}

        {activeTab === 'translate' && !currentProject && (
          <div className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 text-muted-foreground/50">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground">No Project Selected</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
              Select a project from the Projects tab or create a new one by uploading documents
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <Button
                onClick={() => setActiveTab('projects')}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                View Projects
              </Button>
              <Button
                onClick={() => setActiveTab('upload')}
                className="gradient-primary text-primary-foreground hover:shadow-lg"
              >
                Upload Documents
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && currentProject && (
          <div className="p-4 sm:p-6 space-y-4">
            <Card className="mb-4 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary" />
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
          <div className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 text-muted-foreground/50">
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground">No Project Selected</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
              Select a project to get AI-powered translation suggestions
            </p>
            <Button
              onClick={() => setActiveTab('projects')}
              className="gradient-primary text-primary-foreground hover:shadow-lg"
            >
              Select Project
            </Button>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="p-4 sm:p-6 space-y-4">
            <Card className="mb-4 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
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
          <div className="p-4 sm:p-6 space-y-4">
            <Card className="mb-4 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-primary" />
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
          <div className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 text-muted-foreground/50">
              <Eye className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground">No Project Selected</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
              Select a project to view live translation progress
            </p>
            <Button
              onClick={() => setActiveTab('projects')}
              className="gradient-primary text-primary-foreground hover:shadow-lg"
            >
              Select Project
            </Button>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-4 sm:p-6 space-y-4">
            <Card className="mb-4 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
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
          <div className="p-4 sm:p-6 space-y-4">
            <Card className="mb-4 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
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
          <div className="p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 text-muted-foreground/50">
              <Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground">No Project Selected</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
              Select a project to view quality assessment
            </p>
            <Button
              onClick={() => setActiveTab('projects')}
              className="gradient-primary text-primary-foreground hover:shadow-lg"
            >
              Select Project
            </Button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 sm:p-6 space-y-4">
            <Card className="mb-4 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
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
