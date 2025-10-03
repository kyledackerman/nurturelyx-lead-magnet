import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllBlogPosts } from "@/data/blogPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";

export default function BlogPage() {
  usePageViewTracking('marketing');
  const posts = getAllBlogPosts();

  return (
    <>
      <Helmet>
        <title>Blog - Lead Generation & Visitor Identification Insights | NurturelyX</title>
        <meta name="description" content="Expert insights on B2B lead generation, visitor identification, and converting anonymous website traffic into qualified leads." />
      </Helmet>

      <Header />
      <main className="min-h-screen py-16">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NurturelyX Blog</h1>
            <p className="text-xl text-muted-foreground">
              Expert insights on turning anonymous visitors into qualified leads
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
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
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
