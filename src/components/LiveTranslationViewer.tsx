import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Languages, CheckCircle, AlertCircle, Loader2, Maximize2, X } from 'lucide-react';
import { TranslationProject, TranslationChunk } from '../types/translation';
import { dbUtils } from '../utils/database';
import { translationService } from '../services/translationService';

interface LiveTranslationViewerProps {
  project: TranslationProject;
  isActive: boolean;
}

const LiveTranslationViewer: React.FC<LiveTranslationViewerProps> = ({ project, isActive }) => {
  const [chunks, setChunks] = useState<TranslationChunk[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(project.targetLanguages[0] || '');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedChunk, setSelectedChunk] = useState<TranslationChunk | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!isActive) return;

    const loadChunks = async () => {
      const projectChunks = await dbUtils.getProjectChunks(project.id);
      setChunks(projectChunks);
      
      // Get current chunk index from translation service
      const currentIndex = translationService.getCurrentChunkIndex(project.id);
      setCurrentChunkIndex(currentIndex);
    };

    loadChunks();

    // Poll for updates every 2 seconds when translation is active
    const interval = setInterval(loadChunks, 2000);
    return () => clearInterval(interval);
  }, [project.id, isActive]);

  // Auto-scroll to current chunk
  useEffect(() => {
    if (autoScroll && chunks.length > 0 && currentChunkIndex < chunks.length) {
      const currentChunkElement = chunkRefs.current[currentChunkIndex];
      if (currentChunkElement && containerRef.current) {
        currentChunkElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentChunkIndex, autoScroll, chunks.length]);

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

  const getStatusColor = (status: string, isCurrentChunk: boolean) => {
    if (isCurrentChunk && status === 'processing') {
      return 'border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/30';
    }
    
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'processing':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const handleViewChunk = (chunk: TranslationChunk) => {
    setSelectedChunk(chunk);
  };

  const closeChunkViewer = () => {
    setSelectedChunk(null);
  };

  if (!isActive) return null;

  return (
    <>
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

        <div 
          ref={containerRef}
          className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          <AnimatePresence>
            {chunks.map((chunk, index) => {
              const status = getChunkStatus(chunk, selectedLanguage);
              const translation = chunk.translations[selectedLanguage];
              const isCurrentChunk = index === currentChunkIndex;
              
              return (
                <motion.div
                  key={chunk.id}
                  ref={(el) => { chunkRefs.current[index] = el; }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-2xl p-4 transition-all duration-300 ${getStatusColor(status, isCurrentChunk)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className={`text-sm font-medium ${
                        isCurrentChunk ? 'text-blue-300' : 'text-white/80'
                      }`}>
                        Chunk {index + 1}
                        {isCurrentChunk && status === 'processing' && (
                          <span className="ml-2 text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleViewChunk(chunk)}
                        className="text-white/60 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </motion.button>
                      <Languages className="w-4 h-4 text-white/60" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white/60 text-xs font-medium mb-2">Original</h4>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {chunk.originalText.substring(0, 150)}
                        {chunk.originalText.length > 150 && '...'}
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
                          {translation.substring(0, 150)}
                          {translation.length > 150 && '...'}
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

      {/* Full Chunk Viewer Modal */}
      <AnimatePresence>
        {selectedChunk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeChunkViewer}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-6 h-6 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white">
                    Chunk {chunks.findIndex(c => c.id === selectedChunk.id) + 1} Details
                  </h3>
                  {getStatusIcon(getChunkStatus(selectedChunk, selectedLanguage))}
                </div>
                <motion.button
                  onClick={closeChunkViewer}
                  className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Original Text
                  </h4>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                      {selectedChunk.originalText}
                    </p>
                  </div>
                </div>

                {project.targetLanguages.map(language => {
                  const translation = selectedChunk.translations[language];
                  const status = getChunkStatus(selectedChunk, language);
                  
                  return (
                    <div key={language}>
                      <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'completed' ? 'bg-green-400' : 
                          status === 'processing' ? 'bg-blue-400' : 'bg-gray-400'
                        }`}></span>
                        Translation ({language.toUpperCase()})
                        {status === 'processing' && (
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin ml-2" />
                        )}
                      </h4>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        {translation ? (
                          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                            {translation}
                          </p>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-white/50 py-8">
                            {status === 'processing' ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Translating...
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5" />
                                Translation pending...
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveTranslationViewer;
