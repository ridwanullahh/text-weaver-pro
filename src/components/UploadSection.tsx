import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, BookOpen, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { TranslationProject, TranslationSettings } from '../types/translation';
import { dbUtils } from '../utils/database';
import { fileExtractor } from '../services/fileExtractor';
import { toast } from '@/hooks/use-toast';
import APIKeySetup from './APIKeySetup';
import BookPreview from './BookPreview';
import ExtractionMethodSelector from './ExtractionMethodSelector';

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
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [previewProject, setPreviewProject] = useState<TranslationProject | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'traditional'>('ai');
  const [settings, setSettings] = useState<TranslationSettings>({
    preserveFormatting: true,
    chunkSize: 1000,
    maxRetries: 3,
    translationStyle: 'formal',
    contextAware: true
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      console.log('File dropped:', file.name, file.type, file.size);
      setUploadedFile(file);
      setExtractionSuccess(false);
      
      if (!projectName) {
        setProjectName(file.name.split('.')[0]);
      }

      // Extract content and metadata using selected method
      try {
        setIsProcessing(true);
        console.log(`Starting file extraction using ${extractionMethod} method...`);
        
        let extracted;
        if (file.type === 'application/pdf') {
          // For PDFs, use the selected extraction method
          extracted = await fileExtractor.extractFromFile(file, extractionMethod);
        } else {
          // For other file types, use regular extraction
          extracted = await fileExtractor.extractFromFile(file);
        }
        
        console.log('File extraction successful:', extracted.text.length, 'characters');
        
        setTextContent(extracted.text);
        setExtractedMetadata(extracted.metadata);
        setExtractionSuccess(true);
        
        // Create preview project
        const preview: TranslationProject = {
          name: extracted.metadata?.title || file.name.split('.')[0],
          sourceLanguage,
          targetLanguages: [],
          originalContent: extracted.text,
          fileType: getFileType(file),
          totalChunks: Math.ceil(extracted.text.length / settings.chunkSize),
          completedChunks: 0,
          status: 'pending',
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings
        };
        setPreviewProject(preview);
        
        toast({
          title: "File Processed Successfully",
          description: `Extracted ${extracted.text.length.toLocaleString()} characters from ${file.name} using ${extractionMethod} method`,
        });
      } catch (error) {
        console.error('File extraction error:', error);
        setExtractionSuccess(false);
        toast({
          title: "File Processing Warning",
          description: error instanceof Error ? error.message : "File uploaded but content extraction had issues.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [projectName, sourceLanguage, settings.chunkSize, extractionMethod]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/rtf': ['.rtf'],
      'text/csv': ['.csv'],
      'text/html': ['.html', '.htm'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
      'application/json': ['.json'],
      'application/epub+zip': ['.epub']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024 // 100MB limit
  });

  const getFileType = (file: File): 'text' | 'pdf' | 'docx' | 'epub' => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (file.name.endsWith('.epub')) return 'epub';
    return 'text';
  };

  const handleCreateProject = async () => {
    if (!projectName) {
      toast({
        title: "Missing Project Name",
        description: "Please provide a project name.",
        variant: "destructive"
      });
      return;
    }

    if (!uploadedFile && !textContent) {
      toast({
        title: "Missing Content",
        description: "Please upload a file or enter text content.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let content = textContent;
      let fileType: 'text' | 'pdf' | 'docx' | 'epub' = 'text';
      let metadata = extractedMetadata;

      // If we have a file but no content, try to extract it
      if (uploadedFile && !content) {
        console.log('Extracting content from file for project creation...');
        try {
          let extracted;
          if (uploadedFile.type === 'application/pdf') {
            extracted = await fileExtractor.extractFromFile(uploadedFile, extractionMethod);
          } else {
            extracted = await fileExtractor.extractFromFile(uploadedFile);
          }
          content = extracted.text;
          metadata = extracted.metadata;
          fileType = getFileType(uploadedFile);
        } catch (error) {
          console.error('Content extraction failed, using fallback:', error);
          // Use fallback content
          content = `File "${uploadedFile.name}" uploaded successfully. Content will be processed for translation.`;
          fileType = getFileType(uploadedFile);
        }
      }

      // Ensure we have some content
      if (!content || content.trim().length === 0) {
        throw new Error('No content available for translation');
      }

      const totalChunks = Math.ceil(content.length / settings.chunkSize);

      const projectData = {
        name: metadata?.title || projectName,
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

      console.log('Creating project with data:', projectData);
      const project = await dbUtils.createProject(projectData);
      console.log('Project created successfully:', project);
      
      toast({
        title: "Project Created Successfully",
        description: `${projectData.name} is ready for translation!`,
      });

      // Reset form
      setProjectName('');
      setUploadedFile(null);
      setTextContent('');
      setExtractedMetadata(null);
      setPreviewProject(null);
      setExtractionSuccess(false);

      onProjectCreate(project);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Failed to Create Project",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
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

      {/* Book Preview */}
      {previewProject && extractedMetadata && (
        <BookPreview project={previewProject} metadata={extractedMetadata} />
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
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
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
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-medium">Processing file...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="text-white">
                    <div className="flex items-center justify-center mb-4">
                      <FileText className="w-12 h-12 text-green-400 mr-2" />
                      {extractionSuccess && <CheckCircle className="w-6 h-6 text-green-400" />}
                    </div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-white/60">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    {extractedMetadata && (
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {extractedMetadata.wordCount && (
                          <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-white/60">Words</div>
                            <div className="font-medium">{extractedMetadata.wordCount.toLocaleString()}</div>
                          </div>
                        )}
                        {extractedMetadata.pages && (
                          <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-white/60">Pages</div>
                            <div className="font-medium">{extractedMetadata.pages}</div>
                          </div>
                        )}
                      </div>
                    )}
                    {extractionSuccess && (
                      <div className="mt-4 flex items-center justify-center text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Content extracted successfully using {extractionMethod} method
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/80">
                    <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-lg font-medium">Drop your document here</p>
                    <p className="text-sm text-white/60 mt-2">
                      Supports: PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, EPUB
                    </p>
                    <p className="text-xs text-white/40 mt-1">Max file size: 100MB</p>
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

            {/* Processing Status */}
            {(textContent || uploadedFile) && (
              <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {textContent.length.toLocaleString()} characters • 
                    {Math.ceil(textContent.length / settings.chunkSize)} chunks will be created
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Extraction Method Selector - Only show for PDF files */}
          {uploadedFile?.type === 'application/pdf' && (
            <ExtractionMethodSelector
              method={extractionMethod}
              onMethodChange={setExtractionMethod}
              disabled={isProcessing}
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
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="it">Italian</option>
                <option value="ko">Korean</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">Translation Style</label>
              <select
                value={settings.translationStyle}
                onChange={(e) => setSettings(prev => ({ ...prev, translationStyle: e.target.value as any }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="formal">Formal & Professional</option>
                <option value="casual">Casual & Conversational</option>
                <option value="literary">Literary & Artistic</option>
                <option value="technical">Technical & Precise</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">Chunk Size</label>
              <select
                value={settings.chunkSize}
                onChange={(e) => setSettings(prev => ({ ...prev, chunkSize: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={500}>Small (500 chars) - More accurate</option>
                <option value={1000}>Medium (1000 chars) - Balanced</option>
                <option value={2000}>Large (2000 chars) - Faster</option>
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
          whileHover={!isProcessing ? { scale: 1.05 } : {}}
          whileTap={!isProcessing ? { scale: 0.95 } : {}}
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
