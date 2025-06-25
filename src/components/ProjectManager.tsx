
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Eye, Calendar, Languages, MoreVertical } from 'lucide-react';
import { TranslationProject } from '../types/translation';
import { dbUtils } from '../utils/database';
import { toast } from '@/hooks/use-toast';

interface ProjectManagerProps {
  projects: TranslationProject[];
  onProjectSelect: (project: TranslationProject) => void;
  onProjectsUpdate: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  projects, 
  onProjectSelect, 
  onProjectsUpdate 
}) => {
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteProject = async (projectId: number) => {
    try {
      await dbUtils.deleteProject(projectId);
      onProjectsUpdate();
      
      toast({
        title: "Project Deleted",
        description: "The project has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'error': return 'Error';
      case 'paused': return 'Paused';
      default: return 'Pending';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-24 h-24 text-white/20 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-4">No Projects Yet</h3>
        <p className="text-white/60 text-lg mb-8">
          Create your first translation project to get started
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Translation Projects</h2>
        <div className="text-white/60">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{project.name}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-white/60 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      {project.targetLanguages.length} language{project.targetLanguages.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {project.fileType.toUpperCase()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-white/80 text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(project.progress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Languages */}
                  <div className="flex flex-wrap gap-2">
                    {project.targetLanguages.slice(0, 5).map((lang) => (
                      <span 
                        key={lang}
                        className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80"
                      >
                        {lang.toUpperCase()}
                      </span>
                    ))}
                    {project.targetLanguages.length > 5 && (
                      <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80">
                        +{project.targetLanguages.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => onProjectSelect(project)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleDeleteProject(project.id!)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManager;
