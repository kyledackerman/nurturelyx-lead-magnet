import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

// Simple client-side hash for privacy
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const usePageViewTracking = (pageType: 'report' | 'marketing', reportId?: string) => {
  const location = useLocation();

  useEffect(() => {
    const recordPageView = async () => {
      try {
        // Get client IP (will be captured server-side in production)
        const clientIP = 'browser';
        
        // Generate session ID (persist across page views)
        let sessionId = sessionStorage.getItem('visitor_session_id');
        if (!sessionId) {
          sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('visitor_session_id', sessionId);
        }

        await supabase.from('report_views').insert({
          report_id: reportId || null,
          page_path: location.pathname,
          page_type: pageType,
          ip_address_hash: hashString(clientIP + navigator.userAgent),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          session_id: sessionId
        });

        console.log(`📊 Page view tracked: ${location.pathname} (${pageType})`);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    recordPageView();
  }, [location.pathname, pageType, reportId]);
};
