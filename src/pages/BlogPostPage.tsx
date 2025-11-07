import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPost, BlogPost } from "@/data/blogPosts";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
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
import { scrollToTop } from "@/lib/scroll";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getAuthorById } from "@/data/authors";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { KeyTakeaways } from "@/components/blog/KeyTakeaways";

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

  const author = getAuthorById(post.author);
  const canonicalUrl = `https://x1.nurturely.io/blog/${post.slug}`;
  
  // Convert read time to ISO 8601 duration (e.g., "12 min" -> "PT12M")
  const readTimeMinutes = parseInt(post.readTime.match(/\d+/)?.[0] || "5");
  const timeRequired = `PT${readTimeMinutes}M`;
  
  // Calculate word count from content
  const wordCount = post.content.split(/\s+/).length;
  
  // Generate abstract from meta description
  const abstract = post.metaDescription;

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
      
      <WebPageSchema
        name={post.title}
        description={post.metaDescription}
        url={canonicalUrl}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        image={post.featuredImage}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.category, url: `/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}` },
          { name: post.title, url: `/blog/${post.slug}` }
        ]}
      />
      
      <PersonSchema
        name={author.name}
        jobTitle={author.jobTitle}
        url={`https://x1.nurturely.io/author/${author.id}`}
        knowsAbout={author.expertise}
        sameAs={author.socialLinks ? Object.values(author.socialLinks).filter(Boolean) : undefined}
        description={author.bio}
      />
      
      <ArticleSchema
        title={post.title}
        description={post.metaDescription}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        author={author.name}
        authorUrl={`https://x1.nurturely.io/author/${author.id}`}
        authorJobTitle={author.jobTitle}
        url={canonicalUrl}
        imageUrl={post.featuredImage}
        category={post.category}
        wordCount={wordCount}
        timeRequired={timeRequired}
        abstract={abstract}
      />
      
      <SpeakableSchema />
      
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://x1.nurturely.io/' },
          { name: 'Blog', url: 'https://x1.nurturely.io/blog' },
          { name: post.category, url: `https://x1.nurturely.io/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}` },
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
              { label: post.category, href: `/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}` },
              { label: post.title, href: `/blog/${post.slug}` }
            ]}
          />

          <div className="mb-8">
            <div className="text-sm text-primary font-semibold mb-2">{post.category}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-md font-medium">
                  Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{post.readTime} read</span>
              </div>
              <div className="text-sm">By {author.name}</div>
            </div>
          </div>

          {post.keyTakeaways && <KeyTakeaways takeaways={post.keyTakeaways} />}

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

          <AuthorBio author={author} />

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

          <RelatedArticles relatedSlugs={post.relatedArticles} />

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
