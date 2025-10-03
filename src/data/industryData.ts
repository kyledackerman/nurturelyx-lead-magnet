export interface IndustryData {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  painPoints: string[];
  avgConversionRate: number;
  avgTransactionValue: number;
  benefits: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const industryData: Record<string, IndustryData> = {
  hvac: {
    id: 'hvac',
    name: 'HVAC',
    headline: 'Recover Lost HVAC Service Calls',
    subheadline: 'Turn anonymous website visitors into qualified HVAC leads. Track, identify, and convert heating and cooling prospects automatically.',
    painPoints: [
      '72% of HVAC website visitors leave without contacting you',
      'Average HVAC company loses $127k/year in missed opportunities',
      'Peak season traffic = wasted ad spend without follow-up',
      'Emergency service calls slip through the cracks'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 8500,
    benefits: [
      'Identify companies needing HVAC maintenance before they leave your site',
      'Automatic follow-up for emergency service requests',
      'Track peak season traffic patterns',
      'Convert more maintenance contract opportunities'
    ],
    faqs: [
      {
        question: 'How does visitor identification work for HVAC companies?',
        answer: 'Our tracking pixel identifies business visitors to your HVAC website, revealing company names, contact information, and service needs even if they don\'t fill out a form.'
      },
      {
        question: 'What information do I get about HVAC prospects?',
        answer: 'You receive company name, industry, location, contact details, pages visited, time on site, and service interest indicators - perfect for prioritizing hot HVAC leads.'
      },
      {
        question: 'Can I track emergency service call traffic?',
        answer: 'Yes! See which companies visited your emergency HVAC pages, when they visited, and their contact info - even if they called a competitor instead.'
      },
      {
        question: 'How quickly can I start identifying HVAC leads?',
        answer: 'Installation takes 5 minutes. You\'ll start seeing identified visitors within 24 hours.'
      },
      {
        question: 'Does this work during peak HVAC season?',
        answer: 'Absolutely. Track all your summer cooling and winter heating traffic spikes to maximize seasonal revenue.'
      }
    ]
  },
  legal: {
    id: 'legal',
    name: 'Legal Services',
    headline: 'Convert Anonymous Legal Prospects Into Clients',
    subheadline: 'Identify law firms and businesses researching your legal services. Never lose a potential client again.',
    painPoints: [
      '89% of legal website visitors research without contacting',
      'High-value cases slip away due to lack of follow-up',
      'Expensive legal marketing with unknown ROI',
      'Competitors follow up faster with warm leads'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 25000,
    benefits: [
      'Identify companies researching legal services',
      'Track practice area interest (corporate, litigation, etc.)',
      'Priority follow-up on high-value case prospects',
      'Measure true marketing ROI by client acquisition'
    ],
    faqs: [
      {
        question: 'How can visitor tracking help my law firm?',
        answer: 'Identify businesses researching your practice areas, see exactly what legal services they\'re interested in, and follow up before they contact competitors.'
      },
      {
        question: 'Is visitor identification compliant with legal ethics rules?',
        answer: 'Yes. Our system only identifies business visitors using publicly available data - no confidential client information is collected or stored.'
      },
      {
        question: 'What data do I receive about legal prospects?',
        answer: 'Company name, industry, decision-maker contacts, practice areas viewed, time spent researching, and urgency indicators.'
      },
      {
        question: 'Can I track specific practice area interest?',
        answer: 'Yes! See which prospects viewed corporate law vs litigation vs IP pages to prioritize your business development.'
      },
      {
        question: 'How does this integrate with my legal CRM?',
        answer: 'Export identified prospects directly to your CRM or receive daily email reports with new legal leads.'
      }
    ]
  },
  'real-estate': {
    id: 'real-estate',
    name: 'Real Estate',
    headline: 'Turn Property Browsers Into Buyers',
    subheadline: 'Identify who\'s viewing your listings and property pages. Follow up with serious buyers before your competition.',
    painPoints: [
      '94% of property website visitors browse anonymously',
      'Hot buyers view listings but never inquire',
      'Open house traffic without contact information',
      'Lost deals due to slow follow-up'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 15000,
    benefits: [
      'Identify businesses relocating or expanding',
      'Track which properties attract serious interest',
      'Follow up with buyers viewing multiple listings',
      'Commercial real estate lead intelligence'
    ],
    faqs: [
      {
        question: 'How does visitor identification work for real estate?',
        answer: 'Our pixel identifies business visitors viewing your listings, revealing company details and contact info even without form submissions.'
      },
      {
        question: 'Can I see which properties prospects are interested in?',
        answer: 'Yes! Track exactly which listings each identified visitor viewed, how long they spent, and if they returned multiple times.'
      },
      {
        question: 'Does this work for commercial real estate?',
        answer: 'Absolutely. Perfect for CRE brokers to identify companies searching for office space, warehouses, or retail locations.'
      },
      {
        question: 'What about residential real estate agents?',
        answer: 'While most effective for commercial, it also identifies businesses (relocation companies, investors) browsing residential properties.'
      },
      {
        question: 'How quickly can I follow up with identified prospects?',
        answer: 'Real-time notifications when high-intent visitors view your listings. Strike while interest is hot.'
      }
    ]
  },
  'home-services': {
    id: 'home-services',
    name: 'Home Services',
    headline: 'Capture Every Home Service Lead',
    subheadline: 'Identify homeowners and property managers visiting your site. Convert plumbing, roofing, and remodeling traffic into booked jobs.',
    painPoints: [
      '81% of home service website visitors never call or submit a form',
      'Emergency requests go to faster-responding competitors',
      'Seasonal traffic spikes with poor conversion',
      'Lost revenue from comparison shoppers'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 6500,
    benefits: [
      'Identify property management companies needing contractors',
      'Track emergency service page visitors',
      'Follow up with quote request abandoners',
      'Seasonal campaign ROI tracking'
    ],
    faqs: [
      {
        question: 'What home service businesses benefit most from visitor identification?',
        answer: 'Plumbers, roofers, flooring companies, remodelers, landscapers, and any home service business with a website generating traffic.'
      },
      {
        question: 'Can I identify emergency service visitors?',
        answer: 'Yes! See which businesses visited your emergency pages, when they visited, and their contact info for immediate follow-up.'
      },
      {
        question: 'How does this help with seasonal businesses?',
        answer: 'Track all your peak season traffic (roofing in storm season, landscaping in spring) to maximize revenue during busy periods.'
      },
      {
        question: 'What information do I get about home service leads?',
        answer: 'Company name, property location, service interest, contact details, and urgency indicators based on browsing behavior.'
      },
      {
        question: 'Does this work for residential customers?',
        answer: 'Our system primarily identifies business visitors (property managers, facilities managers), which are often higher-value recurring clients.'
      }
    ]
  },
  automotive: {
    id: 'automotive',
    name: 'Automotive',
    headline: 'Identify Car Buyers Before They Visit The Dealership',
    subheadline: 'Track fleet managers, car shoppers, and service customers browsing your dealership website.',
    painPoints: [
      '78% of automotive website visitors research but never contact',
      'Fleet sales opportunities lost to lack of follow-up',
      'Service department traffic without appointments',
      'Expensive automotive ads with unknown visitor identity'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 45000,
    benefits: [
      'Identify fleet managers researching bulk purchases',
      'Track which vehicle models attract most interest',
      'Service department lead generation',
      'Commercial vehicle sales intelligence'
    ],
    faqs: [
      {
        question: 'How can dealerships use visitor identification?',
        answer: 'Identify businesses researching fleet vehicles, service departments tracking maintenance needs, and commercial buyers comparing models.'
      },
      {
        question: 'What automotive prospects can I identify?',
        answer: 'Fleet managers, business owners researching commercial vehicles, companies needing service, and B2B automotive buyers.'
      },
      {
        question: 'Can I see which vehicles prospects are interested in?',
        answer: 'Yes! Track exactly which make/model pages each visitor viewed and how long they spent researching specifications.'
      },
      {
        question: 'Does this work for auto service centers?',
        answer: 'Absolutely. Identify businesses visiting your service pages, even if they don\'t book appointments online.'
      },
      {
        question: 'How does this help with fleet sales?',
        answer: 'Identify companies researching fleet vehicles before they contact your competitors. Critical for high-value fleet deals.'
      }
    ]
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    headline: 'Identify Healthcare Organizations Researching Your Services',
    subheadline: 'Track B2B healthcare prospects, medical device buyers, and healthcare facilities visiting your website.',
    painPoints: [
      '86% of healthcare B2B website visitors research anonymously',
      'Medical device sales cycles with unknown prospects',
      'Healthcare facility purchasing decisions without contact',
      'Lost opportunities in medical supply and service sales'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 75000,
    benefits: [
      'Identify hospitals and clinics researching medical equipment',
      'Track healthcare facility decision-makers',
      'B2B medical device sales intelligence',
      'Healthcare IT and software buyer identification'
    ],
    faqs: [
      {
        question: 'How does visitor identification work for healthcare businesses?',
        answer: 'We identify healthcare organizations (hospitals, clinics, medical practices) visiting your B2B healthcare website, revealing decision-maker contacts.'
      },
      {
        question: 'Is this HIPAA compliant?',
        answer: 'Yes. We only identify business visitors researching B2B healthcare products/services - no patient data is collected.'
      },
      {
        question: 'What healthcare prospects can I identify?',
        answer: 'Hospitals, clinics, medical practices, healthcare facilities, medical device buyers, and healthcare IT decision-makers.'
      },
      {
        question: 'Can I track interest in specific medical products?',
        answer: 'Yes! See which healthcare organizations viewed specific product pages, pricing info, and technical specifications.'
      },
      {
        question: 'How does this help medical device sales?',
        answer: 'Identify healthcare facilities researching your devices before they issue RFPs, allowing proactive sales outreach.'
      }
    ]
  }
};

export const getIndustryData = (industryId: string): IndustryData | undefined => {
  return industryData[industryId];
};

export const getAllIndustries = (): IndustryData[] => {
  return Object.values(industryData);
};
