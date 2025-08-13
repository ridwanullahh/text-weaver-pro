
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Search, ArrowRight } from 'lucide-react';
import { sdk } from '@/services/sdkService';
import MobileLayout from '@/components/layout/MobileLayout';

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
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-foreground">Loading Blog Posts...</h2>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Blog</h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Latest insights, tutorials, and updates from the TextWeaver Pro team
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="px-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                onClick={() => setSelectedTag('')}
                className={selectedTag === '' ? 'gradient-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'}
              >
                All
              </Button>
              {allTags.slice(0, 4).map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  onClick={() => setSelectedTag(tag)}
                  className={selectedTag === tag ? 'gradient-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="gradient-primary text-primary-foreground">Featured</Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm gap-4">
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
                  <CardTitle className="text-2xl text-foreground mb-2">{featuredPost.title}</CardTitle>
                  <p className="text-muted-foreground">{featuredPost.excerpt}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                      {featuredPost.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="border-border text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link to={`/blog/${featuredPost.slug}`}>
                      <Button className="gradient-primary text-primary-foreground hover:shadow-lg">
                        Read More <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(post => !post.featured).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-border/50 hover:shadow-lg transition-all h-full">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center text-muted-foreground text-sm gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-foreground text-lg mb-2">{post.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{post.excerpt}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="border-border text-muted-foreground text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {filteredPosts.length === 0 && (
          <section className="px-4">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No Posts Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          </section>
        )}
      </div>
    </MobileLayout>
  );
};

export default Blog;
