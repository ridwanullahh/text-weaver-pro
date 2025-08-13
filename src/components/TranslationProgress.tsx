import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TranslationProject } from '../types/translation';
import { translationService } from '../services/translationService';
import { Play, Pause, RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TranslationProgressProps {
  project: TranslationProject;
}

const TranslationProgress: React.FC<TranslationProgressProps> = ({ project }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(project.progress || 0);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [tokensUsed, setTokensUsed] = useState(0);

  const startTranslation = async () => {
    if (project.targetLanguages.length === 0) {
      alert('Please select at least one target language');
      return;
    }

    setIsTranslating(true);

    try {
      await translationService.startTranslation(project, {
        onProgress: (progressData) => {
          setProgress(progressData.percentage);
          setCurrentLanguage(progressData.currentLanguage);
          setEstimatedTime(progressData.estimatedTimeRemaining);
          setTokensUsed(progressData.tokensUsed);
        },
        onComplete: () => {
          setIsTranslating(false);
          setProgress(100);
        },
        onError: (error) => {
          setIsTranslating(false);
          console.error('Translation error:', error);
          alert(`Translation failed: ${error.message}`);
        }
      });
    } catch (error) {
      setIsTranslating(false);
      console.error('Translation start error:', error);
    }
  };

  const pauseTranslation = async () => {
    await translationService.pauseTranslation(project.id);
    setIsTranslating(false);
  };

  const resetTranslation = async () => {
    await translationService.resetTranslation(project.id);
    setProgress(0);
    setCurrentLanguage('');
    setEstimatedTime(0);
    setTokensUsed(0);
  };

  const getStatusIcon = () => {
    if (project.status === 'completed') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (project.status === 'error') return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (isTranslating) return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
    return <Play className="w-5 h-5 text-white/60" />;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Translation Progress
          </div>
          <Badge className={`${
            project.status === 'completed' ? 'bg-green-500/20 text-green-300' :
            project.status === 'error' ? 'bg-red-500/20 text-red-300' :
            'bg-blue-500/20 text-blue-300'
          }`}>
            {project.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white/60">Total Pages</div>
            <div className="text-lg font-semibold text-white">{project.totalChunks}</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white/60">Completed</div>
            <div className="text-lg font-semibold text-white">{project.completedChunks}</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white/60">Languages</div>
            <div className="text-lg font-semibold text-white">{project.targetLanguages.length}</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white/60">Word Count</div>
            <div className="text-lg font-semibold text-white">
              {project.originalContent?.split(/\s+/).length || 0}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          {currentLanguage && (
            <p className="text-xs text-white/60 mt-2">
              Currently translating to: {currentLanguage}
            </p>
          )}
        </div>

        {/* Stats during translation */}
        {isTranslating && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="text-blue-300">Time Remaining</div>
              <div className="text-white font-medium">{formatTime(estimatedTime)}</div>
            </div>
            <div className="text-center p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="text-blue-300">Tokens Used</div>
              <div className="text-white font-medium">{tokensUsed.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isTranslating ? (
            <Button
              onClick={startTranslation}
              disabled={project.targetLanguages.length === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Play className="w-4 h-4 mr-2" />
              {progress > 0 ? 'Resume Translation' : 'Start Translation'}
            </Button>
          ) : (
            <Button
              onClick={pauseTranslation}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Translation
            </Button>
          )}
          
          <Button
            onClick={resetTranslation}
            disabled={isTranslating}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {project.targetLanguages.length === 0 && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ Please select target languages before starting translation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationProgress;
