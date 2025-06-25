
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, File, BookOpen, Code, Loader2 } from 'lucide-react';
import { TranslationProject, ExportFormat } from '../types/translation';
import { exportService } from '../services/exportService';
import { toast } from '@/hooks/use-toast';

interface ExportPanelProps {
  project: TranslationProject;
}

const exportFormats: ExportFormat[] = [
  {
    type: 'txt',
    name: 'Plain Text',
    icon: 'FileText',
    description: 'Simple text file format'
  },
  {
    type: 'html',
    name: 'HTML',
    icon: 'Code',
    description: 'Web-formatted document'
  },
  {
    type: 'pdf',
    name: 'PDF',
    icon: 'File',
    description: 'Portable document format'
  },
  {
    type: 'docx',
    name: 'Word Document',
    icon: 'FileText',
    description: 'Microsoft Word format'
  },
  {
    type: 'epub',
    name: 'EPUB',
    icon: 'BookOpen',
    description: 'Electronic book format'
  }
];

const ExportPanel: React.FC<ExportPanelProps> = ({ project }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(exportFormats[0]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  const handleSelectAll = () => {
    setSelectedLanguages([...project.targetLanguages]);
  };

  const handleDeselectAll = () => {
    setSelectedLanguages([]);
  };

  const handleExport = async () => {
    if (selectedLanguages.length === 0) {
      toast({
        title: "No Languages Selected",
        description: "Please select at least one language to export.",
        variant: "destructive"
      });
      return;
    }

    if (project.status !== 'completed') {
      toast({
        title: "Translation Incomplete",
        description: "Please complete the translation before exporting.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      await exportService.exportProject(
        project,
        selectedLanguages,
        selectedFormat,
        {
          onProgress: (progress) => {
            setExportProgress(progress);
          }
        }
      );

      toast({
        title: "Export Complete",
        description: `Your translated files have been downloaded successfully!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export translations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return FileText;
      case 'Code': return Code;
      case 'File': return File;
      case 'BookOpen': return BookOpen;
      default: return FileText;
    }
  };

  const getLanguageInfo = (code: string) => {
    const languages: Record<string, { name: string; flag: string }> = {
      'en': { name: 'English', flag: '🇺🇸' },
      'es': { name: 'Spanish', flag: '🇪🇸' },
      'fr': { name: 'French', flag: '🇫🇷' },
      'de': { name: 'German', flag: '🇩🇪' },
      'it': { name: 'Italian', flag: '🇮🇹' },
      'pt': { name: 'Portuguese', flag: '🇵🇹' },
      'ru': { name: 'Russian', flag: '🇷🇺' },
      'ja': { name: 'Japanese', flag: '🇯🇵' },
      'ko': { name: 'Korean', flag: '🇰🇷' },
      'zh': { name: 'Chinese', flag: '🇨🇳' },
      'ar': { name: 'Arabic', flag: '🇸🇦' },
      'hi': { name: 'Hindi', flag: '🇮🇳' },
    };
    return languages[code] || { name: code.toUpperCase(), flag: '🌐' };
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Download className="w-6 h-6 text-green-400" />
        Export Translations
      </h3>

      {project.status !== 'completed' && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
          <p className="text-yellow-200 text-center">
            Translation must be completed before exporting
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Format Selection */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Export Format</h4>
          <div className="space-y-3">
            {exportFormats.map((format) => {
              const IconComponent = getIconComponent(format.icon);
              return (
                <motion.button
                  key={format.type}
                  onClick={() => setSelectedFormat(format)}
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                    selectedFormat.type === format.type
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-6 h-6 text-purple-400" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{format.name}</p>
                    <p className="text-white/60 text-sm">{format.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Select Languages</h4>
            <div className="flex gap-2">
              <motion.button
                onClick={handleSelectAll}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select All
              </motion.button>
              <span className="text-white/40">|</span>
              <motion.button
                onClick={handleDeselectAll}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Deselect All
              </motion.button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {project.targetLanguages.map((langCode) => {
              const lang = getLanguageInfo(langCode);
              const isSelected = selectedLanguages.includes(langCode);
              
              return (
                <motion.button
                  key={langCode}
                  onClick={() => handleLanguageToggle(langCode)}
                  className={`w-full p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-white font-medium">{lang.name}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Exporting...</span>
            <span className="text-white/80">{Math.round(exportProgress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${exportProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      {/* Export Button */}
      <div className="mt-8 text-center">
        <motion.button
          onClick={handleExport}
          disabled={isExporting || selectedLanguages.length === 0 || project.status !== 'completed'}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export {selectedLanguages.length} Language{selectedLanguages.length !== 1 ? 's' : ''}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ExportPanel;
