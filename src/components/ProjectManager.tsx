
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranslationProject } from '../types/translation';
import { translationDB } from '../utils/database';
import { Folder, Play, Pause, Trash2, Calendar, FileText } from 'lucide-react';

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
  const [deletingProject, setDeletingProject] = useState<number | null>(null);

  const deleteProject = async (projectId: number) => {
    try {
      setDeletingProject(projectId);
      await translationDB.projects.delete(projectId);
      await translationDB.chunks.where('projectId').equals(projectId).delete();
      onProjectsUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeletingProject(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">📁 Project Manager</h2>
        <p className="text-white/60 text-sm md:text-lg">
          Manage your translation projects
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <Folder className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-white/60 mb-6">
              Upload your first document to create a translation project
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-white/60 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-white truncate">
                      {project.name}
                    </h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60 mb-3">
                    <div>
                      <span className="block text-white/40">Source</span>
                      <span className="text-white/80">{project.sourceLanguage || 'Auto'}</span>
                    </div>
                    <div>
                      <span className="block text-white/40">Targets</span>
                      <span className="text-white/80">{project.targetLanguages.length} languages</span>
                    </div>
                    <div>
                      <span className="block text-white/40">Progress</span>
                      <span className="text-white/80">{Math.round(project.progress || 0)}%</span>
                    </div>
                    <div>
                      <span className="block text-white/40">Chunks</span>
                      <span className="text-white/80">{project.completedChunks}/{project.totalChunks}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {formatDate(project.createdAt)}</span>
                    {project.updatedAt && (
                      <span>• Updated: {formatDate(project.updatedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => onProjectSelect(project)}
                    className="bg-purple-500 hover:bg-purple-600"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Open
                  </Button>
                  <Button
                    onClick={() => deleteProject(project.id!)}
                    disabled={deletingProject === project.id}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {(project.progress || 0) > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Translation Progress</span>
                    <span>{Math.round(project.progress || 0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
