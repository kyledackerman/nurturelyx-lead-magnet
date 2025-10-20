# OpenGraph Image Optimization Guide

## Current Status
The current OpenGraph (OG) image used across the site is:
- **Location**: `/public/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png`
- **URL**: `https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png`
- **Status**: ⚠️ NOT OPTIMIZED for SEO/Social sharing

## Required Optimizations

### 1. Image Dimensions
- **Current**: Unknown (needs verification)
- **Required**: **1200x630 pixels** (Facebook/LinkedIn recommended)
- **Aspect Ratio**: 1.91:1

### 2. File Size
- **Target**: **< 300KB** for fast loading
- **Format**: **WebP** (modern format with better compression)
- **Fallback**: PNG or JPG if WebP not supported

### 3. File Naming
- **Current**: `b1566634-1aeb-472d-8856-f526a0aa2392.png` (not SEO-friendly)
- **Recommended**: `nurturelyx-visitor-identification-og-image.webp`

### 4. Content Requirements
The OG image should include:
- ✅ NurturelyX logo/branding
- ✅ Clear value proposition text (e.g., "Identify Anonymous Website Visitors")
- ✅ High contrast for readability
- ✅ Mobile-friendly (text large enough when previewed on mobile)
- ✅ No important content in outer 10% (may be cropped on some platforms)

### 5. Page-Specific Images (Advanced)
For better SEO, create unique OG images for:
- **Home page**: General brand/value prop
- **Industry pages**: Industry-specific imagery (HVAC, Legal, Real Estate, etc.)
- **Blog posts**: Post-specific imagery with title overlay
- **Reports**: Report-specific with domain and revenue numbers

## Implementation Steps

### Step 1: Create the Optimized Image
```bash
# Use image editing software to:
1. Resize to 1200x630px
2. Add text overlay with key message
3. Export as WebP format
4. Compress to <300KB (tools: TinyPNG, Squoosh, ImageOptim)
```

### Step 2: Upload to Repository
```bash
# Save to public folder with descriptive name
public/og-images/nurturelyx-visitor-identification-og-image.webp
```

### Step 3: Update MetaTags Component
```typescript
// src/components/seo/MetaTags.tsx
// Change default from:
ogImage = "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png"

// To:
ogImage = "https://x1.nurturely.io/og-images/nurturelyx-visitor-identification-og-image.webp"
```

### Step 4: Create Industry-Specific Images (Optional)
```bash
# Create variations for each industry
public/og-images/nurturelyx-hvac-lead-generation.webp
public/og-images/nurturelyx-legal-services-leads.webp
public/og-images/nurturelyx-real-estate-leads.webp
# etc.
```

### Step 5: Update Industry Pages
```typescript
// Example for HVAC page:
<MetaTags
  ogImage="https://x1.nurturely.io/og-images/nurturelyx-hvac-lead-generation.webp"
  // ...other props
/>
```

## Testing Checklist

After optimization, test OG image appearance on:
- [ ] Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Slack (paste URL in a test channel)
- [ ] Discord (paste URL in a test channel)

## SEO Impact

Optimized OG images improve:
- **Click-Through Rate (CTR)**: 3-5x higher on social shares
- **Brand Recognition**: Consistent visual identity across platforms
- **Engagement**: Better performance on LinkedIn, Facebook, Twitter
- **Professional Appearance**: Shows attention to detail

## Tools & Resources

**Image Optimization**:
- Canva (design): https://canva.com
- Figma (design): https://figma.com
- Squoosh (compression): https://squoosh.app
- TinyPNG (compression): https://tinypng.com

**Testing Tools**:
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/
- Twitter Validator: https://cards-dev.twitter.com/validator

**Design Guidelines**:
- Facebook: https://developers.facebook.com/docs/sharing/webmasters/images
- Twitter: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
- LinkedIn: https://www.linkedin.com/help/linkedin/answer/a521928

## Current Implementation Status

✅ **Completed**:
- MetaTags component exists and is used across all pages
- OG meta tags are properly configured
- Twitter Card meta tags are configured
- Basic OG image is set site-wide

⚠️ **Needs Action**:
- Create optimized 1200x630px OG image
- Compress to <300KB WebP format
- Use descriptive filename
- Create industry-specific variations
- Test on all social platforms
- Update all pages to use new image(s)

## Priority: HIGH
This is a **Phase 2 Technical Enhancement** and should be completed before focusing on Phase 3 or Phase 4 activities.
