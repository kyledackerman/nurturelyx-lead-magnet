import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { getBlogPost } from "@/data/blogPosts";

interface RelatedArticlesProps {
  relatedSlugs: string[];
}

export const RelatedArticles = ({ relatedSlugs }: RelatedArticlesProps) => {
  const relatedPosts = relatedSlugs
    .map(slug => getBlogPost(slug))
    .filter(post => post !== undefined)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="text-sm text-primary font-semibold mb-2">{post.category}</div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{post.metaDescription}</CardDescription>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
