
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { TranslationProject } from '../types/translation';

interface TranslationQualityProps {
  project: TranslationProject;
}

const TranslationQuality: React.FC<TranslationQualityProps> = ({ project }) => {
  const [selectedChunk, setSelectedChunk] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const qualityMetrics = {
    accuracy: 92,
    fluency: 88,
    consistency: 95,
    culturalAdaptation: 90,
    overall: 91
  };

  const commonIssues = [
    { type: 'Context Misunderstanding', count: 3, severity: 'medium' },
    { type: 'Cultural References', count: 1, severity: 'low' },
    { type: 'Technical Terms', count: 2, severity: 'medium' },
    { type: 'Idiomatic Expressions', count: 1, severity: 'low' }
  ];

  const suggestions = [
    'Consider using more formal tone for business documents',
    'Review cultural context for better localization',
    'Maintain consistency in technical terminology',
    'Consider target audience preferences'
  ];

  const handleRatingSubmit = () => {
    // Here you would save the rating and feedback
    console.log('Rating:', rating, 'Feedback:', feedback);
  };

  return (
    <div className="space-y-8">
      {/* Quality Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Award className="w-6 h-6 text-purple-400" />
          Translation Quality Analysis
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quality Metrics</h4>
            <div className="space-y-4">
              {Object.entries(qualityMetrics).map(([metric, score]) => (
                <div key={metric} className="space-y-2">
                  <div className="flex justify-between text-white/80">
                    <span className="capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Overall Score</h4>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4"
              >
                <span className="text-4xl font-bold text-white">{qualityMetrics.overall}%</span>
              </motion.div>
              <p className="text-white/80">Excellent Quality</p>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(qualityMetrics.overall / 20)
                        ? 'text-yellow-400 fill-current'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Issues & Suggestions */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h4 className="text-xl font-bold text-white mb-6">Common Issues</h4>
          <div className="space-y-4">
            {commonIssues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <div>
                  <p className="text-white font-medium">{issue.type}</p>
                  <p className="text-white/60 text-sm">{issue.count} occurrence{issue.count !== 1 ? 's' : ''}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                  issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {issue.severity}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h4 className="text-xl font-bold text-white mb-6">Improvement Suggestions</h4>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/80">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* User Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
      >
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-green-400" />
          Rate This Translation
        </h4>

        <div className="space-y-6">
          <div>
            <p className="text-white/80 mb-3">How would you rate the overall quality?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 ${
                    star <= rating ? 'text-yellow-400' : 'text-white/30 hover:text-white/60'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star className="w-8 h-8 fill-current" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/80 mb-3">Additional feedback (optional)</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts on the translation quality..."
              className="w-full h-32 bg-white/5 border border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={handleRatingSubmit}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsUp className="w-4 h-4" />
              Submit Feedback
            </motion.button>
            <motion.button
              className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsDown className="w-4 h-4" />
              Report Issue
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TranslationQuality;
