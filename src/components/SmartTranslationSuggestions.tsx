
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranslationProject } from '../types/translation';
import { Lightbulb, Languages, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface SmartSuggestion {
  id: string;
  type: 'language' | 'optimization' | 'quality' | 'cost';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action?: () => void;
}

interface SmartTranslationSuggestionsProps {
  project: TranslationProject;
  onApplySuggestion?: (suggestionId: string) => void;
}

const SmartTranslationSuggestions: React.FC<SmartTranslationSuggestionsProps> = ({
  project,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateSmartSuggestions();
  }, [project]);

  const generateSmartSuggestions = () => {
    const newSuggestions: SmartSuggestion[] = [];

    // Language suggestions
    if (project.targetLanguages.length < 3) {
      newSuggestions.push({
        id: 'add-popular-languages',
        type: 'language',
        title: 'Add Popular Languages',
        description: 'Consider adding Spanish, French, or German for wider reach',
        impact: 'medium'
      });
    }

    // Optimization suggestions
    if (project.settings?.chunkSize && project.settings.chunkSize > 1500) {
      newSuggestions.push({
        id: 'optimize-chunk-size',
        type: 'optimization',
        title: 'Optimize Chunk Size',
        description: 'Smaller chunks (1000-1200 words) often produce better translations',
        impact: 'high'
      });
    }

    // Quality suggestions
    if (!project.settings?.contextAware) {
      newSuggestions.push({
        id: 'enable-context-aware',
        type: 'quality',
        title: 'Enable Context-Aware Translation',
        description: 'Improve translation quality by maintaining context across chunks',
        impact: 'high'
      });
    }

    // Cost optimization
    if (project.targetLanguages.length > 5) {
      newSuggestions.push({
        id: 'batch-similar-languages',
        type: 'cost',
        title: 'Batch Similar Languages',
        description: 'Group related language families to reduce processing costs',
        impact: 'medium'
      });
    }

    // Time optimization
    if (project.totalChunks > 50) {
      newSuggestions.push({
        id: 'parallel-processing',
        type: 'optimization',
        title: 'Enable Parallel Processing',
        description: 'Process multiple languages simultaneously to reduce time',
        impact: 'high'
      });
    }

    setSuggestions(newSuggestions);
  };

  const applySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => new Set(prev).add(suggestionId));
    onApplySuggestion?.(suggestionId);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'language': return <Languages className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'quality': return <CheckCircle className="w-4 h-4" />;
      case 'cost': return <Clock className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">All Optimized!</h3>
          <p className="text-white/60 text-sm">Your project settings are already optimized.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Smart Translation Suggestions
          <Badge className="bg-purple-500/20 text-purple-300">
            {suggestions.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-white/10 rounded-lg">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{suggestion.title}</h4>
                    <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact} impact
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm">{suggestion.description}</p>
                </div>
              </div>
              <div className="ml-4">
                {appliedSuggestions.has(suggestion.id) ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Applied
                  </div>
                ) : (
                  <Button
                    onClick={() => applySuggestion(suggestion.id)}
                    size="sm"
                    className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30"
                  >
                    Apply
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartTranslationSuggestions;
