
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Settings, Filter, FileText } from 'lucide-react';

interface ExtractionSettingsProps {
  settings: {
    ignoreHeaders: boolean;
    ignoreFooters: boolean;
    ignorePageNumbers: boolean;
    ignoreFootnotes: boolean;
    maintainFormatting: boolean;
    separatePages: boolean;
  };
  onSettingsChange: (settings: any) => void;
  disabled?: boolean;
}

const ExtractionSettings: React.FC<ExtractionSettingsProps> = ({
  settings,
  onSettingsChange,
  disabled = false
}) => {
  const handleSettingChange = (key: string, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          AI Extraction Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ignoreHeaders"
                checked={settings.ignoreHeaders}
                onCheckedChange={(checked) => handleSettingChange('ignoreHeaders', checked as boolean)}
                disabled={disabled}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="ignoreHeaders" className="text-white/80 text-sm">
                Ignore page headers
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ignoreFooters"
                checked={settings.ignoreFooters}
                onCheckedChange={(checked) => handleSettingChange('ignoreFooters', checked as boolean)}
                disabled={disabled}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="ignoreFooters" className="text-white/80 text-sm">
                Ignore page footers
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ignorePageNumbers"
                checked={settings.ignorePageNumbers}
                onCheckedChange={(checked) => handleSettingChange('ignorePageNumbers', checked as boolean)}
                disabled={disabled}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="ignorePageNumbers" className="text-white/80 text-sm">
                Ignore page numbers
              </Label>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ignoreFootnotes"
                checked={settings.ignoreFootnotes}
                onCheckedChange={(checked) => handleSettingChange('ignoreFootnotes', checked as boolean)}
                disabled={disabled}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="ignoreFootnotes" className="text-white/80 text-sm">
                Ignore footnotes
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintainFormatting"
                checked={settings.maintainFormatting}
                onCheckedChange={(checked) => handleSettingChange('maintainFormatting', checked as boolean)}
                disabled={disabled}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="maintainFormatting" className="text-white/80 text-sm">
                Maintain text formatting
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="separatePages"
                checked={settings.separatePages}
                onCheckedChange={(checked) => handleSettingChange('separatePages', checked as boolean)}
                disabled={disabled}
                className="border-white/30 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="separatePages" className="text-white/80 text-sm">
                Separate pages clearly
              </Label>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <p className="text-xs text-blue-300">
            <Filter className="w-3 h-3 inline mr-1" />
            <strong>Smart Extraction:</strong> AI will intelligently filter out selected elements and focus on the main content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractionSettings;
