import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPost } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen py-16">
          <div className="container max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | NurturelyX Blog</title>
        <meta name="description" content={post.metaDescription} />
      </Helmet>

      <Header />
      <main className="min-h-screen py-16">
        <article className="container max-w-4xl">
          <Button asChild variant="ghost" className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <div className="mb-8">
            <div className="text-sm text-primary font-semibold mb-2">{post.category}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
              <div>By {post.author}</div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Button asChild size="lg" className="gradient-bg">
              <Link to="/">Calculate Your Lost Revenue</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
