
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { TranslationProject } from '../types/translation';
import { translationService } from '../services/translationService';
import { dbUtils } from '../utils/database';
import { toast } from '@/hooks/use-toast';

interface TranslationProgressProps {
  project: TranslationProject;
}

const TranslationProgress: React.FC<TranslationProgressProps> = ({ project }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(project.progress);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);

  useEffect(() => {
    setCurrentProgress(project.progress);
  }, [project.progress]);

  const handleStartTranslation = async () => {
    if (project.targetLanguages.length === 0) {
      toast({
        title: "No Target Languages",
        description: "Please select at least one target language before starting translation.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      await translationService.startTranslation(project, {
        onProgress: (progress) => {
          setCurrentProgress(progress.percentage);
          setCurrentLanguage(progress.currentLanguage);
          setEstimatedTime(progress.estimatedTimeRemaining);
          setTokensUsed(progress.tokensUsed);
        },
        onComplete: () => {
          setIsTranslating(false);
          toast({
            title: "Translation Complete",
            description: "Your project has been translated successfully!",
          });
        },
        onError: (error) => {
          setIsTranslating(false);
          toast({
            title: "Translation Error",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      setIsTranslating(false);
      console.error('Translation error:', error);
      toast({
        title: "Error",
        description: "Failed to start translation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePauseTranslation = async () => {
    await translationService.pauseTranslation(project.id!);
    setIsTranslating(false);
    
    toast({
      title: "Translation Paused",
      description: "Translation has been paused. You can resume it anytime.",
    });
  };

  const handleResetTranslation = async () => {
    await translationService.resetTranslation(project.id!);
    setCurrentProgress(0);
    setCurrentLanguage('');
    setEstimatedTime(0);
    setTokensUsed(0);
    
    toast({
      title: "Translation Reset",
      description: "Translation progress has been reset.",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-purple-400" />
          Translation Progress
        </h3>
        
        <div className="flex items-center gap-3">
          {project.status === 'completed' ? (
            <motion.button
              onClick={handleResetTranslation}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
          ) : (
            <>
              {!isTranslating ? (
                <motion.button
                  onClick={handleStartTranslation}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4" />
                  {project.progress > 0 ? 'Resume' : 'Start'} Translation
                </motion.button>
              ) : (
                <motion.button
                  onClick={handlePauseTranslation}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-white/80 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(currentProgress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white/80 text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {project.completedChunks}/{project.totalChunks}
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 text-sm">Est. Time</span>
          </div>
          <p className="text-xl font-bold text-white">
            {estimatedTime > 0 ? formatTime(estimatedTime) : '--'}
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-white/80 text-sm">Languages</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {project.targetLanguages.length}
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <span className="text-white/80 text-sm">Tokens</span>
          </div>
          <p className="text-xl font-bold text-white">
            {tokensUsed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Current Status */}
      {isTranslating && currentLanguage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">
                Currently translating to {currentLanguage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-white/80 text-sm">Processing...</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TranslationProgress;
