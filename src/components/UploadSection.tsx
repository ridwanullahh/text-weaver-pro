
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { monetizationService } from '@/services/monetizationService';
import ExtractionSettings from './ExtractionSettings';
import ExtractionProgress from './ExtractionProgress';
import ExtractionMethodSelector from './ExtractionMethodSelector';
import { Upload, FileText, Zap, AlertCircle, Wallet, Plus, Sparkles } from 'lucide-react';
import { geminiPdfExtractor } from '@/services/geminiPdfExtractor';
import { fileExtractor } from '@/services/fileExtractor';

interface UploadSectionProps {
  onFilesProcessed: (files: Array<{ name: string; content: string; size: number }>) => void;
  disabled?: boolean;
  extractionMethod: 'traditional' | 'ai';
  onExtractionMethodChange?: (method: 'traditional' | 'ai') => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ 
  onFilesProcessed, 
  disabled = false,
  extractionMethod,
  onExtractionMethodChange
}) => {
  const { toast } = useToast();
  const { user, updateWallet } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingStage, setProcessingStage] = useState<'analyzing' | 'extracting' | 'processing' | 'completed'>('analyzing');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [processingTime, setProcessingTime] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [extractionSettings, setExtractionSettings] = useState({
    ignoreHeaders: true,
    ignoreFooters: true,
    ignorePageNumbers: true,
    ignoreFootnotes: false,
    maintainFormatting: true,
    separatePages: true
  });

  // Configure PDF.js worker on component mount
  React.useEffect(() => {
    const setupPdfWorker = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          console.log('PDF.js worker configured successfully');
        }
      } catch (error) {
        console.error('Error setting up PDF.js worker:', error);
      }
    };

    setupPdfWorker();
  }, []);

  // Update processing time every second when processing
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, startTime]);

  const calculateTotalPages = async (files: File[]): Promise<number> => {
    let totalPages = 0;
    
    for (const file of files) {
      if (file.type === 'application/pdf') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          
          // Ensure worker is configured
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          }
          
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          totalPages += pdf.numPages;
          console.log(`PDF ${file.name} has ${pdf.numPages} pages`);
        } catch (error) {
          console.error(`Error counting pages in ${file.name}:`, error);
          // Estimate 1 page for error cases
          totalPages += 1;
        }
      } else {
        // Estimate 1 page for non-PDF files
        totalPages += 1;
      }
    }
    
    return totalPages;
  };

  const updateEstimatedCost = async (files: File[]) => {
    if (!user || extractionMethod === 'traditional') {
      setEstimatedCost(0);
      return;
    }

    try {
      const totalPages = await calculateTotalPages(files);
      const costCalculation = monetizationService.calculateExtractionCost(totalPages);
      setEstimatedCost(costCalculation.totalCost);
    } catch (error) {
      console.error('Error calculating cost:', error);
      setEstimatedCost(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'application/epub+zip',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.txt');
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were rejected. Please upload PDF, DOCX, DOC, TXT, EPUB, XLS, XLSX, or CSV files only.",
        variant: "destructive"
      });
    }

    setFiles(validFiles);
    await updateEstimatedCost(validFiles);
  }, [user, extractionMethod, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'application/epub+zip': ['.epub'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    disabled: disabled || isProcessing
  });

  const processFiles = async () => {
    if (files.length === 0) return;

    console.log(`Starting file processing using ${extractionMethod} method...`);

    // Check monetization for AI extraction only
    if (extractionMethod === 'ai' && user) {
      const totalPages = await calculateTotalPages(files);
      const costCalculation = monetizationService.calculateExtractionCost(totalPages);
      
      const balanceCheck = monetizationService.checkWalletBalance(user, costCalculation.totalCost);
      if (!balanceCheck.canProceed) {
        toast({
          title: "Insufficient Funds",
          description: balanceCheck.message,
          variant: "destructive"
        });
        return;
      }

      // Deduct cost upfront for AI extraction
      const deductionSuccess = await monetizationService.deductFromWallet(
        user, 
        costCalculation.totalCost, 
        updateWallet
      );

      if (!deductionSuccess) {
        toast({
          title: "Payment Failed",
          description: "Failed to process payment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Payment Successful",
        description: `$${costCalculation.totalCost.toFixed(2)} deducted for AI extraction of ${totalPages} pages.`,
      });
    }

    setIsProcessing(true);
    setProgress(0);
    setStartTime(new Date());
    setProcessingTime(0);
    setProcessingStage('analyzing');
    
    const processedFiles: Array<{ name: string; content: string; size: number }> = [];
    
    try {
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        setProgress((i / totalFiles) * 100);
        
        console.log(`Processing file ${i + 1}/${totalFiles}: ${file.name} using ${extractionMethod} method`);
        
        try {
          let extractedContent = '';
          
          if (extractionMethod === 'ai' && file.type === 'application/pdf') {
            console.log('Using AI extraction method...');
            // Configure extraction settings for AI
            geminiPdfExtractor.setExtractionSettings(extractionSettings);
            
            // Use AI extraction with progress callback
            const result = await geminiPdfExtractor.extractWithGemini(file, (page, total, stage) => {
              setCurrentPage(page);
              setTotalPages(total);
              setProcessingStage(stage as any);
              
              // Update overall progress considering current file
              const fileProgress = total > 0 ? (page / total) * 100 : 0;
              const overallProgress = ((i / totalFiles) * 100) + (fileProgress / totalFiles);
              setProgress(Math.min(overallProgress, 100));
            });
            
            extractedContent = result.text;
          } else {
            console.log('Using traditional extraction method...');
            // Use traditional extraction
            setProcessingStage('extracting');
            const result = await fileExtractor.extractFromFile(file);
            extractedContent = result.text;
          }
          
          if (extractedContent.trim()) {
            processedFiles.push({
              name: file.name,
              content: extractedContent,
              size: file.size
            });
            console.log(`Successfully extracted content from ${file.name}: ${extractedContent.length} characters`);
          } else {
            console.warn(`No content extracted from ${file.name}`);
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
      
      setProcessingStage('completed');
      setProgress(100);
      
      if (processedFiles.length > 0) {
        onFilesProcessed(processedFiles);
        toast({
          title: "Files Processed Successfully",
          description: `${processedFiles.length} file(s) processed using ${extractionMethod} extraction.`,
        });
      } else {
        toast({
          title: "No Content Extracted",
          description: "No readable content was found in the uploaded files.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentFile('');
      setCurrentPage(0);
      setTotalPages(0);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    updateEstimatedCost(newFiles);
  };

  const canProcess = files.length > 0 && !disabled && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Extraction Method Selector */}
      {onExtractionMethodChange && (
        <ExtractionMethodSelector
          method={extractionMethod}
          onMethodChange={onExtractionMethodChange}
          disabled={isProcessing}
        />
      )}

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${isDragActive 
                ? 'border-blue-400 bg-blue-500/10' 
                : 'border-white/30 hover:border-white/50'
              }
              ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center mb-4">
              <Upload className="w-12 h-12 text-white/60 mr-2" />
              {extractionMethod === 'ai' && <Sparkles className="w-6 h-6 text-blue-400" />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-white/60 text-sm">
              Drop files here or click to browse
              <br />
              <span className="text-xs">Supports: PDF, DOCX, DOC, TXT, EPUB, XLS, XLSX, CSV</span>
              <br />
              {extractionMethod === 'ai' ? (
                <span className="text-xs text-blue-300">✨ AI-powered extraction enabled</span>
              ) : (
                <span className="text-xs text-green-300">⚡ Fast traditional extraction enabled</span>
              )}
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                Selected Files:
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  {files.length} file{files.length > 1 ? 's' : ''}
                </span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-white text-sm font-medium">{file.name}</p>
                        <p className="text-white/50 text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      disabled={isProcessing}
                    >
                      ×
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Extraction Settings for AI */}
          {extractionMethod === 'ai' && files.length > 0 && (
            <div className="mt-6">
              <ExtractionSettings
                settings={extractionSettings}
                onSettingsChange={setExtractionSettings}
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Cost Display - Only for AI extraction */}
          {user && extractionMethod === 'ai' && files.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium">AI Extraction Cost</span>
                </div>
                <div className="text-right">
                  <div className="text-blue-300 font-bold">${estimatedCost.toFixed(2)}</div>
                  <div className="text-xs text-blue-400">
                    Balance: ${user.walletBalance.toFixed(2)}
                  </div>
                </div>
              </div>
              {user.walletBalance < estimatedCost && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Insufficient funds. Please add money to your wallet.</span>
                </div>
              )}
            </div>
          )}

          {/* Free Traditional Extraction Notice */}
          {extractionMethod === 'traditional' && files.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-green-300">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Traditional Extraction - Free & Fast!</span>
              </div>
              <p className="text-xs text-green-400 mt-1">
                No charges for traditional PDF extraction. Process multiple files quickly.
              </p>
            </div>
          )}

          {/* Processing Button */}
          {canProcess && (
            <div className="mt-6">
              <Button
                onClick={processFiles}
                className={`w-full ${
                  extractionMethod === 'ai' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                }`}
                size="lg"
                disabled={user && extractionMethod === 'ai' && user.walletBalance < estimatedCost}
              >
                {extractionMethod === 'ai' ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Process with AI Extraction
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Process with Traditional Extraction
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Display */}
      {isProcessing && (
        <ExtractionProgress
          currentPage={currentPage}
          totalPages={totalPages}
          currentFile={currentFile}
          stage={processingStage}
          processingTime={processingTime}
        />
      )}
    </div>
  );
};

export default UploadSection;
