
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationProject } from '../types/translation';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  project: TranslationProject;
  onUpdate: (project: TranslationProject) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'th', name: 'Thai' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ project, onUpdate }) => {
  const [sourceLanguage, setSourceLanguage] = useState(project.sourceLanguage);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('');

  const handleSourceLanguageChange = (language: string) => {
    setSourceLanguage(language);
    onUpdate({
      ...project,
      sourceLanguage: language
    });
  };

  const addTargetLanguage = () => {
    if (selectedTargetLanguage && !project.targetLanguages.includes(selectedTargetLanguage)) {
      const updatedProject = {
        ...project,
        targetLanguages: [...project.targetLanguages, selectedTargetLanguage]
      };
      onUpdate(updatedProject);
      setSelectedTargetLanguage('');
    }
  };

  const removeTargetLanguage = (language: string) => {
    const updatedProject = {
      ...project,
      targetLanguages: project.targetLanguages.filter(lang => lang !== language)
    };
    onUpdate(updatedProject);
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Language Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Language */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Source Language
          </label>
          <Select value={sourceLanguage} onValueChange={handleSourceLanguageChange}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select source language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Languages */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Target Languages
          </label>
          <div className="flex gap-2 mb-3">
            <Select value={selectedTargetLanguage} onValueChange={setSelectedTargetLanguage}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES
                  .filter(lang => lang.code !== sourceLanguage && !project.targetLanguages.includes(lang.code))
                  .map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={addTargetLanguage}
              disabled={!selectedTargetLanguage}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Add
            </Button>
          </div>

          {/* Selected Target Languages */}
          <div className="flex flex-wrap gap-2">
            {project.targetLanguages.map(lang => (
              <Badge 
                key={lang} 
                variant="secondary" 
                className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                onClick={() => removeTargetLanguage(lang)}
              >
                {getLanguageName(lang)} ×
              </Badge>
            ))}
          </div>
        </div>

        {project.targetLanguages.length > 0 && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300 text-sm">
              ✓ Ready to translate to {project.targetLanguages.length} language(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
