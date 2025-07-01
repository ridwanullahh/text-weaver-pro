
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationProject } from '../types/translation';
import { Languages, Search, X } from 'lucide-react';

interface LanguageSelectorProps {
  project: TranslationProject;
  onUpdate: (project: TranslationProject) => void;
}

const SUPPORTED_LANGUAGES = [
  // Major World Languages
  { code: 'en', name: 'English', region: 'Global' },
  { code: 'es', name: 'Spanish', region: 'Europe/Americas' },
  { code: 'fr', name: 'French', region: 'Europe/Africa' },
  { code: 'de', name: 'German', region: 'Europe' },
  { code: 'it', name: 'Italian', region: 'Europe' },
  { code: 'pt', name: 'Portuguese', region: 'Europe/Americas' },
  { code: 'ru', name: 'Russian', region: 'Europe/Asia' },
  { code: 'ja', name: 'Japanese', region: 'Asia' },
  { code: 'ko', name: 'Korean', region: 'Asia' },
  { code: 'zh', name: 'Chinese (Simplified)', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', region: 'Asia' },
  { code: 'ar', name: 'Arabic', region: 'Middle East/Africa' },
  { code: 'hi', name: 'Hindi', region: 'Asia' },
  { code: 'tr', name: 'Turkish', region: 'Europe/Asia' },
  { code: 'pl', name: 'Polish', region: 'Europe' },
  { code: 'nl', name: 'Dutch', region: 'Europe' },
  { code: 'sv', name: 'Swedish', region: 'Europe' },
  { code: 'da', name: 'Danish', region: 'Europe' },
  { code: 'no', name: 'Norwegian', region: 'Europe' },
  { code: 'fi', name: 'Finnish', region: 'Europe' },
  { code: 'th', name: 'Thai', region: 'Asia' },
  { code: 'vi', name: 'Vietnamese', region: 'Asia' },
  { code: 'uk', name: 'Ukrainian', region: 'Europe' },
  { code: 'he', name: 'Hebrew', region: 'Middle East' },
  { code: 'cs', name: 'Czech', region: 'Europe' },
  { code: 'hu', name: 'Hungarian', region: 'Europe' },
  { code: 'ro', name: 'Romanian', region: 'Europe' },
  { code: 'bg', name: 'Bulgarian', region: 'Europe' },
  { code: 'hr', name: 'Croatian', region: 'Europe' },
  { code: 'sk', name: 'Slovak', region: 'Europe' },
  { code: 'sl', name: 'Slovenian', region: 'Europe' },
  { code: 'et', name: 'Estonian', region: 'Europe' },
  { code: 'lv', name: 'Latvian', region: 'Europe' },
  { code: 'lt', name: 'Lithuanian', region: 'Europe' },
  
  // African Languages
  { code: 'yo', name: 'Yoruba', region: 'Africa' },
  { code: 'ha', name: 'Hausa', region: 'Africa' },
  { code: 'ig', name: 'Igbo', region: 'Africa' },
  { code: 'sw', name: 'Swahili', region: 'Africa' },
  { code: 'am', name: 'Amharic', region: 'Africa' },
  { code: 'zu', name: 'Zulu', region: 'Africa' },
  { code: 'xh', name: 'Xhosa', region: 'Africa' },
  { code: 'af', name: 'Afrikaans', region: 'Africa' },
  { code: 'so', name: 'Somali', region: 'Africa' },
  { code: 'rw', name: 'Kinyarwanda', region: 'Africa' },
  
  // Asian Languages
  { code: 'ur', name: 'Urdu', region: 'Asia' },
  { code: 'bn', name: 'Bengali', region: 'Asia' },
  { code: 'ta', name: 'Tamil', region: 'Asia' },
  { code: 'te', name: 'Telugu', region: 'Asia' },
  { code: 'ml', name: 'Malayalam', region: 'Asia' },
  { code: 'kn', name: 'Kannada', region: 'Asia' },
  { code: 'gu', name: 'Gujarati', region: 'Asia' },
  { code: 'pa', name: 'Punjabi', region: 'Asia' },
  { code: 'mr', name: 'Marathi', region: 'Asia' },
  { code: 'ne', name: 'Nepali', region: 'Asia' },
  { code: 'si', name: 'Sinhala', region: 'Asia' },
  { code: 'my', name: 'Myanmar (Burmese)', region: 'Asia' },
  { code: 'km', name: 'Khmer', region: 'Asia' },
  { code: 'lo', name: 'Lao', region: 'Asia' },
  { code: 'ka', name: 'Georgian', region: 'Asia' },
  { code: 'hy', name: 'Armenian', region: 'Asia' },
  { code: 'az', name: 'Azerbaijani', region: 'Asia' },
  { code: 'kk', name: 'Kazakh', region: 'Asia' },
  { code: 'ky', name: 'Kyrgyz', region: 'Asia' },
  { code: 'uz', name: 'Uzbek', region: 'Asia' },
  { code: 'tg', name: 'Tajik', region: 'Asia' },
  { code: 'mn', name: 'Mongolian', region: 'Asia' },
  
  // European Languages
  { code: 'eu', name: 'Basque', region: 'Europe' },
  { code: 'ca', name: 'Catalan', region: 'Europe' },
  { code: 'gl', name: 'Galician', region: 'Europe' },
  { code: 'is', name: 'Icelandic', region: 'Europe' },
  { code: 'ga', name: 'Irish', region: 'Europe' },
  { code: 'mt', name: 'Maltese', region: 'Europe' },
  { code: 'cy', name: 'Welsh', region: 'Europe' },
  { code: 'br', name: 'Breton', region: 'Europe' },
  { code: 'co', name: 'Corsican', region: 'Europe' },
  { code: 'lb', name: 'Luxembourgish', region: 'Europe' },
  
  // Americas Languages
  { code: 'qu', name: 'Quechua', region: 'Americas' },
  { code: 'gn', name: 'Guarani', region: 'Americas' },
  { code: 'ht', name: 'Haitian Creole', region: 'Americas' },
  
  // Middle Eastern Languages
  { code: 'fa', name: 'Persian (Farsi)', region: 'Middle East' },
  { code: 'ps', name: 'Pashto', region: 'Middle East' },
  { code: 'ku', name: 'Kurdish', region: 'Middle East' },
  
  // Pacific Languages
  { code: 'haw', name: 'Hawaiian', region: 'Pacific' },
  { code: 'mi', name: 'Maori', region: 'Pacific' },
  { code: 'sm', name: 'Samoan', region: 'Pacific' },
  { code: 'to', name: 'Tongan', region: 'Pacific' },
  { code: 'fj', name: 'Fijian', region: 'Pacific' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ project, onUpdate }) => {
  const [sourceLanguage, setSourceLanguage] = useState(project.sourceLanguage);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = ['all', ...Array.from(new Set(SUPPORTED_LANGUAGES.map(lang => lang.region)))];

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang => {
      const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lang.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === 'all' || lang.region === selectedRegion;
      const notSource = lang.code !== sourceLanguage;
      const notAlreadySelected = !project.targetLanguages.includes(lang.code);
      
      return matchesSearch && matchesRegion && notSource && notAlreadySelected;
    });
  }, [searchTerm, selectedRegion, sourceLanguage, project.targetLanguages]);

  const handleSourceLanguageChange = (language: string) => {
    setSourceLanguage(language);
    onUpdate({
      ...project,
      sourceLanguage: language
    });
  };

  const addTargetLanguage = (languageCode: string) => {
    if (languageCode && !project.targetLanguages.includes(languageCode)) {
      const updatedProject = {
        ...project,
        targetLanguages: [...project.targetLanguages, languageCode]
      };
      onUpdate(updatedProject);
      setSelectedTargetLanguage('');
      setSearchTerm('');
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

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Language Selection ({SUPPORTED_LANGUAGES.length} languages supported)
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
            <SelectContent className="max-h-60">
              <SelectItem value="auto">Auto-detect</SelectItem>
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.region})
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
          
          {/* Search and Filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection Grid */}
          <div className="max-h-48 overflow-y-auto border border-white/20 rounded-lg p-3 bg-white/5">
            <div className="grid grid-cols-1 gap-2">
              {filteredLanguages.map(lang => (
                <motion.button
                  key={lang.code}
                  onClick={() => addTargetLanguage(lang.code)}
                  className="text-left p-2 rounded hover:bg-white/10 transition-colors border border-white/10 hover:border-white/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">{lang.name}</span>
                    <span className="text-white/50 text-xs">{lang.region}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {filteredLanguages.length === 0 && (
              <p className="text-white/60 text-sm text-center py-4">
                No languages found matching your search
              </p>
            )}
          </div>

          {/* Selected Target Languages */}
          <div className="mt-4">
            <p className="text-white/60 text-xs mb-2">Selected Languages ({project.targetLanguages.length})</p>
            <div className="flex flex-wrap gap-2">
              {project.targetLanguages.map(lang => (
                <Badge 
                  key={lang} 
                  variant="secondary" 
                  className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all duration-200"
                  onClick={() => removeTargetLanguage(lang)}
                >
                  {getLanguageName(lang)} ×
                </Badge>
              ))}
            </div>
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
