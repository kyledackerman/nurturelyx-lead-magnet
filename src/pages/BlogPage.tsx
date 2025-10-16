import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllBlogPosts } from "@/data/blogPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";

export default function BlogPage() {
  usePageViewTracking('marketing');
  const posts = getAllBlogPosts();

  return (
    <>
      <MetaTags
        title="Blog - Lead Generation & Visitor Identification Insights | NurturelyX"
        description="Expert insights on B2B lead generation, visitor identification, and converting anonymous website traffic into qualified leads."
        canonical="https://x1.nurturely.io/blog"
        keywords="B2B lead generation blog, visitor identification insights, anonymous traffic conversion, lead gen best practices"
      />

      <ItemListSchema
        items={posts.map(post => ({
          name: post.title,
          url: `/blog/${post.slug}`,
          description: post.metaDescription,
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
            {posts.map((post) => (
              <article key={post.slug}>
                <Link to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-sm text-primary font-semibold mb-2">{post.category}</div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{post.metaDescription}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
