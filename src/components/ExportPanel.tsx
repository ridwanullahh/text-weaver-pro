import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TranslationProject } from '../types/translation';
import { exportService } from '../services/exportService';
import { Download, FileText, Globe } from 'lucide-react';

interface ExportPanelProps {
  project: TranslationProject;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ project }) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'txt' | 'html' | 'pdf' | 'docx'>('txt');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  const handleExport = async () => {
    if (selectedLanguages.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const formatConfig = {
        type: exportFormat,
        name: exportFormat.toUpperCase(),
        icon: 'file',
        description: `Export as ${exportFormat.toUpperCase()}`
      };

      await exportService.exportProject(
        project,
        selectedLanguages,
        formatConfig,
        {
          onProgress: (progress) => setExportProgress(progress)
        }
      );
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi'
    };
    return languages[code] || code.toUpperCase();
  };

  if (project.targetLanguages.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8 text-center">
          <Globe className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Translations Available</h3>
          <p className="text-white/60">
            Complete translations to enable export functionality
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Translations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Select Languages to Export
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {project.targetLanguages.map(language => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={language}
                  checked={selectedLanguages.includes(language)}
                  onCheckedChange={() => handleLanguageToggle(language)}
                  className="border-white/30"
                />
                <label 
                  htmlFor={language}
                  className="text-white/80 text-sm cursor-pointer"
                >
                  {getLanguageName(language)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Export Format
          </label>
          <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="txt">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Plain Text (.txt)
                </div>
              </SelectItem>
              <SelectItem value="html">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  HTML Document (.html)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Document (.pdf)
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Word Document (.docx)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div>
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={selectedLanguages.length === 0 || isExporting}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? `Exporting... ${exportProgress}%` : `Export ${selectedLanguages.length} Language${selectedLanguages.length !== 1 ? 's' : ''}`}
        </Button>

        {selectedLanguages.length === 0 && (
          <p className="text-yellow-400 text-sm text-center">
            Select at least one language to export
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
