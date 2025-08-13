
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { wrappedSDK } from '@/services/sdkService';
import { Search, Book, FileText, Settings, Zap, Users, Shield } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';

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
        return <h1 key={index} className="text-3xl font-bold text-foreground mb-6">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-foreground mb-4 mt-8">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-foreground mb-3 mt-6">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="text-foreground font-semibold mb-2">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-muted-foreground mb-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-muted-foreground mb-4">{line}</p>;
      }
    });
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Loading Documentation</h2>
            <p className="text-muted-foreground">Please wait while we fetch the documentation...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Documentation</h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Everything you need to know about using TextWeaver Pro
            </p>
          </div>
        </div>

        <div className="px-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-border/50 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-foreground">Documentation</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search docs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
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
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {category.icon}
                        <span className="text-sm">{category.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Document List */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    {filteredDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedDoc?.id === doc.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className="text-sm font-medium">{doc.title}</div>
                        <Badge variant="outline" className="text-xs mt-1 border-border text-muted-foreground">
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
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl text-foreground mb-2">
                            {selectedDoc.title}
                          </CardTitle>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {selectedDoc.category}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-sm">
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
                <Card className="glass-effect border-border/50">
                  <CardContent className="text-center py-16">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">No Documentation Available</h2>
                    <p className="text-muted-foreground mb-8">
                      Documentation is being prepared. Please check back later.
                    </p>
                    <Link to="/">
                      <Button className="gradient-primary text-primary-foreground hover:shadow-lg">
                        Return Home
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-effect border-border/50">
                  <CardContent className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">No Results Found</h2>
                    <p className="text-muted-foreground mb-8">
                      Try adjusting your search terms or category filters.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="gradient-primary text-primary-foreground hover:shadow-lg"
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
    </MobileLayout>
  );
};

export default Documentation;
