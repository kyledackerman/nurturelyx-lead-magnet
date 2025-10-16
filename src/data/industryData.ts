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
  testimonials?: Array<{
    quote: string;
    name: string;
    company: string;
    industry: string;
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
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your HVAC business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR HVAC services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How does visitor identification work for HVAC companies?',
        answer: 'Our identity resolution technology identifies business visitors to your HVAC website, revealing company names, contact information, and service needs even if they don\'t fill out a form. This is YOUR visitor data from YOUR website that we help you unlock.'
      },
      {
        question: 'What information do I get about HVAC prospects?',
        answer: 'You receive company name, industry, location, contact details, pages visited, time on site, and service interest indicators - perfect for prioritizing hot HVAC leads.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors to your HVAC site. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "We discovered 247 HVAC contractors had visited our site in the past month. We had no idea. Now we're calling them.",
        name: "Mike R.",
        company: "Regional HVAC Supplier",
        industry: "HVAC"
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
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your legal services business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR legal services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How can visitor tracking help my law firm?',
        answer: 'Identify businesses researching your practice areas, see exactly what legal services they\'re interested in, and follow up before they contact competitors. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Is visitor identification compliant with legal ethics rules?',
        answer: 'Yes. Our system identifies YOUR website visitors using verified databases and public records - no confidential client information is collected or stored. This is YOUR first-party data under GDPR Article 6(1)(f) legitimate interest. You have the legal right to know who\'s researching your legal services.'
      },
      {
        question: 'What data do I receive about legal prospects?',
        answer: 'Company name, industry, decision-maker contacts, practice areas viewed, time spent researching, and urgency indicators - all from YOUR website traffic.'
      }
    ],
    testimonials: [
      {
        quote: "We found 89 businesses had researched our corporate law services. These are warm leads we would have completely missed otherwise.",
        name: "Sarah T.",
        company: "Mid-Size Law Firm",
        industry: "Legal Services"
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
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your real estate business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR properties, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How does visitor identification work for real estate?',
        answer: 'Our identity resolution technology identifies business visitors viewing your listings, revealing company details and contact info even without form submissions. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Can I see which properties prospects are interested in?',
        answer: 'Yes! Track exactly which listings each identified visitor viewed, how long they spent, and if they returned multiple times.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors viewing your properties. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "Found 156 businesses viewing our commercial properties. These are qualified leads we can actually call and close.",
        name: "David M.",
        company: "Commercial Real Estate Firm",
        industry: "Real Estate"
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
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your home services business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'What home service businesses benefit most from visitor identification?',
        answer: 'Plumbers, roofers, flooring companies, remodelers, landscapers, and any home service business with a website generating traffic. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Can I identify emergency service visitors?',
        answer: 'Yes! See which businesses visited your emergency pages, when they visited, and their contact info for immediate follow-up.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors to your home services site. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "This is our data—finally we can see it. First week we identified 89 warm leads we would have completely missed.",
        name: "Chris P.",
        company: "Commercial Roofing",
        industry: "Home Services"
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
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your automotive business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR vehicles/services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How can dealerships use visitor identification?',
        answer: 'Identify businesses researching fleet vehicles, service departments tracking maintenance needs, and commercial buyers comparing models. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'What automotive prospects can I identify?',
        answer: 'Fleet managers, business owners researching commercial vehicles, companies needing service, and B2B automotive buyers - all from YOUR website traffic.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors to your automotive site. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "Identified 67 fleet managers researching our commercial vehicles. These are 6-figure deals we wouldn't have known about.",
        name: "Tom B.",
        company: "Commercial Vehicle Dealer",
        industry: "Automotive"
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
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your healthcare business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR healthcare products/services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How does visitor identification work for healthcare businesses?',
        answer: 'We identify healthcare organizations (hospitals, clinics, medical practices) visiting your B2B healthcare website, revealing decision-maker contacts. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Is this HIPAA compliant?',
        answer: 'Yes. We identify YOUR website visitors researching B2B healthcare products/services using verified databases - no patient data is collected. This is YOUR first-party data under GDPR Article 6(1)(f) legitimate interest. You have the legal right to know who\'s researching your healthcare solutions.'
      },
      {
        question: 'What healthcare prospects can I identify?',
        answer: 'Hospitals, clinics, medical practices, healthcare facilities, medical device buyers, and healthcare IT decision-makers - all from YOUR website traffic.'
      }
    ],
    testimonials: [
      {
        quote: "Found 43 hospitals viewing our medical equipment pages. These are qualified B2B leads with real purchasing intent.",
        name: "Dr. Lisa K.",
        company: "Medical Device Manufacturer",
        industry: "Healthcare"
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
