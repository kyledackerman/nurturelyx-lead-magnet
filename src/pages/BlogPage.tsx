import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { GlobalSchemas } from "@/components/seo/GlobalSchemas";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { toast } from "sonner";

interface BlogPost {
  slug: string;
  title: string;
  meta_description: string;
  published_at: string;
  read_time: string;
  category: { name: string } | null;
}

export default function BlogPage() {
  usePageViewTracking('marketing');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          slug,
          title,
          meta_description,
          published_at,
          read_time,
          category:blog_categories(name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalSchemas />
      
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" }
      ]} />
      
      <MetaTags
        title="B2B Lead Generation Blog 2025 | Visitor ID Strategies - NurturelyX"
        description="Expert insights on B2B lead generation, visitor identification, and converting anonymous website traffic into qualified leads."
        canonical="https://x1.nurturely.io/blog"
        keywords="B2B lead generation blog, visitor identification insights, anonymous traffic conversion, lead gen best practices"
      />

      <ItemListSchema
        items={posts.map(post => ({
          name: post.title,
          url: `/blog/${post.slug}`,
          description: post.meta_description,
        }))}
        listName="NurturelyX Blog Articles"
        description="Expert articles on visitor identification and lead generation"
      />

      <WebPageSchema
        name="NurturelyX Blog"
        description="Expert insights on turning anonymous visitors into qualified leads"
        url="https://x1.nurturely.io/blog"
        breadcrumbs={[
          { name: "Blog", url: "/blog" }
        ]}
        keywords={["lead generation blog", "visitor identification", "B2B marketing", "anonymous traffic"]}
      />

      <Header />
      
      <main className="min-h-screen py-16">
        <div className="container max-w-6xl">
          <Breadcrumb items={[
            { label: "Blog", href: "/blog" }
          ]} />
          
          <div className="text-center mb-12 mt-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NurturelyX Blog</h1>
            <p className="text-xl text-muted-foreground">
              Expert insights on turning anonymous visitors into qualified leads
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No posts available yet.
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.slug}>
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="text-sm text-primary font-semibold mb-2">
                        {post.category?.name || 'Uncategorized'}
                      </div>
                      <CardTitle className="text-xl hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{post.meta_description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.published_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.read_time}
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
