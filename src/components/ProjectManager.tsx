import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TranslationProject } from '../types/translation';
import { translationDB } from '../utils/database';
import { 
  Folder, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Trash2, 
  Calendar, 
  FileText,
  Clock,
  Users
} from 'lucide-react';

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
  const { toast } = useToast();
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [processingProject, setProcessingProject] = useState<string | null>(null);

  const deleteProject = async (projectId: string) => {
    try {
      setDeletingProject(projectId);
      await translationDB.projects.delete(projectId);
      await translationDB.chunks.where('projectId').equals(projectId).delete();
      
      toast({
        title: "Project Deleted",
        description: "Project and all related data have been removed.",
      });
      
      onProjectsUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingProject(null);
    }
  };

  const updateProjectStatus = async (
    projectId: string, 
    newStatus: 'pending' | 'processing' | 'paused' | 'completed' | 'error'
  ) => {
    try {
      setProcessingProject(projectId);
      
      await translationDB.projects.update(projectId, {
        status: newStatus,
        updatedAt: new Date()
      });

      const statusMessages = {
        processing: 'Project resumed and is now processing',
        paused: 'Project has been paused',
        pending: 'Project has been reset to pending',
        completed: 'Project marked as completed',
        error: 'Project status updated to error'
      };

      toast({
        title: "Status Updated",
        description: statusMessages[newStatus],
      });

      onProjectsUpdate();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingProject(null);
    }
  };

  const restartProject = async (projectId: string) => {
    try {
      setProcessingProject(projectId);
      
      // Reset project progress
      await translationDB.projects.update(projectId, {
        status: 'pending',
        progress: 0,
        completedChunks: 0,
        updatedAt: new Date()
      });

      // Clear existing translation chunks
      await translationDB.chunks.where('projectId').equals(projectId).delete();

      toast({
        title: "Project Restarted",
        description: "Project has been reset and is ready to start fresh.",
      });

      onProjectsUpdate();
    } catch (error) {
      console.error('Error restarting project:', error);
      toast({
        title: "Restart Failed",
        description: "Failed to restart project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingProject(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '🔄';
      case 'error': return '❌';
      case 'paused': return '⏸️';
      default: return '⏳';
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

  const canStartProject = (project: TranslationProject) => {
    return ['pending', 'paused', 'error'].includes(project.status);
  };

  const canPauseProject = (project: TranslationProject) => {
    return project.status === 'processing';
  };

  const canRestartProject = (project: TranslationProject) => {
    return ['completed', 'error', 'paused'].includes(project.status);
  };

  const activeProjects = projects.filter(p => p.status === 'processing').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalProjects = projects.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">📁 Project Manager</h2>
        <p className="text-white/60 text-sm md:text-lg">
          Manage your translation projects
        </p>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-300">{totalProjects}</div>
            <p className="text-white/60 text-sm">Total Projects</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{activeProjects}</div>
            <p className="text-white/60 text-sm">Active Projects</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-300">{completedProjects}</div>
            <p className="text-white/60 text-sm">Completed</p>
          </CardContent>
        </Card>
      </div>

      {activeProjects > 0 && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {activeProjects} project{activeProjects > 1 ? 's' : ''} currently processing simultaneously
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(project.status)}</span>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
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

                  <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {formatDate(project.createdAt)}</span>
                    {project.updatedAt && (
                      <span>• Updated: {formatDate(project.updatedAt)}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {(project.progress || 0) > 0 && (
                    <div className="mb-3">
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
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <Button
                    onClick={() => onProjectSelect(project)}
                    className="bg-purple-500 hover:bg-purple-600"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Open
                  </Button>

                  {canStartProject(project) && (
                    <Button
                      onClick={() => updateProjectStatus(project.id, 'processing')}
                      disabled={processingProject === project.id}
                      className="bg-green-500 hover:bg-green-600"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}

                  {canPauseProject(project) && (
                    <Button
                      onClick={() => updateProjectStatus(project.id, 'paused')}
                      disabled={processingProject === project.id}
                      className="bg-yellow-500 hover:bg-yellow-600"
                      size="sm"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}

                  {canRestartProject(project) && (
                    <Button
                      onClick={() => restartProject(project.id)}
                      disabled={processingProject === project.id}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restart
                    </Button>
                  )}

                  <Button
                    onClick={() => deleteProject(project.id)}
                    disabled={deletingProject === project.id || processingProject === project.id}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Project Status Information */}
              {project.status === 'processing' && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-300 text-sm">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>This project is currently being processed...</span>
                  </div>
                </div>
              )}

              {project.status === 'paused' && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-300 text-sm">
                    <Pause className="w-4 h-4" />
                    <span>Project is paused. Click Start to resume processing.</span>
                  </div>
                </div>
              )}

              {project.status === 'error' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-300 text-sm">
                    <Square className="w-4 h-4" />
                    <span>Project encountered an error. Try restarting or check the logs.</span>
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
