
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TranslationProject } from '../types/translation';
import { Package, Play, Pause, Download, Trash2, Copy, Settings } from 'lucide-react';

interface BatchOperationsProps {
  projects: TranslationProject[];
  onBatchAction?: (action: string, projectIds: string[]) => void;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  projects,
  onBatchAction
}) => {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleProjectSelection = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const selectAllProjects = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const executeBatchAction = async () => {
    if (!batchAction || selectedProjects.size === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const projectIds = Array.from(selectedProjects);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      onBatchAction?.(batchAction, projectIds);
      setSelectedProjects(new Set());
      setBatchAction('');
    } catch (error) {
      console.error('Batch operation failed:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const batchActions = [
    { value: 'start-translation', label: 'Start Translation', icon: Play },
    { value: 'pause-translation', label: 'Pause Translation', icon: Pause },
    { value: 'export-all', label: 'Export All', icon: Download },
    { value: 'duplicate', label: 'Duplicate Projects', icon: Copy },
    { value: 'delete', label: 'Delete Projects', icon: Trash2 },
    { value: 'update-settings', label: 'Update Settings', icon: Settings }
  ];

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      error: 0,
      paused: 0,
      ready: 0
    };

    projects.forEach(project => {
      counts[project.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-400" />
          Batch Operations
          {selectedProjects.size > 0 && (
            <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
              {selectedProjects.size} selected
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{count}</div>
              <div className="text-xs text-white/60 capitalize">{status}</div>
            </div>
          ))}
        </div>

        {/* Project Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Select Projects</h4>
            <Button
              onClick={selectAllProjects}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {selectedProjects.size === projects.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                whileHover={{ scale: 1.01 }}
              >
                <Checkbox
                  checked={selectedProjects.has(project.id)}
                  onCheckedChange={() => toggleProjectSelection(project.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{project.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      project.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                      project.status === 'error' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                    <span>{project.targetLanguages.length} languages</span>
                    <span>{project.progress || 0}% complete</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Batch Action Selection */}
        {selectedProjects.size > 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Choose Action
              </label>
              <Select value={batchAction} onValueChange={setBatchAction}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  {batchActions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Processing...</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={executeBatchAction}
              disabled={!batchAction || isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isProcessing ? 'Processing...' : `Execute on ${selectedProjects.size} projects`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchOperations;
