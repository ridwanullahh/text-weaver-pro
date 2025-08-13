import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TranslationProject } from '../types/translation';
import { exportService } from '../services/exportService';
import { translationDB } from '../utils/database';
import { 
  Download, 
  FileText, 
  FileType, 
  Languages,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ExportPanelProps {
  project: TranslationProject;
  onExportComplete?: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ project, onExportComplete }) => {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf' | 'txt' | 'json'>('docx');
  const [includeOriginal, setIncludeOriginal] = useState(true);
  const [separateFiles, setSeparateFiles] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [availableTranslations, setAvailableTranslations] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    checkAvailableTranslations();
  }, [project.id]);

  const checkAvailableTranslations = async () => {
    if (!project.id) return;
    
    try {
      const chunks = await translationDB.chunks.where('projectId').equals(project.id).toArray();
      const translations: Record<string, boolean> = {};
      
      project.targetLanguages.forEach(lang => {
        const hasTranslations = chunks.some(chunk => 
          chunk.translations[lang] && chunk.translations[lang].trim().length > 0
        );
        translations[lang] = hasTranslations;
      });
      
      setAvailableTranslations(translations);
      
      // Auto-select languages that have translations
      const availableLangs = Object.keys(translations).filter(lang => translations[lang]);
      setSelectedLanguages(availableLangs);
    } catch (error) {
      console.error('Error checking available translations:', error);
    }
  };

  const toggleLanguageSelection = (language: string) => {
    if (!availableTranslations[language]) return; // Can't select if no translations
    
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  const selectAllLanguages = () => {
    const availableLangs = Object.keys(availableTranslations).filter(lang => availableTranslations[lang]);
    setSelectedLanguages(availableLangs);
  };

  const deselectAllLanguages = () => {
    setSelectedLanguages([]);
  };

  const handleExport = async () => {
    if (selectedLanguages.length === 0 && !includeOriginal) {
      toast({
        title: "Selection Required",
        description: "Please select at least one language to export or include the original text.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData: any = {};
      
      if (includeOriginal) {
        exportData[project.sourceLanguage || 'original'] = project.originalContent;
      }
      
      // Get translated content
      if (selectedLanguages.length > 0 && project.id) {
        const chunks = await translationDB.chunks.where('projectId').equals(project.id).toArray();
        
        selectedLanguages.forEach(language => {
          const translatedChunks = chunks
            .filter(chunk => chunk.translations[language])
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
            .map(chunk => chunk.translations[language]);
          
          if (translatedChunks.length > 0) {
            exportData[language] = translatedChunks.join('\n\n');
          }
        });
      }
      
      if (Object.keys(exportData).length === 0) {
        toast({
          title: "No Content to Export",
          description: "No translated content is available for the selected languages.",
          variant: "destructive"
        });
        return;
      }

      // Export based on format and options
      if (separateFiles) {
        // Export separate files for each language
        for (const [language, content] of Object.entries(exportData)) {
          const filename = `${project.name}_${language}`;
          await exportService.exportToFormat(content as string, exportFormat, filename);
        }
      } else {
        // Export combined file
        const combinedContent = Object.entries(exportData)
          .map(([lang, content]) => `=== ${lang.toUpperCase()} ===\n\n${content}`)
          .join('\n\n\n');
        
        await exportService.exportToFormat(combinedContent, exportFormat, project.name);
      }

      toast({
        title: "Export Successful! 📄",
        description: `Project exported as ${exportFormat.toUpperCase()} ${separateFiles ? 'files' : 'file'}.`,
      });

      onExportComplete?.();
      
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during export.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getLanguageName = (code: string) => {
    // You might want to import this from your language data
    const languageNames: Record<string, string> = {
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
      'hi': 'Hindi',
      'yo': 'Yoruba',
      // Add more as needed
    };
    return languageNames[code] || code.toUpperCase();
  };

  const hasAnyTranslations = Object.values(availableTranslations).some(Boolean);
  const availableLanguageCount = Object.values(availableTranslations).filter(Boolean).length;

  if (!hasAnyTranslations && project.status === 'completed') {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Translations Found</h3>
          <p className="text-white/60 mb-4">
            This project appears to be completed but no translation data was found. 
            This might happen if the project was created before the current system.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyTranslations) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6 text-center">
          <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Translations Available</h3>
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
        {/* Available translations status */}
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              {availableLanguageCount} of {project.targetLanguages.length} languages ready for export
            </span>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-white font-medium flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Select Languages to Export
            </Label>
            <div className="flex gap-2">
              <Button
                onClick={selectAllLanguages}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 text-xs"
              >
                All
              </Button>
              <Button
                onClick={deselectAllLanguages}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 text-xs"
              >
                None
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {project.targetLanguages.map(language => (
              <div
                key={language}
                className={`
                  flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer
                  ${availableTranslations[language] 
                    ? 'border-white/20 hover:border-white/40' 
                    : 'border-gray-500/20 opacity-50 cursor-not-allowed'
                  }
                  ${selectedLanguages.includes(language) ? 'bg-blue-500/20' : 'bg-white/5'}
                `}
                onClick={() => toggleLanguageSelection(language)}
              >
                <Checkbox
                  checked={selectedLanguages.includes(language)}
                  disabled={!availableTranslations[language]}
                  className="border-white/30 data-[state=checked]:bg-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm block truncate">
                    {getLanguageName(language)}
                  </span>
                  {!availableTranslations[language] && (
                    <span className="text-red-400 text-xs">No translation</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/80 flex items-center gap-2 mb-2">
              <FileType className="w-4 h-4" />
              Export Format
            </Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">Word Document (.docx)</SelectItem>
                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                <SelectItem value="txt">Text File (.txt)</SelectItem>
                <SelectItem value="json">JSON Data (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-original"
              checked={includeOriginal}
              onCheckedChange={(checked) => setIncludeOriginal(checked === true)}
              className="border-white/30 data-[state=checked]:bg-blue-500"
            />
            <Label htmlFor="include-original" className="text-white/80 text-sm">
              Include original text
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="separate-files"
              checked={separateFiles}
              onCheckedChange={(checked) => setSeparateFiles(checked === true)}
              className="border-white/30 data-[state=checked]:bg-blue-500"
            />
            <Label htmlFor="separate-files" className="text-white/80 text-sm">
              Export as separate files (one per language)
            </Label>
          </div>
        </div>

        {/* Export Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleExport}
            disabled={isExporting || (selectedLanguages.length === 0 && !includeOriginal)}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export {separateFiles ? `${selectedLanguages.length + (includeOriginal ? 1 : 0)} Files` : 'Project'}
              </>
            )}
          </Button>
        </motion.div>

        <div className="text-xs text-white/60 text-center">
          💡 Tip: Use separate files option to get individual translations for each language
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
