
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, File, BookOpen, Globe } from 'lucide-react';
import { TranslationProject, ExportFormat } from '../types/translation';
import { exportService } from '../services/exportService';
import { toast } from '@/hooks/use-toast';

interface ExportPanelProps {
  project: TranslationProject;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    type: 'pdf',
    name: 'PDF Document',
    icon: '📄',
    description: 'Professional document with preserved formatting'
  },
  {
    type: 'docx',
    name: 'Word Document',
    icon: '📝',
    description: 'Microsoft Word compatible document'
  },
  {
    type: 'epub',
    name: 'EPUB eBook',
    icon: '📚',
    description: 'Digital book format for e-readers'
  },
  {
    type: 'txt',
    name: 'Plain Text',
    icon: '📃',
    description: 'Simple text file without formatting'
  },
  {
    type: 'html',
    name: 'Web Page',
    icon: '🌐',
    description: 'HTML file for web viewing'
  }
];

const ExportPanel: React.FC<ExportPanelProps> = ({ project }) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode) 
        ? prev.filter(lang => lang !== languageCode)
        : [...prev, languageCode]
    );
  };

  const handleSelectAllLanguages = () => {
    if (selectedLanguages.length === project.targetLanguages.length) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([...project.targetLanguages]);
    }
  };

  const handleExport = async () => {
    if (!selectedFormat || selectedLanguages.length === 0) {
      toast({
        title: "Export Configuration Required",
        description: "Please select export format and at least one language.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      await exportService.exportProject(project, selectedLanguages, selectedFormat, {
        onProgress: (progress) => {
          setExportProgress(progress);
        }
      });

      toast({
        title: "Export Complete",
        description: `Your translations have been exported as ${selectedFormat.name}.`,
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

  const canExport = project.status === 'completed' && project.targetLanguages.length > 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Download className="w-6 h-6 text-green-400" />
          Export Translations
        </h3>
        
        {!canExport && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-2">
            <span className="text-yellow-200 text-sm">
              Complete translation to enable export
            </span>
          </div>
        )}
      </div>

      {canExport ? (
        <div className="space-y-8">
          {/* Language Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Select Languages</h4>
              <motion.button
                onClick={handleSelectAllLanguages}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedLanguages.length === project.targetLanguages.length ? 'Deselect All' : 'Select All'}
              </motion.button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {project.targetLanguages.map((langCode) => (
                <motion.button
                  key={langCode}
                  onClick={() => handleLanguageToggle(langCode)}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    selectedLanguages.includes(langCode)
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-medium">{langCode.toUpperCase()}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Export Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXPORT_FORMATS.map((format) => (
                <motion.button
                  key={format.type}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                    selectedFormat?.type === format.type
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{format.icon}</span>
                    <span className="text-white font-medium">{format.name}</span>
                  </div>
                  <p className="text-white/60 text-sm">{format.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Exporting...</span>
                <span className="text-white/80">{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Export Button */}
          <div className="text-center">
            <motion.button
              onClick={handleExport}
              disabled={isExporting || selectedLanguages.length === 0 || !selectedFormat}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExporting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Exporting...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  Export {selectedLanguages.length} Language{selectedLanguages.length !== 1 ? 's' : ''}
                </div>
              )}
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">
            Complete the translation process to export your files
          </p>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
