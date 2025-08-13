
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bot, FileText, Zap, CheckCircle, Clock } from 'lucide-react';

interface ExtractionProgressProps {
  currentPage: number;
  totalPages: number;
  currentFile: string;
  stage: 'analyzing' | 'extracting' | 'processing' | 'completed';
  processingTime: number;
}

const ExtractionProgress: React.FC<ExtractionProgressProps> = ({
  currentPage,
  totalPages,
  currentFile,
  stage,
  processingTime
}) => {
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  
  const getStageInfo = () => {
    switch (stage) {
      case 'analyzing':
        return {
          icon: <Bot className="w-5 h-5 text-blue-400 animate-pulse" />,
          title: 'Analyzing Document Structure',
          description: 'AI is understanding the document layout and content structure...'
        };
      case 'extracting':
        return {
          icon: <FileText className="w-5 h-5 text-blue-400 animate-bounce" />,
          title: 'Extracting Content',
          description: `Processing page ${currentPage} of ${totalPages}...`
        };
      case 'processing':
        return {
          icon: <Zap className="w-5 h-5 text-yellow-400 animate-spin" />,
          title: 'Processing & Cleaning',
          description: 'Applying intelligent filters and formatting...'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          title: 'Extraction Complete',
          description: 'Content has been successfully extracted and processed!'
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {stageInfo.icon}
            <div>
              <h3 className="text-white font-medium">{stageInfo.title}</h3>
              <p className="text-white/60 text-sm">{stageInfo.description}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Current File:</span>
              <p className="text-white truncate">{currentFile}</p>
            </div>
            <div>
              <span className="text-white/60">Processing Time:</span>
              <p className="text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(processingTime / 60)}:{(processingTime % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          
          {stage === 'extracting' && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                <Bot className="w-3 h-3 inline mr-1" />
                AI is carefully analyzing each page to extract only the main content while filtering out headers, footers, and other distractions.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractionProgress;
