
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Languages, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { TranslationProject, TranslationChunk } from '../types/translation';
import { dbUtils } from '../utils/database';

interface LiveTranslationViewerProps {
  project: TranslationProject;
  isActive: boolean;
}

const LiveTranslationViewer: React.FC<LiveTranslationViewerProps> = ({ project, isActive }) => {
  const [chunks, setChunks] = useState<TranslationChunk[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(project.targetLanguages[0] || '');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const loadChunks = async () => {
      const projectChunks = await dbUtils.getProjectChunks(project.id!);
      setChunks(projectChunks);
    };

    loadChunks();

    // Poll for updates every 2 seconds when translation is active
    const interval = setInterval(loadChunks, 2000);
    return () => clearInterval(interval);
  }, [project.id, isActive]);

  const getChunkStatus = (chunk: TranslationChunk, language: string) => {
    if (chunk.translations[language]) return 'completed';
    if (chunk.status === 'processing') return 'processing';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'processing':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">Live Translation View</h3>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {project.targetLanguages.map(lang => (
              <option key={lang} value={lang} className="bg-gray-800 text-white">
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
          
          <motion.button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              autoScroll ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Auto Scroll
          </motion.button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {chunks.map((chunk, index) => {
            const status = getChunkStatus(chunk, selectedLanguage);
            const translation = chunk.translations[selectedLanguage];
            
            return (
              <motion.div
                key={chunk.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-2xl p-4 ${getStatusColor(status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-white/80 text-sm font-medium">
                      Chunk {index + 1}
                    </span>
                  </div>
                  <Languages className="w-4 h-4 text-white/60" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white/60 text-xs font-medium mb-2">Original</h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {chunk.originalText.substring(0, 200)}
                      {chunk.originalText.length > 200 && '...'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-white/60 text-xs font-medium mb-2">
                      Translation ({selectedLanguage.toUpperCase()})
                    </h4>
                    {translation ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/90 text-sm leading-relaxed"
                      >
                        {translation.substring(0, 200)}
                        {translation.length > 200 && '...'}
                      </motion.p>
                    ) : (
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        {status === 'processing' ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          'Pending...'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LiveTranslationViewer;
