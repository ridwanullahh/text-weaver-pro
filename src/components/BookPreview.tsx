
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, User, Calendar, Hash } from 'lucide-react';
import { TranslationProject } from '../types/translation';

interface BookPreviewProps {
  project: TranslationProject;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
  };
}

const BookPreview: React.FC<BookPreviewProps> = ({ project, metadata }) => {
  const formatWordCount = (count: number) => {
    if (count > 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-3xl p-6"
    >
      <div className="flex items-start gap-6">
        {/* Book Cover Mockup */}
        <div className="flex-shrink-0">
          <div className="w-32 h-40 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <BookOpen className="w-12 h-12 text-white/80" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-white text-xs font-medium truncate">
                {metadata?.title || project.name}
              </div>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {metadata?.title || project.name}
            </h3>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{project.fileType.toUpperCase()}</span>
              </div>
              {metadata?.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{metadata.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metadata?.pages && (
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <div className="text-white/60 text-xs font-medium mb-1">Pages</div>
                <div className="text-white text-lg font-bold">{metadata.pages}</div>
              </div>
            )}
            
            {metadata?.wordCount && (
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <div className="text-white/60 text-xs font-medium mb-1">Words</div>
                <div className="text-white text-lg font-bold">
                  {formatWordCount(metadata.wordCount)}
                </div>
              </div>
            )}
            
            <div className="bg-white/10 rounded-xl p-3 border border-white/20">
              <div className="text-white/60 text-xs font-medium mb-1">Chunks</div>
              <div className="text-white text-lg font-bold">{project.totalChunks}</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-3 border border-white/20">
              <div className="text-white/60 text-xs font-medium mb-1">Languages</div>
              <div className="text-white text-lg font-bold">{project.targetLanguages.length}</div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white/80 text-sm font-medium mb-2">Content Preview</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {project.originalContent.substring(0, 300)}
              {project.originalContent.length > 300 && '...'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookPreview;
