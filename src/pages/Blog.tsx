
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Search, ArrowRight } from 'lucide-react';
import { sdk } from '@/services/sdkService';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  featured: boolean;
  slug: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const blogPosts = await sdk.get<BlogPost>('blog_posts');
      setPosts(blogPosts.filter(post => post.publishedAt));
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(posts.flatMap(post => post.tags))];
  const featuredPost = posts.find(post => post.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-white">Loading Blog Posts...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">TextWeaver Pro</Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white/70 hover:text-white">Home</Link>
            <Link to="/docs" className="text-white/70 hover:text-white">Docs</Link>
            <Link to="/contact" className="text-white/70 hover:text-white">Contact</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Latest insights, tutorials, and updates from the TextWeaver Pro team
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                onClick={() => setSelectedTag('')}
                className={selectedTag === '' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'border-white/20 text-white hover:bg-white/10'}
              >
                All
              </Button>
              {allTags.slice(0, 4).map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  onClick={() => setSelectedTag(tag)}
                  className={selectedTag === tag ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">Featured</Badge>
                  <div className="flex items-center text-white/60 text-sm gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-2xl text-white mb-2">{featuredPost.title}</CardTitle>
                <p className="text-white/80">{featuredPost.excerpt}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {featuredPost.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="border-white/20 text-white/70">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.filter(post => !post.featured).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all h-full">
                <CardHeader>
                  <div className="flex items-center text-white/60 text-sm gap-4 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-white text-lg mb-2">{post.title}</CardTitle>
                  <p className="text-white/70 text-sm">{post.excerpt}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="border-white/20 text-white/70 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Posts Found</h3>
            <p className="text-white/60">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
