import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ExtractionMethodSelector from './ExtractionMethodSelector';
import ExtractionSettings from './ExtractionSettings';
import ExtractionProgress from './ExtractionProgress';
import { monetizationService } from '../services/monetizationService';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  Download,
  Loader,
  Info,
  DollarSign,
  Wallet
} from 'lucide-react';
import { fileExtractor } from '../services/fileExtractor';
import { geminiPdfExtractor } from '../services/geminiPdfExtractor';
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
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
    fileSize?: string;
    lastModified?: Date;
  };
  error?: string;
  estimatedCost?: number;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onProjectCreate }) => {
  const { user, updateWallet } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'traditional'>('ai');
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [extractionSettings, setExtractionSettings] = useState({
    ignoreHeaders: true,
    ignoreFooters: true,
    ignorePageNumbers: true,
    ignoreFootnotes: false,
    maintainFormatting: true,
    separatePages: true
  });
  const [currentExtractionProgress, setCurrentExtractionProgress] = useState<{
    currentPage: number;
    totalPages: number;
    currentFile: string;
    stage: 'analyzing' | 'extracting' | 'processing' | 'completed';
    processingTime: number;
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(acceptedFiles.map(async (file) => {
      let estimatedCost = 0;
      
      // Estimate pages for PDF files
      if (file.type === 'application/pdf') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const pages = pdf.numPages;
          
          if (extractionMethod === 'ai') {
            const costCalculation = monetizationService.calculateExtractionCost(pages);
            estimatedCost = costCalculation.totalCost;
          }
        } catch (error) {
          console.error('Error estimating pages:', error);
        }
      }
      
      return {
        file,
        id: crypto.randomUUID(),
        status: 'pending' as const,
        progress: 0,
        estimatedCost
      };
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [extractionMethod]);

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
    maxSize: 50 * 1024 * 1024,
    multiple: true
  });

  const processFile = async (fileData: UploadedFile) => {
    console.log(`Starting file processing for: ${fileData.file.name} with ${extractionMethod} method`);
    
    // Check wallet balance for AI extraction
    if (extractionMethod === 'ai' && fileData.estimatedCost && fileData.estimatedCost > 0) {
      const walletCheck = monetizationService.checkWalletBalance(user, fileData.estimatedCost);
      if (!walletCheck.canProceed) {
        toast({
          title: "Insufficient Funds",
          description: walletCheck.message,
          variant: "destructive"
        });
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: walletCheck.message }
            : f
        ));
        return;
      }
      
      // Deduct cost from wallet
      const deductionSuccess = await monetizationService.deductFromWallet(
        user, 
        fileData.estimatedCost, 
        updateWallet
      );
      
      if (!deductionSuccess) {
        toast({
          title: "Payment Failed",
          description: "Unable to process payment. Please try again.",
          variant: "destructive"
        });
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: 'Payment processing failed' }
            : f
        ));
        return;
      }
      
      toast({
        title: "Payment Processed",
        description: `$${fileData.estimatedCost.toFixed(2)} deducted from wallet`,
      });
    }
    
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileData.id 
        ? { ...f, status: 'processing', progress: 10 }
        : f
    ));

    try {
      let extractedData;
      
      if (extractionMethod === 'ai' && fileData.file.type === 'application/pdf') {
        // Set extraction settings for Gemini
        geminiPdfExtractor.setExtractionSettings(extractionSettings);
        
        // Setup progress tracking
        const startTime = Date.now();
        setCurrentExtractionProgress({
          currentPage: 0,
          totalPages: 0,
          currentFile: fileData.file.name,
          stage: 'analyzing',
          processingTime: 0
        });
        
        const progressInterval = setInterval(() => {
          setCurrentExtractionProgress(prev => prev ? {
            ...prev,
            processingTime: Math.floor((Date.now() - startTime) / 1000)
          } : null);
        }, 1000);
        
        const onProgress = (page: number, total: number, stage: string) => {
          setCurrentExtractionProgress({
            currentPage: page,
            totalPages: total,
            currentFile: fileData.file.name,
            stage: stage as any,
            processingTime: Math.floor((Date.now() - startTime) / 1000)
          });
          
          // Update file progress
          const progress = total > 0 ? Math.min((page / total) * 90, 90) : 10;
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress }
              : f
          ));
        };
        
        try {
          const result = await geminiPdfExtractor.extractWithGemini(fileData.file, onProgress);
          extractedData = {
            text: result.text,
            metadata: {
              title: fileData.file.name.split('.')[0],
              pages: result.metadata.totalPages,
              wordCount: result.text.split(/\s+/).filter(word => word.length > 0).length,
              fileSize: (fileData.file.size / 1024 / 1024).toFixed(2) + ' MB',
              lastModified: new Date(fileData.file.lastModified)
            }
          };
        } finally {
          clearInterval(progressInterval);
          setCurrentExtractionProgress(null);
        }
      } else {
        // Use traditional extraction (free)
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id && f.progress < 90 && f.status === 'processing'
              ? { ...f, progress: Math.min(f.progress + 15, 90) }
              : f
          ));
        }, 1000);
        
        extractedData = await fileExtractor.extractFromFile(fileData.file, extractionMethod);
        clearInterval(progressInterval);
      }
      
      console.log(`Extraction completed for ${fileData.file.name}:`, {
        textLength: extractedData.text?.length,
        metadata: extractedData.metadata
      });
      
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
      setCurrentExtractionProgress(null);
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
    
    // Check total wallet balance for AI extraction
    if (extractionMethod === 'ai') {
      const totalCost = pendingFiles.reduce((sum, file) => sum + (file.estimatedCost || 0), 0);
      
      if (totalCost > 0) {
        const walletCheck = monetizationService.checkWalletBalance(user, totalCost);
        if (!walletCheck.canProceed) {
          toast({
            title: "Insufficient Funds",
            description: `Total cost: $${totalCost.toFixed(2)}. ${walletCheck.message}`,
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
      }
    }
    
    console.log(`Processing ${pendingFiles.length} files with ${extractionMethod} method...`);
    
    try {
      for (const fileData of pendingFiles) {
        await processFile(fileData);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
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
      const totalPages = completedFiles.reduce((sum, f) => sum + (f.metadata?.pages || 1), 0);
      
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
        totalChunks: Math.ceil(totalWords / 1000),
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

  const totalEstimatedCost = uploadedFiles
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + (f.estimatedCost || 0), 0);

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">📤 Upload Documents</h2>
        <p className="text-white/60 text-sm md:text-lg">
          Upload your documents and configure extraction settings
        </p>
      </div>

      {/* Wallet Balance Display */}
      {user && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-400" />
                <span className="text-white">Wallet Balance:</span>
                <span className="text-white font-bold">${user.walletBalance.toFixed(2)}</span>
              </div>
              {totalEstimatedCost > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">
                    Estimated Cost: ${totalEstimatedCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <ExtractionMethodSelector 
        method={extractionMethod}
        onMethodChange={setExtractionMethod}
        disabled={uploadedFiles.some(f => f.status === 'processing') || isProcessing}
      />

      {extractionMethod === 'ai' && uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'pending') && (
        <ExtractionSettings
          settings={extractionSettings}
          onSettingsChange={setExtractionSettings}
          disabled={isProcessing}
        />
      )}

      {currentExtractionProgress && (
        <ExtractionProgress
          currentPage={currentExtractionProgress.currentPage}
          totalPages={currentExtractionProgress.totalPages}
          currentFile={currentExtractionProgress.currentFile}
          stage={currentExtractionProgress.stage}
          processingTime={currentExtractionProgress.processingTime}
        />
      )}

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
              {extractionMethod === 'ai' && (
                <p className="text-yellow-300 text-xs mt-2">
                  💡 AI extraction costs $0.10 per page
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {uploadedFiles.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>Uploaded Files ({uploadedFiles.length})</span>
              <div className="flex gap-2">
                {uploadedFiles.some(f => f.status === 'pending') && (
                  <Button 
                    onClick={processAllFiles}
                    disabled={isProcessing || (totalEstimatedCost > 0 && (!user || user.walletBalance < totalEstimatedCost))}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 w-full sm:w-auto"
                  >
                    {isProcessing ? 'Processing...' : `Process All Files${totalEstimatedCost > 0 ? ` ($${totalEstimatedCost.toFixed(2)})` : ''}`}
                  </Button>
                )}
                {uploadedFiles.some(f => f.status === 'completed') && (
                  <Button 
                    onClick={() => {
                      const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
                      createProject(completedFiles);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 w-full sm:w-auto"
                  >
                    Create Project
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
                          {fileData.estimatedCost && fileData.estimatedCost > 0 && (
                            <span className="ml-2 text-yellow-300">
                              • Cost: ${fileData.estimatedCost.toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={`border-white/20 ${getStatusColor(fileData.status)}`}>
                        {fileData.status}
                      </Badge>
                      {fileData.extractedContent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowPreview(showPreview === fileData.id ? null : fileData.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
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
                  
                  {fileData.metadata && fileData.status === 'completed' && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">Extraction Results</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-white/60">Pages:</span>
                          <span className="text-white ml-2">{fileData.metadata.pages || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Words:</span>
                          <span className="text-white ml-2">{fileData.metadata.wordCount?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Size:</span>
                          <span className="text-white ml-2">{fileData.metadata.fileSize}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Method:</span>
                          <span className="text-white ml-2 capitalize">{extractionMethod}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPreview === fileData.id && fileData.extractedContent && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/80 text-sm mb-2">Content Preview:</p>
                      <div className="max-h-32 overflow-y-auto text-white/60 text-sm bg-black/20 p-2 rounded border">
                        {fileData.extractedContent.substring(0, 500)}
                        {fileData.extractedContent.length > 500 && '...'}
                      </div>
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
