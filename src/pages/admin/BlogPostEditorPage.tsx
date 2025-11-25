import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { MarkdownEditor } from "@/components/admin/blog/MarkdownEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category_id: string | null;
  author_id: string | null;
  status: string;
  published_at: string | null;
  read_time: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image: string;
  keywords: string[];
  related_reports: string[];
  key_takeaways: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
}

export default function BlogPostEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  
  const [post, setPost] = useState<BlogPost>({
    slug: '',
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category_id: null,
    author_id: null,
    status: 'draft',
    published_at: null,
    read_time: '5 min',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    og_image: '',
    keywords: [],
    related_reports: [],
    key_takeaways: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    if (!isNew) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('id, name, slug')
      .order('name');
    setCategories(data || []);
  };

  const fetchAuthors = async () => {
    const { data } = await supabase
      .from('blog_authors')
      .select('id, name')
      .order('name');
    setAuthors(data || []);
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      setSaving(true);

      // Generate slug from title if empty
      const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const postData = {
        ...post,
        slug,
        status: publish ? 'published' : post.status,
        published_at: publish ? new Date().toISOString() : post.published_at,
        meta_title: post.meta_title || post.title,
        meta_description: post.meta_description || post.excerpt,
      };

      if (isNew) {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast.success('Post created successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Post updated successfully');
      }

      navigate('/admin?tab=blog');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BlogPost, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <Header />
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin?tab=blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isNew ? 'Create New Post' : 'Edit Post'}</CardTitle>
            <CardDescription>Write and publish blog content with full SEO control</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="meta">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={post.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter post title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={post.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="url-friendly-slug (auto-generated if empty)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={post.excerpt}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    placeholder="Short description (shown in listings)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content *</Label>
                  <MarkdownEditor
                    value={post.content}
                    onChange={(value) => updateField('content', value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={post.meta_title}
                    onChange={(e) => updateField('meta_title', e.target.value)}
                    placeholder="SEO title (defaults to post title)"
                  />
                  <p className="text-xs text-muted-foreground">Max 60 characters recommended</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={post.meta_description}
                    onChange={(e) => updateField('meta_description', e.target.value)}
                    placeholder="SEO description (defaults to excerpt)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Max 160 characters recommended</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={post.canonical_url}
                    onChange={(e) => updateField('canonical_url', e.target.value)}
                    placeholder="https://x1.nurturely.io/blog/post-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_image">OG Image URL</Label>
                  <Input
                    id="og_image"
                    value={post.og_image}
                    onChange={(e) => updateField('og_image', e.target.value)}
                    placeholder="https://... (social media preview image)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={post.keywords?.join(', ')}
                    onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()))}
                    placeholder="lead generation, visitor identification, B2B"
                  />
                </div>
              </TabsContent>

              <TabsContent value="meta" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={post.category_id || undefined} onValueChange={(value) => updateField('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Select value={post.author_id || undefined} onValueChange={(value) => updateField('author_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map(author => (
                          <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="read_time">Read Time</Label>
                  <Input
                    id="read_time"
                    value={post.read_time}
                    onChange={(e) => updateField('read_time', e.target.value)}
                    placeholder="5 min"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={post.featured_image}
                    onChange={(e) => updateField('featured_image', e.target.value)}
                    placeholder="https://... (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key_takeaways">Key Takeaways (one per line)</Label>
                  <Textarea
                    id="key_takeaways"
                    value={post.key_takeaways?.join('\n')}
                    onChange={(e) => updateField('key_takeaways', e.target.value.split('\n').filter(t => t.trim()))}
                    placeholder="Enter key takeaways, one per line"
                    rows={5}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminAuthGuard>
  );
}