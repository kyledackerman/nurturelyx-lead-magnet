import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPost, BlogPost } from "@/data/blogPosts";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { scrollToTopIfHomeLink } from "@/lib/scroll";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { RelatedArticles } from "@/components/blog/RelatedArticles";

export default function BlogPostPage() {
  usePageViewTracking('marketing');
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
        
        {/* Canonical Tag */}
        <link rel="canonical" href={`https://x1.nurturely.io/blog/${post.slug}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={`https://x1.nurturely.io/blog/${post.slug}`} />
        <meta property="og:image" content={post.featuredImage || 'https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png'} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content={post.featuredImage || 'https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png'} />
      </Helmet>
      
      <ArticleSchema
        title={post.title}
        description={post.metaDescription}
        publishedAt={post.publishedAt}
        author={post.author}
        url={`https://x1.nurturely.io/blog/${post.slug}`}
      />

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

          <RelatedArticles relatedSlugs={post.relatedArticles} />

          <div className="mt-12 pt-8 border-t">
            <Button asChild size="lg" className="gradient-bg" onClick={scrollToTopIfHomeLink}>
              <Link to="/">Calculate Your Lost Revenue</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
