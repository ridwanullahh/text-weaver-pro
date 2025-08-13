
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Zap, Clock } from 'lucide-react';

interface ExtractionMethodSelectorProps {
  method: 'ai' | 'traditional';
  onMethodChange: (method: 'ai' | 'traditional') => void;
  disabled?: boolean;
}

const ExtractionMethodSelector: React.FC<ExtractionMethodSelectorProps> = ({
  method,
  onMethodChange,
  disabled = false
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        PDF Extraction Method
      </h4>
      
      <div className="space-y-3">
        <motion.div
          className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
            method === 'ai'
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onMethodChange('ai')}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${method === 'ai' ? 'bg-blue-500' : 'bg-white/20'}`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-medium text-white">AI-Powered Extraction</h5>
                <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-white/70">
                Uses Gemini Vision AI for accurate multilingual text extraction. 
                Best for complex layouts, handwritten text, and foreign languages.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Slower but more accurate
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
            method === 'traditional'
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onMethodChange('traditional')}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${method === 'traditional' ? 'bg-blue-500' : 'bg-white/20'}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-medium text-white">Traditional Extraction</h5>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                  Fast
                </span>
              </div>
              <p className="text-sm text-white/70">
                Uses PDF.js for direct text extraction. Faster processing but may miss 
                formatted text, images with text, or complex layouts.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Faster processing
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
        <p className="text-xs text-blue-300">
          <strong>Tip:</strong> AI extraction works better for scanned documents, handwritten text, 
          and multilingual content. Traditional extraction is faster for text-based PDFs.
        </p>
      </div>
    </div>
  );
};

export default ExtractionMethodSelector;
