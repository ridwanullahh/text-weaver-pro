
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, BookOpen, Settings } from 'lucide-react';
import { TranslationProject, TranslationSettings } from '../types/translation';
import { dbUtils } from '../utils/database';
import { toast } from '@/hooks/use-toast';
import APIKeySetup from './APIKeySetup';

interface UploadSectionProps {
  onProjectCreate: (project: TranslationProject) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onProjectCreate }) => {
  const [projectName, setProjectName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [settings, setSettings] = useState<TranslationSettings>({
    preserveFormatting: true,
    chunkSize: 1000,
    maxRetries: 3,
    translationStyle: 'formal',
    contextAware: true
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      if (!projectName) {
        setProjectName(file.name.split('.')[0]);
      }
    }
  }, [projectName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/epub+zip': ['.epub']
    },
    multiple: false
  });

  const handleCreateProject = async () => {
    if (!projectName || (!uploadedFile && !textContent)) {
      toast({
        title: "Missing Information",
        description: "Please provide a project name and content.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let content = textContent;
      let fileType: 'text' | 'pdf' | 'docx' | 'epub' = 'text';

      if (uploadedFile) {
        // Process file content based on type
        if (uploadedFile.type === 'text/plain') {
          content = await uploadedFile.text();
          fileType = 'text';
        } else if (uploadedFile.type === 'application/pdf') {
          // TODO: Implement PDF text extraction
          content = 'PDF content extraction will be implemented';
          fileType = 'pdf';
        } else if (uploadedFile.name.endsWith('.docx')) {
          // TODO: Implement DOCX text extraction
          content = 'DOCX content extraction will be implemented';
          fileType = 'docx';
        } else if (uploadedFile.name.endsWith('.epub')) {
          // TODO: Implement EPUB text extraction
          content = 'EPUB content extraction will be implemented';
          fileType = 'epub';
        }
      }

      // Calculate total chunks based on content length and chunk size
      const totalChunks = Math.ceil(content.length / settings.chunkSize);

      const projectData = {
        name: projectName,
        sourceLanguage,
        targetLanguages: [],
        originalContent: content,
        fileType,
        totalChunks,
        completedChunks: 0,
        status: 'pending' as const,
        progress: 0,
        settings
      };

      const project = await dbUtils.createProject(projectData);
      
      toast({
        title: "Project Created",
        description: `${projectName} has been created successfully!`,
      });

      onProjectCreate(project);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* API Key Setup */}
      <div className="text-center mb-8">
        <motion.button
          onClick={() => setShowApiSetup(!showApiSetup)}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white px-6 py-3 rounded-2xl font-medium hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
          {showApiSetup ? 'Hide' : 'Setup'} Gemini API Key
        </motion.button>
      </div>

      {showApiSetup && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <APIKeySetup />
        </motion.div>
      )}

      {/* Upload Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-2">
            <motion.button
              onClick={() => setUploadMode('file')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                uploadMode === 'file'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </motion.button>
            <motion.button
              onClick={() => setUploadMode('text')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                uploadMode === 'text'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-4 h-4" />
              Enter Text
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Content Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Content Input
          </h3>

          {uploadMode === 'file' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-white/30 hover:border-white/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              {uploadedFile ? (
                <div className="text-white">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-white/60">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-white/80">
                  <p className="text-lg font-medium">Drop your file here</p>
                  <p className="text-sm text-white/60">Supports TXT, PDF, DOCX, EPUB</p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-64 bg-white/5 border border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          )}
        </motion.div>

        {/* Project Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            Project Settings
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">Source Language</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">Translation Style</label>
              <select
                value={settings.translationStyle}
                onChange={(e) => setSettings(prev => ({ ...prev, translationStyle: e.target.value as any }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="literary">Literary</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">Chunk Size</label>
              <select
                value={settings.chunkSize}
                onChange={(e) => setSettings(prev => ({ ...prev, chunkSize: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={500}>Small (500 chars)</option>
                <option value={1000}>Medium (1000 chars)</option>
                <option value={2000}>Large (2000 chars)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium">Preserve Formatting</span>
              <motion.button
                onClick={() => setSettings(prev => ({ ...prev, preserveFormatting: !prev.preserveFormatting }))}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.preserveFormatting ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/20'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: settings.preserveFormatting ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 font-medium">Context Aware</span>
              <motion.button
                onClick={() => setSettings(prev => ({ ...prev, contextAware: !prev.contextAware }))}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.contextAware ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/20'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: settings.contextAware ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Project Button */}
      <div className="text-center">
        <motion.button
          onClick={handleCreateProject}
          disabled={isProcessing || (!uploadedFile && !textContent) || !projectName}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Project...
            </div>
          ) : (
            'Create Translation Project'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default UploadSection;
