
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ExtractionMethodSelector from './ExtractionMethodSelector';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  Download,
  Loader
} from 'lucide-react';
import { fileExtractor } from '../services/fileExtractor';
import { translationDB } from '../utils/database';
import { TranslationProject } from '../types/translation';

interface UploadSectionProps {
  onProjectCreate: (project: TranslationProject) => void;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedContent?: string;
  metadata?: any;
  error?: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onProjectCreate }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'traditional'>('ai');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'pending' as const,
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/html': ['.html'],
      'application/xml': ['.xml'],
      'application/json': ['.json'],
      'application/epub+zip': ['.epub']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  const processFile = async (fileData: UploadedFile) => {
    console.log(`Starting file processing for: ${fileData.file.name}`);
    
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileData.id 
        ? { ...f, status: 'processing', progress: 10 }
        : f
    ));

    try {
      // Simulate progress updates during extraction
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id && f.progress < 90
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 500);

      console.log(`Processing file: ${fileData.file.name} with ${extractionMethod} method`);
      
      // Extract content using selected method
      const extractedData = await fileExtractor.extractFromFile(fileData.file, extractionMethod);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      console.log(`Extraction completed for ${fileData.file.name}:`, extractedData.text?.length, 'characters');
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              extractedContent: extractedData.text,
              metadata: extractedData.metadata
            }
          : f
      ));

      return extractedData;
    } catch (error) {
      console.error('File processing error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { 
              ...f, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : 'Processing failed'
            }
          : f
      ));
      throw error;
    }
  };

  const processAllFiles = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      setIsProcessing(false);
      return;
    }
    
    console.log(`Processing ${pendingFiles.length} files...`);
    
    try {
      // Process files sequentially to avoid overwhelming the system
      for (const fileData of pendingFiles) {
        await processFile(fileData);
        // Small delay between files
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check if we have completed files to create a project
      const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
      if (completedFiles.length > 0) {
        console.log('Creating project from completed files...');
        await createProject(completedFiles);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createProject = async (completedFiles: UploadedFile[]) => {
    try {
      console.log('Creating project from', completedFiles.length, 'files');
      
      const combinedContent = completedFiles
        .map(f => f.extractedContent)
        .filter(Boolean)
        .join('\n\n---\n\n');

      if (!combinedContent.trim()) {
        throw new Error('No content extracted from files');
      }

      const totalWords = combinedContent.split(/\s+/).filter(word => word.length > 0).length;
      
      // Determine file type based on the first uploaded file
      const firstFile = completedFiles[0];
      let fileType: 'text' | 'pdf' | 'docx' | 'epub' = 'text';
      if (firstFile.file.type === 'application/pdf') fileType = 'pdf';
      else if (firstFile.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') fileType = 'docx';
      else if (firstFile.file.type === 'application/epub+zip') fileType = 'epub';
      
      const project: TranslationProject = {
        id: Date.now(),
        name: completedFiles.length === 1 
          ? completedFiles[0].file.name.split('.')[0]
          : `Multi-file Project (${completedFiles.length} files)`,
        sourceLanguage: 'auto',
        targetLanguages: [],
        originalContent: combinedContent,
        fileType,
        totalChunks: 1,
        completedChunks: 0,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: 0,
        settings: {
          preserveFormatting: true,
          chunkSize: 1000,
          maxRetries: 3,
          translationStyle: 'formal',
          contextAware: true
        }
      };

      console.log('Saving project to database:', project.name);
      await translationDB.projects.add(project);
      
      console.log('Project created successfully, calling onProjectCreate');
      onProjectCreate(project);
      
      // Clear uploaded files after project creation
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryFile = async (fileId: string) => {
    const fileData = uploadedFiles.find(f => f.id === fileId);
    if (fileData) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'pending', progress: 0, error: undefined }
          : f
      ));
      
      try {
        await processFile(fileData);
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing': return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <FileText className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">📤 Upload Documents</h2>
        <p className="text-white/60 text-sm md:text-lg">
          Upload your documents and select your preferred extraction method
        </p>
      </div>

      {/* Extraction Method Selector */}
      <ExtractionMethodSelector 
        method={extractionMethod}
        onMethodChange={setExtractionMethod}
        disabled={uploadedFiles.some(f => f.status === 'processing') || isProcessing}
      />

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 md:p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-6 md:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-purple-400 bg-purple-400/10'
                  : 'border-white/30 hover:border-purple-400/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 md:w-16 md:h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </h3>
              <p className="text-white/60 mb-4 text-sm md:text-base">
                Supports PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, EPUB
              </p>
              <p className="text-white/40 text-xs md:text-sm">
                Maximum file size: 50MB per file
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>Uploaded Files ({uploadedFiles.length})</span>
              <div className="flex gap-2">
                {uploadedFiles.some(f => f.status === 'pending') && (
                  <Button 
                    onClick={processAllFiles}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 w-full sm:w-auto"
                  >
                    {isProcessing ? 'Processing...' : 'Process All Files'}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((fileData) => (
                <div key={fileData.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(fileData.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{fileData.file.name}</p>
                        <p className="text-white/60 text-sm">
                          {(fileData.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`border-white/20 ${getStatusColor(fileData.status)}`}>
                        {fileData.status}
                      </Badge>
                      {fileData.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryFile(fileData.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(fileData.id)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {fileData.status === 'processing' && (
                    <Progress value={fileData.progress} className="mb-2" />
                  )}
                  
                  {fileData.error && (
                    <p className="text-red-400 text-sm mb-2">{fileData.error}</p>
                  )}
                  
                  {fileData.extractedContent && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/80 text-sm mb-2">
                        Content Preview ({fileData.metadata?.wordCount || 0} words):
                      </p>
                      <p className="text-white/60 text-sm line-clamp-3">
                        {fileData.extractedContent.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadSection;
