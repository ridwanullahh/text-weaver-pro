
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { wrappedSDK } from '@/services/sdkService';
import { Plus, Edit, Trash2, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocItem {
  id: string;
  uid: string;
  title: string;
  content: string;
  category: string;
  order: number;
  publishedAt: string;
}

const DocumentationManagement = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'basics',
    order: 1
  });

  const categories = [
    { value: 'basics', label: 'Getting Started' },
    { value: 'advanced', label: 'Advanced Features' },
    { value: 'admin', label: 'Administration' },
    { value: 'api', label: 'API Reference' },
    { value: 'security', label: 'Security' }
  ];

  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      setIsLoading(true);
      const documentation = await wrappedSDK.get('documentation');
      setDocs(documentation.sort((a: DocItem, b: DocItem) => a.order - b.order));
    } catch (error) {
      console.error('Failed to load documentation:', error);
      toast({
        title: "Error",
        description: "Failed to load documentation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const docData = {
        ...formData,
        publishedAt: editingDoc ? editingDoc.publishedAt : new Date().toISOString()
      };

      if (editingDoc) {
        await wrappedSDK.update('documentation', editingDoc.id, docData);
        toast({
          title: "Success",
          description: "Documentation updated successfully"
        });
      } else {
        await wrappedSDK.insert('documentation', docData);
        toast({
          title: "Success",
          description: "Documentation created successfully"
        });
      }

      await loadDocumentation();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save documentation:', error);
      toast({
        title: "Error",
        description: "Failed to save documentation",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (doc: DocItem) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      order: doc.order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (doc: DocItem) => {
    if (!confirm('Are you sure you want to delete this documentation?')) return;

    try {
      await wrappedSDK.delete('documentation', doc.id);
      await loadDocumentation();
      toast({
        title: "Success",
        description: "Documentation deleted successfully"
      });
    } catch (error) {
      console.error('Failed to delete documentation:', error);
      toast({
        title: "Error",
        description: "Failed to delete documentation",
        variant: "destructive"
      });
    }
  };

  const handleMoveOrder = async (doc: DocItem, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? doc.order - 1 : doc.order + 1;
    if (newOrder < 1) return;

    try {
      await wrappedSDK.update('documentation', doc.id, { order: newOrder });
      await loadDocumentation();
      toast({
        title: "Success",
        description: "Order updated successfully"
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDoc(null);
    setFormData({
      title: '',
      content: '',
      category: 'basics',
      order: 1
    });
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📚</div>
          <p className="text-white/60">Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Documentation Management</h2>
          <p className="text-white/60">Create and manage help documentation</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documentation List */}
      <div className="grid gap-4">
        {filteredDocs.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-white/20 text-white/70">
                        Order: {doc.order}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {categories.find(c => c.value === doc.category)?.label || doc.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-white mb-2">{doc.title}</CardTitle>
                    <p className="text-white/70 text-sm">
                      Updated: {new Date(doc.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveOrder(doc, 'up')}
                      className="border-white/20 text-white hover:bg-white/10"
                      disabled={doc.order === 1}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveOrder(doc, 'down')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(doc)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(doc)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-white/60 text-sm line-clamp-3">
                  {doc.content.substring(0, 200)}...
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Documentation Found</h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? 'No documents match your search criteria.' : 'Create your first documentation to get started.'}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingDoc ? 'Edit Documentation' : 'Create New Documentation'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="order" className="text-white">Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-white">Content (Markdown supported)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                rows={20}
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {editingDoc ? 'Update Document' : 'Create Document'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentationManagement;
