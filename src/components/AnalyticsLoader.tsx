import { useEffect } from 'react';

/**
 * Loads third-party analytics scripts dynamically
 * This component should be mounted on all pages except /auth to avoid interference
 */
export const AnalyticsLoader = () => {
  useEffect(() => {
    // Google Tag Manager
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-T9J5XDZM');`;
    document.head.appendChild(gtmScript);

    // GTM noscript fallback
    const gtmNoscript = document.createElement('noscript');
    gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T9J5XDZM"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(gtmNoscript, document.body.firstChild);

    // Consolidata Analytics
    const consolidataDiv = document.createElement('div');
    consolidataDiv.id = 'consolidata-hm-script-loader';
    document.body.appendChild(consolidataDiv);

    const consolidataScript = document.createElement('script');
    consolidataScript.id = 'consolidata-hm-23-domain-name';
    consolidataScript.setAttribute('consolidata-hm-23-data-name', '2009381758975992-494');
    consolidataScript.type = 'text/javascript';
    consolidataScript.src = 'https://ms1.consolidata.ai/analytics/script-loader/2009381758975992-494';
    document.body.appendChild(consolidataScript);

    // Visitor Edge
    const visitorEdgeScript = document.createElement('script');
    visitorEdgeScript.async = true;
    visitorEdgeScript.src = 'https://api.visitoredge.com/api/website/run-cookie-script';
    document.body.appendChild(visitorEdgeScript);

    // Cleanup
    return () => {
      // Remove scripts on unmount
      if (gtmScript.parentNode) gtmScript.parentNode.removeChild(gtmScript);
      if (gtmNoscript.parentNode) gtmNoscript.parentNode.removeChild(gtmNoscript);
      if (consolidataDiv.parentNode) consolidataDiv.parentNode.removeChild(consolidataDiv);
      if (consolidataScript.parentNode) consolidataScript.parentNode.removeChild(consolidataScript);
      if (visitorEdgeScript.parentNode) visitorEdgeScript.parentNode.removeChild(visitorEdgeScript);
    };
  }, []);

  return null;
};
