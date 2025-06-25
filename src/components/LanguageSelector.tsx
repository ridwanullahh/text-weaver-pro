
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Plus, X, Check } from 'lucide-react';
import { TranslationProject } from '../types/translation';
import { dbUtils } from '../utils/database';
import { toast } from '@/hooks/use-toast';

interface LanguageSelectorProps {
  project: TranslationProject;
  onUpdate: (project: TranslationProject) => void;
}

const POPULAR_LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ project, onUpdate }) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = POPULAR_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLanguage = async (languageCode: string) => {
    if (project.targetLanguages.includes(languageCode)) return;

    const updatedLanguages = [...project.targetLanguages, languageCode];
    const updatedProject = { ...project, targetLanguages: updatedLanguages };

    try {
      await dbUtils.updateProject(project.id!, { targetLanguages: updatedLanguages });
      onUpdate(updatedProject);
      
      toast({
        title: "Language Added",
        description: `${POPULAR_LANGUAGES.find(l => l.code === languageCode)?.name} has been added to the project.`,
      });
    } catch (error) {
      console.error('Error adding language:', error);
      toast({
        title: "Error",
        description: "Failed to add language. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveLanguage = async (languageCode: string) => {
    const updatedLanguages = project.targetLanguages.filter(lang => lang !== languageCode);
    const updatedProject = { ...project, targetLanguages: updatedLanguages };

    try {
      await dbUtils.updateProject(project.id!, { targetLanguages: updatedLanguages });
      onUpdate(updatedProject);
      
      toast({
        title: "Language Removed",
        description: `${POPULAR_LANGUAGES.find(l => l.code === languageCode)?.name} has been removed from the project.`,
      });
    } catch (error) {
      console.error('Error removing language:', error);
      toast({
        title: "Error",
        description: "Failed to remove language. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Globe className="w-6 h-6 text-green-400" />
          Target Languages
        </h3>
        <motion.button
          onClick={() => setShowLanguageModal(true)}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Add Language
        </motion.button>
      </div>

      {/* Selected Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {project.targetLanguages.map((langCode) => {
          const language = POPULAR_LANGUAGES.find(l => l.code === langCode);
          if (!language) return null;

          return (
            <motion.div
              key={langCode}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 border border-white/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <p className="text-white font-medium">{language.name}</p>
                  <p className="text-white/60 text-sm">{language.nativeName}</p>
                </div>
              </div>
              <motion.button
                onClick={() => handleRemoveLanguage(langCode)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {project.targetLanguages.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No target languages selected</p>
          <p className="text-white/40 text-sm">Add languages to start translation</p>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLanguageModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Select Languages</h3>
              <motion.button
                onClick={() => setShowLanguageModal(false)}
                className="text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search languages..."
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredLanguages.map((language) => {
                const isSelected = project.targetLanguages.includes(language.code);
                
                return (
                  <motion.button
                    key={language.code}
                    onClick={() => {
                      if (!isSelected) {
                        handleAddLanguage(language.code);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-green-500/20 border border-green-500/30 cursor-default'
                        : 'bg-white/5 border border-white/20 hover:bg-white/10'
                    }`}
                    whileHover={!isSelected ? { scale: 1.02 } : {}}
                    whileTap={!isSelected ? { scale: 0.98 } : {}}
                    disabled={isSelected}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{language.name}</p>
                      <p className="text-white/60 text-sm">{language.nativeName}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;
