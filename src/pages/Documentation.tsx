
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { wrappedSDK } from '@/services/sdkService';
import { Search, Book, FileText, Settings, Zap, Users, Shield } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
  publishedAt: string;
}

const Documentation = () => {
  const { slug } = useParams();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="w-4 h-4" /> },
    { id: 'basics', name: 'Getting Started', icon: <FileText className="w-4 h-4" /> },
    { id: 'advanced', name: 'Advanced Features', icon: <Zap className="w-4 h-4" /> },
    { id: 'admin', name: 'Administration', icon: <Settings className="w-4 h-4" /> },
    { id: 'api', name: 'API Reference', icon: <Users className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadDocumentation();
  }, []);

  useEffect(() => {
    if (slug && docs.length > 0) {
      const doc = docs.find(d => d.title.toLowerCase().replace(/\s+/g, '-') === slug);
      if (doc) {
        setSelectedDoc(doc);
        setSelectedCategory(doc.category);
      }
    }
  }, [slug, docs]);

  const loadDocumentation = async () => {
    try {
      setIsLoading(true);
      const documentation = await wrappedSDK.get('documentation');
      setDocs(documentation.sort((a: DocItem, b: DocItem) => a.order - b.order));
      
      if (documentation.length > 0 && !selectedDoc) {
        setSelectedDoc(documentation[0]);
      }
    } catch (error) {
      console.error('Failed to load documentation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-white mb-6">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-white mb-4 mt-8">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-white mb-3 mt-6">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="text-white font-semibold mb-2">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-white/80 mb-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-white/80 mb-4">{line}</p>;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Documentation</h2>
          <p className="text-white/60">Please wait while we fetch the documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              TextWeaver Pro
            </Link>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Documentation</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search docs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Categories */}
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-500/30 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {category.icon}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* Document List */}
                <div className="space-y-2 pt-4 border-t border-white/20">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedDoc?.id === doc.id
                          ? 'bg-blue-500/30 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-medium">{doc.title}</div>
                      <Badge variant="outline" className="text-xs mt-1 border-white/20">
                        {doc.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedDoc ? (
              <motion.div
                key={selectedDoc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl text-white mb-2">
                          {selectedDoc.title}
                        </CardTitle>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {selectedDoc.category}
                        </Badge>
                      </div>
                      <div className="text-white/60 text-sm">
                        Updated: {new Date(selectedDoc.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      {renderContent(selectedDoc.content)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : docs.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <h2 className="text-2xl font-bold text-white mb-4">No Documentation Available</h2>
                  <p className="text-white/60 mb-8">
                    Documentation is being prepared. Please check back later.
                  </p>
                  <Link to="/">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                      Return Home
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-white mb-4">No Results Found</h2>
                  <p className="text-white/60 mb-8">
                    Try adjusting your search terms or category filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
