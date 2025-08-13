
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingAddProjectProps {
  onAddProject: () => void;
  activeProjects: number;
}

const FloatingAddProject: React.FC<FloatingAddProjectProps> = ({ 
  onAddProject, 
  activeProjects 
}) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={onAddProject}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      {activeProjects > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
        >
          {activeProjects}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FloatingAddProject;
