import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { GlobalSchemas } from "@/components/seo/GlobalSchemas";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { PersonSchema } from "@/components/seo/PersonSchema";
import { SpeakableSchema } from "@/components/seo/SpeakableSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { InternalLinkingWidget } from "@/components/seo/InternalLinkingWidget";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { KeyTakeaways } from "@/components/blog/KeyTakeaways";
import { RelatedArticles } from "@/components/blog/RelatedArticles";

export default function BlogPostPage() {
  usePageViewTracking('marketing');
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, category:blog_categories(name, slug), author:blog_authors(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-16 text-center">Loading...</div>
        <Footer />
      </>
    );
  }

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

  const canonicalUrl = post.canonical_url || `https://x1.nurturely.io/blog/${post.slug}`;
  const author = post.author;
  
  // Convert read time to ISO 8601 duration (e.g., "12 min" -> "PT12M")
  const readTimeMinutes = parseInt(post.read_time?.match(/\d+/)?.[0] || "5");
  const timeRequired = `PT${readTimeMinutes}M`;
  
  // Calculate word count from content
  const wordCount = post.content.split(/\s+/).length;
  
  // Generate abstract from meta description
  const abstract = post.meta_description;
  
  const categoryName = post.category?.name || 'Uncategorized';

  return (
    <>
      <GlobalSchemas />
      
      <Helmet>
        <title>{post.title} | NurturelyX Blog</title>
        <meta name="description" content={post.meta_description} />
        <meta name="keywords" content={`${categoryName}, visitor identification, lead generation, B2B marketing, anonymous visitors`} />
        
        {/* Canonical Tag */}
        <link rel="canonical" href={`https://x1.nurturely.io/blog/${post.slug}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description} />
        <meta property="og:url" content={`https://x1.nurturely.io/blog/${post.slug}`} />
        <meta property="og:image" content={post.featured_image || 'https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png'} />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={author?.name} />
        <meta property="article:section" content={categoryName} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.meta_description} />
        <meta name="twitter:image" content={post.featured_image || 'https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png'} />
      </Helmet>
      
      <WebPageSchema
        name={post.title}
        description={post.meta_description}
        url={canonicalUrl}
        datePublished={post.published_at}
        dateModified={post.updated_at}
        image={post.featured_image}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: categoryName, url: `/blog/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}` },
          { name: post.title, url: `/blog/${post.slug}` }
        ]}
      />
      
      {author && (
        <PersonSchema
          name={author.name}
          jobTitle={author.job_title}
          url={`https://x1.nurturely.io/author/${author.id}`}
          knowsAbout={author.expertise || []}
          sameAs={[author.linkedin_url, author.twitter_url, author.website_url].filter(Boolean) as string[]}
          description={author.bio}
        />
      )}
      
      <ArticleSchema
        title={post.title}
        description={post.meta_description}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        author={author?.name || 'Anonymous'}
        authorUrl={author ? `https://x1.nurturely.io/author/${author.id}` : undefined}
        authorJobTitle={author?.job_title}
        url={canonicalUrl}
        imageUrl={post.featured_image}
        category={categoryName}
        wordCount={wordCount}
        timeRequired={timeRequired}
        abstract={abstract}
      />
      
      <SpeakableSchema />
      
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://x1.nurturely.io/' },
          { name: 'Blog', url: 'https://x1.nurturely.io/blog' },
          { name: categoryName, url: `https://x1.nurturely.io/blog/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}` },
          { name: post.title, url: `https://x1.nurturely.io/blog/${post.slug}` }
        ]}
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

          <Breadcrumb
            items={[
              { label: 'Blog', href: '/blog' },
              { label: categoryName, href: `/blog/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}` },
              { label: post.title, href: `/blog/${post.slug}` }
            ]}
          />

          <div className="mb-8">
            <div className="text-sm text-primary font-semibold mb-2">{categoryName}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {post.updated_at && post.updated_at !== post.published_at && (
                <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-md font-medium">
                  Updated: {new Date(post.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{post.read_time} read</span>
              </div>
              {author && <div className="text-sm">By {author.name}</div>}
            </div>
          </div>

                {post.key_takeaways && <KeyTakeaways takeaways={post.key_takeaways} />}
                
                <TableOfContents content={post.content} />

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = children?.toString() || '';
                  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                table: ({ children }) => (
                  <div className="markdown-table-wrapper overflow-x-auto my-6">
                    <table className="markdown-table w-full border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="markdown-thead">{children}</thead>
                ),
                th: ({ children, ...props }) => (
                  <th className="markdown-th border border-border bg-muted p-3 text-left font-semibold" {...props}>{children}</th>
                ),
                td: ({ children, ...props }) => (
                  <td className="markdown-td border border-border p-3 align-top" {...props}>{children}</td>
                ),
                tr: ({ children, ...props }) => (
                  <tr className="markdown-tr even:bg-accent/5" {...props}>{children}</tr>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {author && <AuthorBio author={author} />}

          <InternalLinkingWidget
            title="Continue Learning"
            links={[
              {
                title: "All Resources & Guides",
                href: "/resources",
                description: "Access our complete library of lead generation guides and tools"
              },
              {
                title: "Calculate Your Lost Revenue",
                href: "/",
                description: "Get a free report showing your missed opportunities"
              },
              {
                title: "How It Works",
                href: "/how-it-works",
                description: "Understand visitor identification technology"
              },
              {
                title: "Transparent Pricing",
                href: "/pricing",
                description: "Simple pricing: $1 per identified lead"
              }
            ]}
          />

          {post.related_articles && <RelatedArticles relatedSlugs={post.related_articles} />}

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
