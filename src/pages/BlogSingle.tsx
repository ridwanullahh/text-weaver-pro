
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { wrappedSDK } from '@/services/sdkService';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
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

const BlogSingle = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const blogPosts = await wrappedSDK.get('blog_posts');
      const foundPost = blogPosts.find((p: BlogPost) => p.slug === slug);
      
      if (foundPost) {
        setPost(foundPost);
        
        // Load related posts (same tags)
        const related = blogPosts
          .filter((p: BlogPost) => 
            p.id !== foundPost.id && 
            p.tags.some(tag => foundPost.tags.includes(tag))
          )
          .slice(0, 3);
        setRelatedPosts(related);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to load blog post:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-foreground mb-6 mt-8">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-foreground mb-4 mt-6">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-foreground mb-3 mt-4">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="text-foreground font-semibold mb-2">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-muted-foreground mb-1 ml-4">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-muted-foreground mb-4 leading-relaxed">{line}</p>;
      }
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could add toast notification here
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Loading Blog Post</h2>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (notFound || !post) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="px-4">
            <Card className="glass-effect border-border/50">
              <CardContent className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Blog Post Not Found</h2>
                <p className="text-muted-foreground mb-8">
                  The blog post you're looking for doesn't exist or has been removed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/blog">
                    <Button className="gradient-primary text-primary-foreground hover:shadow-lg">
                      View All Posts
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="px-4 py-6 max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link to="/blog">
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </motion.div>

          {/* Main Article */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-effect border-border/50 mb-8">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl sm:text-3xl text-foreground mb-4">{post.title}</CardTitle>
                    <p className="text-lg sm:text-xl text-muted-foreground mb-6">{post.excerpt}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-border text-muted-foreground">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-invert prose-lg max-w-none">
                  {renderContent(post.content)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">{relatedPost.title}</CardTitle>
                      <p className="text-muted-foreground text-sm">{relatedPost.excerpt}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-muted-foreground text-sm">
                          {new Date(relatedPost.publishedAt).toLocaleDateString()}
                        </div>
                        <Link to={`/blog/${relatedPost.slug}`}>
                          <Button size="sm" className="gradient-primary text-primary-foreground hover:shadow-lg">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <Card className="glass-effect border-border/50">
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Ready to Try TextWeaver Pro?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Experience the power of AI-driven document translation. Start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" className="gradient-primary text-primary-foreground hover:shadow-lg">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/features">
                    <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default BlogSingle;
