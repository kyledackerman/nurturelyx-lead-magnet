import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface SEOPage {
  id?: string;
  page_path: string;
  page_name: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image: string;
  keywords: string[];
  robots_meta: string;
}

const DEFAULT_PAGES = [
  { page_path: '/', page_name: 'Homepage' },
  { page_path: '/pricing', page_name: 'Pricing' },
  { page_path: '/how-it-works', page_name: 'How It Works' },
  { page_path: '/learn', page_name: 'Learn' },
];

export const SEOSettingsManager = () => {
  const [pages, setPages] = useState<Record<string, SEOPage>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_page_settings')
        .select('*');

      if (error) throw error;

      const pagesMap: Record<string, SEOPage> = {};
      
      // Initialize with defaults
      DEFAULT_PAGES.forEach(page => {
        pagesMap[page.page_path] = {
          page_path: page.page_path,
          page_name: page.page_name,
          meta_title: '',
          meta_description: '',
          canonical_url: '',
          og_image: '',
          keywords: [],
          robots_meta: 'index,follow',
        };
      });

      // Merge with existing data
      data?.forEach(page => {
        pagesMap[page.page_path] = {
          ...page,
          keywords: page.keywords || [],
        };
      });

      setPages(pagesMap);
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pagePath: string) => {
    try {
      setSaving(pagePath);
      const pageData = pages[pagePath];

      const { error } = await supabase
        .from('seo_page_settings')
        .upsert({
          ...pageData,
          page_path: pagePath,
        }, {
          onConflict: 'page_path'
        });

      if (error) throw error;
      toast.success('SEO settings saved successfully');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(null);
    }
  };

  const updatePage = (pagePath: string, field: keyof SEOPage, value: any) => {
    setPages(prev => ({
      ...prev,
      [pagePath]: {
        ...prev[pagePath],
        [field]: value,
      }
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading SEO settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Page Settings</CardTitle>
        <CardDescription>Manage meta tags and SEO settings for key pages</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="/" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {DEFAULT_PAGES.map(page => (
              <TabsTrigger key={page.page_path} value={page.page_path}>
                {page.page_name}
              </TabsTrigger>
            ))}
          </TabsList>

          {DEFAULT_PAGES.map(page => {
            const pageData = pages[page.page_path];
            if (!pageData) return null;

            return (
              <TabsContent key={page.page_path} value={page.page_path} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${page.page_path}`}>Meta Title</Label>
                  <Input
                    id={`title-${page.page_path}`}
                    value={pageData.meta_title}
                    onChange={(e) => updatePage(page.page_path, 'meta_title', e.target.value)}
                    placeholder="SEO title (max 60 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${page.page_path}`}>Meta Description</Label>
                  <Textarea
                    id={`description-${page.page_path}`}
                    value={pageData.meta_description}
                    onChange={(e) => updatePage(page.page_path, 'meta_description', e.target.value)}
                    placeholder="SEO description (max 160 characters)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`canonical-${page.page_path}`}>Canonical URL</Label>
                  <Input
                    id={`canonical-${page.page_path}`}
                    value={pageData.canonical_url}
                    onChange={(e) => updatePage(page.page_path, 'canonical_url', e.target.value)}
                    placeholder={`https://x1.nurturely.io${page.page_path}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`og-image-${page.page_path}`}>OG Image URL</Label>
                  <Input
                    id={`og-image-${page.page_path}`}
                    value={pageData.og_image}
                    onChange={(e) => updatePage(page.page_path, 'og_image', e.target.value)}
                    placeholder="https://... (social media preview image)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`keywords-${page.page_path}`}>Keywords (comma-separated)</Label>
                  <Input
                    id={`keywords-${page.page_path}`}
                    value={pageData.keywords?.join(', ')}
                    onChange={(e) => updatePage(page.page_path, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`robots-${page.page_path}`}>Robots Meta</Label>
                  <Input
                    id={`robots-${page.page_path}`}
                    value={pageData.robots_meta}
                    onChange={(e) => updatePage(page.page_path, 'robots_meta', e.target.value)}
                    placeholder="index,follow"
                  />
                </div>

                <Button
                  onClick={() => handleSave(page.page_path)}
                  disabled={saving === page.page_path}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === page.page_path ? 'Saving...' : 'Save Settings'}
                </Button>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};